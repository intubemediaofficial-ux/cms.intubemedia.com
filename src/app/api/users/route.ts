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
  role: "client";
  networks?: NetworkAssignment[];
  channelNetworks?: ChannelNetworkAssignment[];
}

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

async function getUsers(): Promise<StoredUser[]> {
  try {
    const users = await kv.get<StoredUser[]>(USERS_KEY);
    return users || [];
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

  // Admin-only: return all users
  if (!(await isAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
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
  if (!(await isAdmin())) {
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
      role: "client",
      networks: networks || [],
      channelNetworks: channelNetworks || [],
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
  if (!(await isAdmin())) {
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
    if (phone !== undefined) users[idx].phone = phone.trim();
    if (channels) users[idx].channels = channels;
    if (body.pendingChannels !== undefined) users[idx].pendingChannels = body.pendingChannels;
    if (category) users[idx].category = category;
    if (status) users[idx].status = status;
    if (networks !== undefined) users[idx].networks = networks;
    if (channelNetworks !== undefined) users[idx].channelNetworks = channelNetworks;

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
    const { channels, pendingChannels, removeChannels } = body;

    if (!Array.isArray(channels) && !Array.isArray(pendingChannels) && !Array.isArray(removeChannels)) {
      return Response.json({ error: "channels, pendingChannels, or removeChannels array required" }, { status: 400 });
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

    const saved = await saveUsers(users);
    if (!saved) {
      return Response.json({ error: "Failed to sync channels" }, { status: 500 });
    }

    return Response.json({ data: { success: true, channels: users[idx].channels, pendingChannels: users[idx].pendingChannels || [] } });
  } catch (error) {
    console.error("[Users] Error syncing channels:", error);
    return Response.json({ error: "Failed to sync channels" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    const users = await getUsers();
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
