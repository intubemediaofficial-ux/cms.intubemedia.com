import { kv } from "@/lib/redis";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const USERS_KEY = "bainsla_users";

export interface NetworkAssignment {
  networkId: string;
  networkName: string;
  revenueSharePercent: number;
}

export interface ChannelNetworkAssignment {
  channelId: string;
  networkId: string;
  networkName: string;
  revenueSharePercent: number;
}

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  channels: string[];
  pendingChannels?: string[];
  status: "active" | "inactive" | "pending";
  joinedDate: string;
  category: string;
  role: "client" | "company";
  parentId?: string;
  networks?: NetworkAssignment[];
  channelNetworks?: ChannelNetworkAssignment[];
  customNetworks?: string[];
}

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Deprecated network names to auto-remove from user assignments
const DEPRECATED_NETWORK_NAMES = ["T-Series", "Sony Music", "InTubeMedia", "Other"];

async function getUsers(): Promise<StoredUser[]> {
  try {
    const users = await kv.get<StoredUser[]>(USERS_KEY);
    if (!users) return [];
    // Auto-cleanup: remove deprecated network names from user assignments
    let cleaned = false;
    for (const u of users) {
      if (u.networks?.length) {
        const before = u.networks.length;
        u.networks = u.networks.filter((n) => !DEPRECATED_NETWORK_NAMES.includes(n.networkName));
        if (u.networks.length !== before) cleaned = true;
      }
      if (u.channelNetworks?.length) {
        const before = u.channelNetworks.length;
        u.channelNetworks = u.channelNetworks.filter((cn) => !DEPRECATED_NETWORK_NAMES.includes(cn.networkName));
        if (u.channelNetworks.length !== before) cleaned = true;
      }
      if (u.customNetworks?.length) {
        const before = u.customNetworks.length;
        u.customNetworks = u.customNetworks.filter((cn) => !DEPRECATED_NETWORK_NAMES.includes(cn));
        if (u.customNetworks.length !== before) cleaned = true;
      }
    }
    if (cleaned) {
      await kv.set(USERS_KEY, users);
    }
    return users;
  } catch (error) {
    console.error("[Users] Failed to read from KV:", error);
    throw new Error(`KV read failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function saveUsers(users: StoredUser[]): Promise<boolean> {
  try {
    await kv.set(USERS_KEY, users);
    return true;
  } catch (error) {
    console.error("[Users] Failed to save to KV:", error);
    return false;
  }
}

const ADMIN_EMAILS = [
  "ajeetgurjarofficial@gmail.com",
  "bainslamusicofficial@gmail.com",
  "shivlalbainslaofficial@gmail.com",
];

async function isAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;
  return ADMIN_EMAILS.includes(session.user.email.toLowerCase());
}

async function isCompany(): Promise<{ isCompany: boolean; companyUser?: StoredUser }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { isCompany: false };
  const email = session.user.email.toLowerCase();
  if (ADMIN_EMAILS.includes(email)) return { isCompany: false };
  try {
    const users = await getUsers();
    const user = users.find((u) => u.email.toLowerCase() === email && u.role === "company");
    if (user) return { isCompany: true, companyUser: user };
  } catch { /* ignore */ }
  return { isCompany: false };
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const action = url.searchParams.get("action");

  // Non-admin: return only own user info (for fetching assigned networks etc.)
  if (action === "me") {
    try {
      const users = await getUsers();
      const me = users.find((u) => u.email.toLowerCase() === session.user!.email!.toLowerCase());
      if (!me) return Response.json({ data: null });
      const { password, ...safe } = me;
      return Response.json({ data: safe });
    } catch (error) {
      console.error("[Users GET me] Error:", error);
      return Response.json({ error: "Storage error", kvError: true, details: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
  }

  // Company: return only their own clients
  if (action === "myClients") {
    const { isCompany: isComp, companyUser } = await isCompany();
    if (!isComp || !companyUser) {
      return Response.json({ error: "Unauthorized — company access only" }, { status: 401 });
    }
    try {
      const users = await getUsers();
      const myClients = users.filter((u) => u.parentId === companyUser.id);
      const safeClients = myClients.map(({ password, ...u }) => u);
      return Response.json({ data: safeClients });
    } catch (error) {
      console.error("[Users GET myClients] Error:", error);
      return Response.json({ error: "Storage error", kvError: true }, { status: 500 });
    }
  }

  // Admin-only: return all users
  if (!(await isAdmin())) {
    // Companies can also access the full user list in read-only mode
    const { isCompany: isComp } = await isCompany();
    if (!isComp) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const users = await getUsers();
    const safeUsers = users.map(({ password, ...u }) => u);
    return Response.json({ data: safeUsers });
  } catch (error) {
    console.error("[Users GET] Error:", error);
    return Response.json({ error: "Failed to fetch users from storage", kvError: true, details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const admin = await isAdmin();
  const { isCompany: isComp, companyUser } = admin ? { isCompany: false, companyUser: undefined } : await isCompany();

  if (!admin && !isComp) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, email, password, phone, channels, category, networks, channelNetworks } = body;

    if (!name || !email || !password) {
      return Response.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const users = await getUsers();
    const exists = users.some(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (exists) {
      return Response.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Determine role: admin can create companies, companies create clients
    let newRole: "client" | "company" = "client";
    let parentId: string | undefined;
    if (admin && body.role === "company") {
      newRole = "company";
    } else if (isComp && companyUser) {
      newRole = "client";
      parentId = companyUser.id;
    }

    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashPassword(password),
      phone: phone?.trim() || "",
      channels: channels || [],
      status: "active",
      joinedDate: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      category: category || "Music",
      role: newRole,
      networks: networks || [],
      channelNetworks: channelNetworks || [],
      ...(parentId ? { parentId } : {}),
    };

    users.push(newUser);
    const saved = await saveUsers(users);
    if (!saved) {
      return Response.json(
        { error: "Failed to save user" },
        { status: 500 }
      );
    }

    const { password: _, ...safeUser } = newUser;
    return Response.json({ data: safeUser }, { status: 201 });
  } catch (error) {
    console.error("[Users] Error creating user:", error);
    return Response.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const admin = await isAdmin();
  const { isCompany: isComp, companyUser } = admin ? { isCompany: false, companyUser: undefined } : await isCompany();
  if (!admin && !isComp) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, name, email, password, phone, channels, category, status, networks, channelNetworks } = body;

    // Approve, reject, or unapprove a channel
    if (body.type === "approve_channel" || body.type === "reject_channel" || body.type === "unapprove_channel") {
      const { userId, channelId } = body;
      if (!userId || !channelId) {
        return Response.json({ error: "userId and channelId required" }, { status: 400 });
      }
      const users = await getUsers();
      const userIdx = users.findIndex((u) => u.id === userId);
      if (userIdx === -1) {
        return Response.json({ error: "User not found" }, { status: 404 });
      }

      if (body.type === "unapprove_channel") {
        // Move from channels to pendingChannels
        users[userIdx].channels = users[userIdx].channels.filter((c) => c !== channelId);
        if (!users[userIdx].pendingChannels) users[userIdx].pendingChannels = [];
        if (!users[userIdx].pendingChannels.includes(channelId)) {
          users[userIdx].pendingChannels.push(channelId);
        }
      } else {
        // Remove from pendingChannels
        users[userIdx].pendingChannels = (users[userIdx].pendingChannels || []).filter((c) => c !== channelId);
        // If approving, add to channels
        if (body.type === "approve_channel") {
          if (!users[userIdx].channels.includes(channelId)) {
            users[userIdx].channels.push(channelId);
          }
        }
      }
      const saved = await saveUsers(users);
      if (!saved) return Response.json({ error: "Failed to update" }, { status: 500 });
      return Response.json({ data: { success: true, action: body.type, channelId, user: users[userIdx].name } });
    }

    // Channel transfer between users
    if (body.type === "transfer_channel") {
      const { fromUserId, toUserId, channelId } = body;
      if (!fromUserId || !toUserId || !channelId) {
        return Response.json({ error: "fromUserId, toUserId, channelId required" }, { status: 400 });
      }
      const users = await getUsers();
      const fromIdx = users.findIndex((u) => u.id === fromUserId);
      const toIdx = users.findIndex((u) => u.id === toUserId);
      if (fromIdx === -1 || toIdx === -1) {
        return Response.json({ error: "User not found" }, { status: 404 });
      }
      users[fromIdx].channels = users[fromIdx].channels.filter((c) => c !== channelId);
      if (users[fromIdx].channelNetworks) {
        users[fromIdx].channelNetworks = users[fromIdx].channelNetworks!.filter((cn) => cn.channelId !== channelId);
      }
      if (!users[toIdx].channels.includes(channelId)) {
        users[toIdx].channels.push(channelId);
      }
      const saved = await saveUsers(users);
      if (!saved) return Response.json({ error: "Failed to transfer" }, { status: 500 });
      return Response.json({ data: { success: true, fromUser: users[fromIdx].name, toUser: users[toIdx].name, channelId } });
    }

    if (!id) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    const users = await getUsers();
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    if (name) users[idx].name = name.trim();
    if (email) users[idx].email = email.toLowerCase().trim();
    if (password) users[idx].password = hashPassword(password);
    if (phone !== undefined) users[idx].phone = (phone || "").trim();
    if (channels) users[idx].channels = channels;
    if (body.pendingChannels !== undefined) users[idx].pendingChannels = body.pendingChannels;
    if (category) users[idx].category = category;
    if (status) users[idx].status = status;
    if (networks !== undefined) users[idx].networks = networks;
    if (channelNetworks !== undefined) users[idx].channelNetworks = channelNetworks;
    // Only admin can change role
    if (admin && body.role && (body.role === "client" || body.role === "company")) {
      users[idx].role = body.role;
    }

    // Company can only update their own clients
    if (isComp && companyUser && users[idx].parentId !== companyUser.id) {
      return Response.json({ error: "You can only update your own clients" }, { status: 403 });
    }

    const saved = await saveUsers(users);
    if (!saved) {
      return Response.json(
        { error: "Failed to update user" },
        { status: 500 }
      );
    }

    const { password: _, ...safeUser } = users[idx];
    return Response.json({ data: safeUser });
  } catch (error) {
    console.error("[Users] Error updating user:", error);
    return Response.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// PATCH: Allow logged-in client to sync their localStorage channels to KV
// New channels go to pendingChannels (require admin approval)
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { channels, pendingChannels, removeChannels, customNetworks } = body;

    if (!Array.isArray(channels) && !Array.isArray(pendingChannels) && !Array.isArray(removeChannels) && !Array.isArray(customNetworks)) {
      return Response.json({ error: "channels, pendingChannels, removeChannels, or customNetworks array required" }, { status: 400 });
    }

    const users = await getUsers();
    const userEmail = session.user.email.toLowerCase();
    const idx = users.findIndex((u) => u.email.toLowerCase() === userEmail);

    if (idx === -1) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Remove channels from both approved and pending lists
    if (Array.isArray(removeChannels)) {
      const removeSet = new Set(removeChannels.filter((c: unknown) => typeof c === "string" && (c as string).length > 0));
      users[idx].channels = users[idx].channels.filter((ch) => !removeSet.has(ch));
      if (users[idx].pendingChannels) {
        users[idx].pendingChannels = users[idx].pendingChannels!.filter((ch) => !removeSet.has(ch));
      }
    }

    // If pendingChannels is provided, add new channels to pending list
    if (Array.isArray(pendingChannels)) {
      const validPending = pendingChannels.filter((c: unknown) => typeof c === "string" && (c as string).length > 0);
      const existingPending = new Set(users[idx].pendingChannels || []);
      const existingApproved = new Set(users[idx].channels);
      for (const ch of validPending) {
        if (!existingApproved.has(ch)) {
          existingPending.add(ch);
        }
      }
      users[idx].pendingChannels = Array.from(existingPending);
    }

    // If channels is provided (for backward compat — admin-approved channels)
    if (Array.isArray(channels)) {
      const validChannels = channels.filter((c: unknown) => typeof c === "string" && (c as string).length > 0);
      const existingChannels = new Set(users[idx].channels);
      for (const ch of validChannels) {
        existingChannels.add(ch);
      }
      const realChannels = Array.from(existingChannels).filter((ch) => {
        if (ch.startsWith("UCtest") || ch === "test") return false;
        return true;
      });
      users[idx].channels = realChannels.length > 0 ? realChannels : Array.from(existingChannels);
    }

    // Save custom network names
    if (Array.isArray(customNetworks)) {
      const validNetworks = customNetworks.filter((n: unknown) => typeof n === "string" && (n as string).trim().length > 0).map((n: unknown) => (n as string).trim());
      users[idx].customNetworks = [...new Set(validNetworks)];
    }

    const saved = await saveUsers(users);
    if (!saved) {
      return Response.json({ error: "Failed to sync channels" }, { status: 500 });
    }

    return Response.json({ data: { success: true, channels: users[idx].channels, pendingChannels: users[idx].pendingChannels || [], customNetworks: users[idx].customNetworks || [] } });
  } catch (error) {
    console.error("[Users] Error syncing channels:", error);
    return Response.json({ error: "Failed to sync channels" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const admin = await isAdmin();
  const { isCompany: isComp, companyUser } = admin ? { isCompany: false, companyUser: undefined } : await isCompany();
  if (!admin && !isComp) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    const users = await getUsers();

    // Company can only delete their own clients
    if (isComp && companyUser) {
      const target = users.find((u) => u.id === id);
      if (!target || target.parentId !== companyUser.id) {
        return Response.json({ error: "You can only delete your own clients" }, { status: 403 });
      }
    }

    const filtered = users.filter((u) => u.id !== id);

    if (filtered.length === users.length) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const saved = await saveUsers(filtered);
    if (!saved) {
      return Response.json(
        { error: "Failed to delete user" },
        { status: 500 }
      );
    }

    return Response.json({ data: { success: true } });
  } catch (error) {
    console.error("[Users] Error deleting user:", error);
    return Response.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
