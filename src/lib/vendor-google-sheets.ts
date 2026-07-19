import "server-only";

import { google } from "googleapis";
import { getAllCachedClientData } from "@/lib/client-data-cache";
import { kv } from "@/lib/redis";
import { getVendorGoogleSheetConfig } from "@/lib/vendor-google-sheet-config";
import { getVendorAssignments, getVendors } from "@/lib/vendors";

const USERS_KEY = "bainsla_users";
const MONTHLY_PREFIX = "monthly_channel_analytics:";
const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";

interface StoredUser {
  id: string;
  name: string;
  channels?: string[];
  channelNetworks?: Array<{ channelId: string; networkName: string }>;
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

function monthLabel(month: string): string {
  const [year, monthNumber] = month.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, monthNumber - 1, 1)));
}

export async function syncVendorGoogleSheet(): Promise<VendorSheetSyncResult> {
  let spreadsheetId = process.env.VENDOR_GOOGLE_SHEET_ID?.trim();
  let clientEmail = process.env.GOOGLE_SHEETS_SERVICE_ACCOUNT_EMAIL?.trim();
  let privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
  if (!spreadsheetId || !clientEmail || !privateKey) {
    const storedConfig = await getVendorGoogleSheetConfig();
    spreadsheetId ||= storedConfig?.spreadsheetId;
    clientEmail ||= storedConfig?.clientEmail;
    privateKey ||= storedConfig?.privateKey;
  }
  privateKey = privateKey?.replace(/\\n/g, "\n");
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
  const channelNetworks = new Map<string, string>();
  for (const user of users) {
    if (user.status !== "active") continue;
    for (const channelId of user.channels || []) channelOwners.set(channelId, user.name);
    for (const assignment of user.channelNetworks || []) {
      channelNetworks.set(assignment.channelId, assignment.networkName);
    }
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
  const sheetIdByTitle = new Map(
    (refreshedMetadata.data.sheets || []).flatMap((sheet) =>
      sheet.properties?.title && sheet.properties.sheetId !== undefined
        ? [[sheet.properties.title, sheet.properties.sheetId] as const]
        : []
    )
  );
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
    "Revenue USD",
    "Synced At",
  ]];
  const vendorRows = new Map<string, Array<Array<string | number>>>();
  const monthlyAnalytics = monthlyCaches.map((cache) => ({
    cache,
    channels: new Map(cache.channels.map((channel) => [channel.channel_id, channel])),
  }));
  const monthlyHeaders = monthlyCaches.map(
    (cache) => `${monthLabel(cache.month)} Revenue USD`
  );
  let totalRows = 0;

  vendors.forEach((vendor, index) => {
    const title = vendorSheetNames[index];
    const channelIds = assignmentByVendor.get(vendor.id) || [];
    const rows: Array<Array<string | number>> = [[
      "Vendor",
      "Client",
      "Channel",
      "Channel ID",
      "Network",
      ...monthlyHeaders,
    ]];
    const monthlyRevenueTotals = monthlyCaches.map(() => 0);

    for (const channelId of channelIds) {
      const analyticsByMonth = monthlyAnalytics.map(({ channels }) => channels.get(channelId));
      const latestAnalytics = [...analyticsByMonth].reverse().find(Boolean);
      rows.push([
        vendor.name,
        channelOwners.get(channelId) || "",
        latestAnalytics?.channel_name || channelNames.get(channelId) || channelId,
        channelId,
        channelNetworks.get(channelId) || "",
        ...analyticsByMonth.map((analytics, monthIndex) => {
          const revenue = analytics?.revenue_usd || 0;
          monthlyRevenueTotals[monthIndex] += revenue;
          return Number(revenue.toFixed(3));
        }),
      ]);
      totalRows += 1;
    }
    rows.push(
      [""],
      [""],
      [
        "",
        "",
        "Total Revenue",
        "",
        "",
        ...monthlyRevenueTotals.map((value) => Number(value.toFixed(3))),
      ]
    );

    monthlyAnalytics.forEach(({ cache }, monthIndex) => {
      summaryRows.push([
        cache.month,
        vendor.name,
        channelIds.length,
        Number(monthlyRevenueTotals[monthIndex].toFixed(3)),
        new Date().toISOString(),
      ]);
    });
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

  const formatRequests = Array.from(vendorRows, ([title, rows]) => {
    const sheetId = sheetIdByTitle.get(title);
    if (sheetId === undefined) return [];
    const totalRowIndex = rows.length - 1;
    return [
      {
        repeatCell: {
          range: {
            sheetId,
            startColumnIndex: 0,
            endColumnIndex: 5 + monthlyCaches.length,
          },
          cell: {
            userEnteredFormat: {
              textFormat: {
                bold: false,
                fontSize: 10,
                foregroundColor: { red: 0, green: 0, blue: 0 },
              },
            },
          },
          fields: "userEnteredFormat.textFormat",
        },
      },
      {
        repeatCell: {
          range: { sheetId, startRowIndex: 0, endRowIndex: 1 },
          cell: { userEnteredFormat: { textFormat: { bold: true } } },
          fields: "userEnteredFormat.textFormat.bold",
        },
      },
      {
        repeatCell: {
          range: {
            sheetId,
            startRowIndex: totalRowIndex,
            endRowIndex: totalRowIndex + 1,
            startColumnIndex: 0,
            endColumnIndex: 5 + monthlyCaches.length,
          },
          cell: {
            userEnteredFormat: {
              textFormat: {
                bold: true,
                fontSize: 14,
                foregroundColor: { red: 0.85, green: 0, blue: 0 },
              },
            },
          },
          fields: "userEnteredFormat.textFormat",
        },
      },
    ];
  }).flat();
  if (formatRequests.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: formatRequests },
    });
  }

  return {
    status: "updated",
    vendors: vendors.length,
    months: monthlyCaches.length,
    rows: totalRows,
  };
}
