import crypto from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAllCachedClientData } from "@/lib/client-data-cache";
import {
  getMonthlyChannelAnalytics,
  isValidMonth,
} from "@/lib/monthly-channel-analytics";
import { kv } from "@/lib/redis";
import { saveVendorGoogleSheetConfig } from "@/lib/vendor-google-sheet-config";
import { syncVendorGoogleSheet } from "@/lib/vendor-google-sheets";
import {
  ChannelVendorAssignment,
  getVendorAssignments,
  getVendors,
  saveVendorAssignments,
  saveVendors,
  Vendor,
} from "@/lib/vendors";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const USERS_KEY = "bainsla_users";
const ADMIN_EMAILS = [
  "ajeetgurjarofficial@gmail.com",
  "bainslamusicofficial@gmail.com",
  "shivlalbainslaofficial@gmail.com",
];

interface StoredUser {
  id: string;
  name: string;
  email: string;
  role: "client" | "company";
  parentId?: string;
  channels?: string[];
  pendingChannels?: string[];
  channelNetworks?: Array<{
    channelId: string;
    networkId: string;
    networkName: string;
    revenueSharePercent?: number;
  }>;
  status?: "active" | "inactive" | "pending";
}

interface VendorScope {
  email: string;
  isAdmin: boolean;
  currentUser: StoredUser | null;
  approvedChannelIds: Set<string>;
  manageableChannelIds: Set<string>;
  channelOwners: Map<string, StoredUser>;
  channelNetworks: Map<string, string>;
}

async function getScope(): Promise<VendorScope | null> {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase();
  if (!email || session?.user?.userStatus === "inactive") return null;

  const users = (await kv.get<StoredUser[]>(USERS_KEY)) || [];
  const isAdmin = ADMIN_EMAILS.includes(email);
  const currentUser = users.find((user) => user.email.toLowerCase() === email) || null;

  let scopedUsers: StoredUser[];
  if (isAdmin) {
    scopedUsers = users.filter((user) => user.status === "active");
  } else if (!currentUser || currentUser.status !== "active") {
    return null;
  } else if (currentUser.role === "company") {
    scopedUsers = [
      currentUser,
      ...users.filter(
        (user) => user.parentId === currentUser.id && user.status === "active"
      ),
    ];
  } else {
    scopedUsers = [currentUser];
  }

  const approvedChannelIds = new Set(scopedUsers.flatMap((user) => user.channels || []));
  const manageableChannelIds = new Set(
    scopedUsers.flatMap((user) => [
      ...(user.channels || []),
      ...(user.pendingChannels || []),
    ])
  );
  const channelOwners = new Map<string, StoredUser>();
  const channelNetworks = new Map<string, string>();
  for (const user of scopedUsers) {
    for (const channelId of user.channels || []) channelOwners.set(channelId, user);
    for (const assignment of user.channelNetworks || []) {
      channelNetworks.set(assignment.channelId, assignment.networkName);
    }
  }

  return {
    email,
    isAdmin,
    currentUser,
    approvedChannelIds,
    manageableChannelIds,
    channelOwners,
    channelNetworks,
  };
}

function getVisibleVendors(
  scope: VendorScope,
  vendors: Vendor[]
): Vendor[] {
  if (scope.isAdmin) return vendors;
  return vendors.filter(
    (vendor) => vendor.createdByUserId === scope.currentUser?.id
  );
}

function normalizeName(value: unknown): string {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

async function buildVendorReports(
  scope: VendorScope,
  vendors: Vendor[],
  assignments: ChannelVendorAssignment[],
  month: string
) {
  const [analytics, cachedClients] = await Promise.all([
    getMonthlyChannelAnalytics(month),
    getAllCachedClientData(),
  ]);
  const analyticsMap = new Map(
    analytics.channels.map((channel) => [channel.channel_id, channel])
  );
  const nameMap = new Map<string, string>();
  for (const client of cachedClients) {
    for (const channel of client.channels || []) {
      if (channel.channelTitle) nameMap.set(channel.channelId, channel.channelTitle);
    }
  }

  return vendors.map((vendor) => {
    const channelIds = assignments
      .filter(
        (assignment) =>
          assignment.vendorId === vendor.id &&
          scope.approvedChannelIds.has(assignment.channelId)
      )
      .map((assignment) => assignment.channelId);
    const channels = channelIds
      .map((channelId) => {
        const row = analyticsMap.get(channelId);
        const owner = scope.channelOwners.get(channelId);
        return {
          channel_id: channelId,
          channel_name: row?.channel_name || nameMap.get(channelId) || channelId,
          client_name: owner?.name || "",
          vendor_name: vendor.name,
          network_name: scope.channelNetworks.get(channelId) || "",
          revenue_usd: row?.revenue_usd || 0,
          views: row?.views || 0,
          synced_through: row?.synced_through || null,
          updated_at: row?.updated_at || null,
          available: Boolean(row),
        };
      })
      .sort((a, b) => a.channel_name.localeCompare(b.channel_name));

    return {
      month,
      vendor,
      channels,
      totals: {
        channels: channels.length,
        revenue_usd: channels.reduce((sum, channel) => sum + channel.revenue_usd, 0),
        views: channels.reduce((sum, channel) => sum + channel.views, 0),
      },
      cacheStatus: analytics.cacheStatus,
      missingChannels: channels.filter((channel) => !channel.available).length,
    };
  });
}

async function syncSheetAfterMutation() {
  try {
    return await syncVendorGoogleSheet();
  } catch (error) {
    console.error("[Vendors] Google Sheets sync failed:", error);
    return { status: "failed" as const };
  }
}

export async function GET(request: Request) {
  const scope = await getScope();
  if (!scope) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const action = url.searchParams.get("action") || "list";
  const [vendors, assignments] = await Promise.all([
    getVendors(),
    getVendorAssignments(),
  ]);
  const assignableVendors = getVisibleVendors(scope, vendors);
  const assignableVendorIds = new Set(assignableVendors.map((vendor) => vendor.id));
  const manageableAssignments = assignments.filter((assignment) =>
    scope.manageableChannelIds.has(assignment.channelId)
  );
  const assignedVendorIds = new Set(
    manageableAssignments.map((assignment) => assignment.vendorId)
  );
  const visibleVendors = scope.isAdmin
    ? vendors
    : vendors.filter(
        (vendor) =>
          assignableVendorIds.has(vendor.id) || assignedVendorIds.has(vendor.id)
      );
  const visibleVendorIds = new Set(visibleVendors.map((vendor) => vendor.id));
  const scopedAssignments = manageableAssignments.filter((assignment) =>
    visibleVendorIds.has(assignment.vendorId)
  );

  if (action === "list") {
    const counts = new Map<string, number>();
    for (const assignment of scopedAssignments) {
      if (!scope.approvedChannelIds.has(assignment.channelId)) continue;
      counts.set(assignment.vendorId, (counts.get(assignment.vendorId) || 0) + 1);
    }
    return Response.json({
      data: {
        vendors: visibleVendors
          .map((vendor) => ({
            ...vendor,
            channelCount: counts.get(vendor.id) || 0,
            canEdit: scope.isAdmin || assignableVendorIds.has(vendor.id),
            canAssign: scope.isAdmin || assignableVendorIds.has(vendor.id),
          }))
          .sort((a, b) => a.name.localeCompare(b.name)),
        assignments: manageableAssignments,
        assignedVendors: visibleVendors.map((vendor) => ({
          id: vendor.id,
          name: vendor.name,
        })),
      },
    });
  }

  if (action === "report" || action === "reports") {
    const vendorId = url.searchParams.get("vendorId") || "";
    const month = url.searchParams.get("month") || "";
    if (!isValidMonth(month) || (action === "report" && !vendorId)) {
      return Response.json(
        { error: action === "report" ? "vendorId and month=YYYY-MM are required" : "month=YYYY-MM is required" },
        { status: 400 }
      );
    }
    const reportVendors = action === "report"
      ? visibleVendors.filter((vendor) => vendor.id === vendorId)
      : visibleVendors;
    if (action === "report" && reportVendors.length === 0) {
      return Response.json({ error: "Vendor not found" }, { status: 404 });
    }
    const reports = await buildVendorReports(
      scope,
      reportVendors,
      scopedAssignments,
      month
    );
    return Response.json({ data: action === "report" ? reports[0] : { month, reports } });
  }

  return Response.json({ error: "Unknown action" }, { status: 400 });
}

export async function POST(request: Request) {
  const scope = await getScope();
  if (!scope) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const name = normalizeName(body.name);
  if (!name) return Response.json({ error: "Vendor name is required" }, { status: 400 });

  const vendors = await getVendors();
  const visible = getVisibleVendors(scope, vendors);
  const duplicate = visible.find(
    (vendor) => vendor.name.toLowerCase() === name.toLowerCase()
  );
  if (duplicate) {
    return Response.json({ error: "Vendor with this name already exists" }, { status: 409 });
  }

  const now = new Date().toISOString();
  const vendor: Vendor = {
    id: crypto.randomUUID(),
    name,
    createdByUserId: scope.isAdmin ? null : scope.currentUser?.id || null,
    createdByEmail: scope.email,
    createdAt: now,
    updatedAt: now,
  };
  await saveVendors([...vendors, vendor]);
  const sheetSync = await syncSheetAfterMutation();
  return Response.json({ data: vendor, sheetSync }, { status: 201 });
}

export async function PUT(request: Request) {
  const scope = await getScope();
  if (!scope) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const action = body.action;
  if (action === "configureSheet") {
    if (!scope.isAdmin) {
      return Response.json({ error: "Admin only" }, { status: 403 });
    }
    const spreadsheetInput =
      typeof body.spreadsheetId === "string" ? body.spreadsheetId.trim() : "";
    const spreadsheetId =
      spreadsheetInput.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/)?.[1] ||
      (/^[a-zA-Z0-9_-]{20,}$/.test(spreadsheetInput) ? spreadsheetInput : "");
    const clientEmail = typeof body.clientEmail === "string" ? body.clientEmail.trim() : "";
    const privateKey = typeof body.privateKey === "string" ? body.privateKey.trim() : "";
    if (
      !spreadsheetId ||
      !clientEmail.endsWith(".gserviceaccount.com") ||
      !privateKey.includes("-----BEGIN PRIVATE KEY-----") ||
      !privateKey.includes("-----END PRIVATE KEY-----")
    ) {
      return Response.json({ error: "Invalid Google Sheet or service-account JSON" }, { status: 400 });
    }
    await saveVendorGoogleSheetConfig({ spreadsheetId, clientEmail, privateKey });
    try {
      return Response.json({ data: await syncVendorGoogleSheet() });
    } catch (error) {
      console.error("[Vendors] Google Sheets configuration test failed:", error);
      return Response.json(
        { error: "Configuration saved, but Google Sheet access failed" },
        { status: 502 }
      );
    }
  }
  if (action === "syncSheet") {
    if (!scope.isAdmin) {
      return Response.json({ error: "Admin only" }, { status: 403 });
    }
    try {
      return Response.json({ data: await syncVendorGoogleSheet() });
    } catch (error) {
      console.error("[Vendors] Google Sheets sync failed:", error);
      return Response.json({ error: "Google Sheets sync failed" }, { status: 502 });
    }
  }
  const [vendors, assignments] = await Promise.all([
    getVendors(),
    getVendorAssignments(),
  ]);
  const visibleVendors = getVisibleVendors(scope, vendors);

  if (action === "assign") {
    const channelId = typeof body.channelId === "string" ? body.channelId.trim() : "";
    const vendorId = typeof body.vendorId === "string" ? body.vendorId.trim() : "";
    if (!channelId || !scope.manageableChannelIds.has(channelId)) {
      return Response.json({ error: "Channel is not in your current scope" }, { status: 403 });
    }
    if (vendorId && !visibleVendors.some((vendor) => vendor.id === vendorId)) {
      return Response.json({ error: "Vendor is not in your current scope" }, { status: 403 });
    }

    const next = assignments.filter((assignment) => assignment.channelId !== channelId);
    if (vendorId) {
      const now = new Date().toISOString();
      const previous = assignments.find((assignment) => assignment.channelId === channelId);
      next.push({
        channelId,
        vendorId,
        assignedByEmail: scope.email,
        assignedAt: previous?.assignedAt || now,
        updatedAt: now,
      });
    }
    await saveVendorAssignments(next);
    const sheetSync = await syncSheetAfterMutation();
    return Response.json({ data: { channelId, vendorId: vendorId || null }, sheetSync });
  }

  if (action === "assignMany") {
    if (!Array.isArray(body.assignments)) {
      return Response.json({ error: "assignments array is required" }, { status: 400 });
    }
    const requested = body.assignments
      .filter(
        (item: unknown): item is { channelId: string; vendorId: string } =>
          typeof item === "object" &&
          item !== null &&
          typeof (item as { channelId?: unknown }).channelId === "string" &&
          typeof (item as { vendorId?: unknown }).vendorId === "string"
      )
      .map((item: { channelId: string; vendorId: string }) => ({
        channelId: item.channelId.trim(),
        vendorId: item.vendorId.trim(),
      }));
    const invalid = requested.find(
      (item: { channelId: string; vendorId: string }) =>
        !scope.manageableChannelIds.has(item.channelId) ||
        (item.vendorId && !visibleVendors.some((vendor) => vendor.id === item.vendorId))
    );
    if (invalid) {
      return Response.json({ error: "Assignment is outside your current scope" }, { status: 403 });
    }

    const channelIds = new Set(requested.map((item: { channelId: string }) => item.channelId));
    const next = assignments.filter((assignment) => !channelIds.has(assignment.channelId));
    const now = new Date().toISOString();
    for (const item of requested) {
      if (!item.vendorId) continue;
      const previous = assignments.find((assignment) => assignment.channelId === item.channelId);
      next.push({
        channelId: item.channelId,
        vendorId: item.vendorId,
        assignedByEmail: scope.email,
        assignedAt: previous?.assignedAt || now,
        updatedAt: now,
      });
    }
    await saveVendorAssignments(next);
    const sheetSync = await syncSheetAfterMutation();
    return Response.json({ data: { updated: requested.length }, sheetSync });
  }

  if (action === "rename") {
    const vendorId = typeof body.vendorId === "string" ? body.vendorId : "";
    const name = normalizeName(body.name);
    const vendor = visibleVendors.find((item) => item.id === vendorId);
    if (!vendor || (!scope.isAdmin && vendor.createdByUserId !== scope.currentUser?.id)) {
      return Response.json({ error: "Vendor is not editable" }, { status: 403 });
    }
    if (!name) return Response.json({ error: "Vendor name is required" }, { status: 400 });
    const duplicate = visibleVendors.some(
      (item) => item.id !== vendorId && item.name.toLowerCase() === name.toLowerCase()
    );
    if (duplicate) {
      return Response.json({ error: "Vendor with this name already exists" }, { status: 409 });
    }
    const updated = vendors.map((item) =>
      item.id === vendorId ? { ...item, name, updatedAt: new Date().toISOString() } : item
    );
    await saveVendors(updated);
    const sheetSync = await syncSheetAfterMutation();
    return Response.json({ data: updated.find((item) => item.id === vendorId), sheetSync });
  }

  return Response.json({ error: "Unknown action" }, { status: 400 });
}

export async function DELETE(request: Request) {
  const scope = await getScope();
  if (!scope) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const vendorId = new URL(request.url).searchParams.get("vendorId") || "";
  const [vendors, assignments] = await Promise.all([
    getVendors(),
    getVendorAssignments(),
  ]);
  const vendor = vendors.find((item) => item.id === vendorId);
  if (!vendor) return Response.json({ error: "Vendor not found" }, { status: 404 });

  const vendorAssignments = assignments.filter((assignment) => assignment.vendorId === vendorId);
  const canDelete =
    scope.isAdmin ||
    (vendor.createdByUserId === scope.currentUser?.id &&
      vendorAssignments.every((assignment) =>
        scope.manageableChannelIds.has(assignment.channelId)
      ));
  if (!canDelete) return Response.json({ error: "Vendor is not deletable" }, { status: 403 });

  await Promise.all([
    saveVendors(vendors.filter((item) => item.id !== vendorId)),
    saveVendorAssignments(
      assignments.filter((assignment) => assignment.vendorId !== vendorId)
    ),
  ]);
  const sheetSync = await syncSheetAfterMutation();
  return Response.json({ data: { deleted: true }, sheetSync });
}
