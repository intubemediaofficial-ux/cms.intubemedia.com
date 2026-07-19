import "server-only";

import { google } from "googleapis";
import { getAllCachedClientData } from "@/lib/client-data-cache";
import { kv } from "@/lib/redis";
import { getVendorAssignments, getVendors } from "@/lib/vendors";

const USERS_KEY = "bainsla_users";
const MONTHLY_PREFIX = "monthly_channel_analytics:";
const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";

interface StoredUser {
  id: string;
  name: string;
  channels?: string[];
  status?: "active" | "inactive" | "pending";
}

interface MonthlyChannel {
  channel_id: string;
  channel_name: string;
  revenue_usd: number;
  views: number;
  synced_through: string;
  updated_at: string;
}

interface MonthlyCache {
  month: string;
  channels: MonthlyChannel[];
}

export interface VendorSheetSyncResult {
  status: "updated" | "not_configured";
  vendors?: number;
  months?: number;
  rows?: number;
}

function sanitizeSheetName(value: string): string {
  const cleaned = value.replace(/[\\/?*\[\]:]/g, " ").replace(/\s+/g, " ").trim();
  return (cleaned || "Vendor").slice(0, 31);
}

function uniqueSheetNames(vendorNames: string[]): string[] {
  const used = new Set<string>(["summary"]);
  return vendorNames.map((name) => {
    const base = sanitizeSheetName(name);
    let candidate = base;
    let suffix = 2;
    while (used.has(candidate.toLowerCase())) {
      const ending = ` (${suffix})`;
      candidate = `${base.slice(0, 31 - ending.length)}${ending}`;
      suffix += 1;
    }
    used.add(candidate.toLowerCase());
    return candidate;
  });
}

function quoteSheetName(name: string): string {
  return `'${name.replace(/'/g, "''")}'`;
}

export async function syncVendorGoogleSheet(): Promise<VendorSheetSyncResult> {
  const spreadsheetId = process.env.VENDOR_GOOGLE_SHEET_ID?.trim();
  const clientEmail = process.env.GOOGLE_SHEETS_SERVICE_ACCOUNT_EMAIL?.trim();
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!spreadsheetId || !clientEmail || !privateKey) {
    return { status: "not_configured" };
  }

  const auth = new google.auth.GoogleAuth({
    credentials: { client_email: clientEmail, private_key: privateKey },
    scopes: [SHEETS_SCOPE],
  });
  const sheets = google.sheets({ version: "v4", auth });

  const [vendors, assignments, users, cachedClients, monthlyKeys] = await Promise.all([
    getVendors(),
    getVendorAssignments(),
    kv.get<StoredUser[]>(USERS_KEY).then((value) => value || []),
    getAllCachedClientData(),
    kv.keys(`${MONTHLY_PREFIX}*`),
  ]);
  const monthlyCaches = (
    await Promise.all(monthlyKeys.map((key) => kv.get<MonthlyCache>(key)))
  )
    .filter((cache): cache is MonthlyCache => Boolean(cache?.month))
    .sort((a, b) => a.month.localeCompare(b.month));

  const channelOwners = new Map<string, string>();
  for (const user of users) {
    if (user.status !== "active") continue;
    for (const channelId of user.channels || []) channelOwners.set(channelId, user.name);
  }
  const channelNames = new Map<string, string>();
  for (const client of cachedClients) {
    for (const channel of client.channels || []) {
      if (channel.channelTitle) channelNames.set(channel.channelId, channel.channelTitle);
    }
  }

  const assignmentByVendor = new Map<string, string[]>();
  for (const assignment of assignments) {
    if (!channelOwners.has(assignment.channelId)) continue;
    const ids = assignmentByVendor.get(assignment.vendorId) || [];
    ids.push(assignment.channelId);
    assignmentByVendor.set(assignment.vendorId, ids);
  }

  const vendorSheetNames = uniqueSheetNames(vendors.map((vendor) => vendor.name));
  const desiredTitles = new Set(["Summary", ...vendorSheetNames]);
  const metadata = await sheets.spreadsheets.get({ spreadsheetId });
  const existingSheets = metadata.data.sheets || [];
  const existingByTitle = new Map(
    existingSheets.flatMap((sheet) =>
      sheet.properties?.title && sheet.properties.sheetId !== undefined
        ? [[sheet.properties.title, sheet.properties.sheetId] as const]
        : []
    )
  );

  const addRequests = Array.from(desiredTitles)
    .filter((title) => !existingByTitle.has(title))
    .map((title) => ({ addSheet: { properties: { title } } }));
  if (addRequests.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: addRequests },
    });
  }

  const refreshedMetadata = addRequests.length > 0
    ? await sheets.spreadsheets.get({ spreadsheetId })
    : metadata;
  const staleSheetIds = (refreshedMetadata.data.sheets || []).flatMap((sheet) => {
    const title = sheet.properties?.title;
    const sheetId = sheet.properties?.sheetId;
    return title && sheetId !== undefined && !desiredTitles.has(title) ? [sheetId] : [];
  });
  const totalSheets = refreshedMetadata.data.sheets?.length || 0;
  if (staleSheetIds.length > 0 && totalSheets - staleSheetIds.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: staleSheetIds.map((sheetId) => ({ deleteSheet: { sheetId } })),
      },
    });
  }

  const summaryRows: Array<Array<string | number>> = [[
    "Month",
    "Vendor",
    "Channels",
    "Views",
    "Revenue USD",
    "Synced At",
  ]];
  const vendorRows = new Map<string, Array<Array<string | number>>>();
  let totalRows = 0;

  vendors.forEach((vendor, index) => {
    const title = vendorSheetNames[index];
    const channelIds = assignmentByVendor.get(vendor.id) || [];
    const rows: Array<Array<string | number>> = [[
      "Month",
      "Vendor",
      "Client",
      "Channel",
      "Channel ID",
      "Views",
      "Revenue USD",
      "Status",
      "Synced Through",
      "Updated At",
    ]];

    for (const cache of monthlyCaches) {
      const analyticsByChannel = new Map(
        cache.channels.map((channel) => [channel.channel_id, channel])
      );
      let monthViews = 0;
      let monthRevenue = 0;
      for (const channelId of channelIds) {
        const analytics = analyticsByChannel.get(channelId);
        const views = analytics?.views || 0;
        const revenue = analytics?.revenue_usd || 0;
        monthViews += views;
        monthRevenue += revenue;
        rows.push([
          cache.month,
          vendor.name,
          channelOwners.get(channelId) || "",
          analytics?.channel_name || channelNames.get(channelId) || channelId,
          channelId,
          views,
          Number(revenue.toFixed(3)),
          analytics ? "Available" : "Pending",
          analytics?.synced_through || "",
          analytics?.updated_at || "",
        ]);
        totalRows += 1;
      }
      summaryRows.push([
        cache.month,
        vendor.name,
        channelIds.length,
        monthViews,
        Number(monthRevenue.toFixed(3)),
        new Date().toISOString(),
      ]);
    }
    vendorRows.set(title, rows);
  });

  const updates = [
    { range: `${quoteSheetName("Summary")}!A1`, values: summaryRows },
    ...Array.from(vendorRows, ([title, values]) => ({
      range: `${quoteSheetName(title)}!A1`,
      values,
    })),
  ];
  await sheets.spreadsheets.values.batchClear({
    spreadsheetId,
    requestBody: {
      ranges: Array.from(desiredTitles).map((title) => quoteSheetName(title)),
    },
  });
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: "RAW",
      data: updates,
    },
  });

  return {
    status: "updated",
    vendors: vendors.length,
    months: monthlyCaches.length,
    rows: totalRows,
  };
}
