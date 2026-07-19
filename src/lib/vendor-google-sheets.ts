import "server-only";

import { google } from "googleapis";
import type { sheets_v4 } from "googleapis";
import { getAllCachedClientData } from "@/lib/client-data-cache";
import { kv } from "@/lib/redis";
import { getBackendChannels } from "@/lib/backend-api";
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

function normalizeLinkedDate(value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value)) {
    return new Date((value - 25569) * 86_400_000).toISOString().slice(0, 10);
  }
  const parsed = Date.parse(String(value || "").trim());
  return Number.isFinite(parsed) ? new Date(parsed).toISOString().slice(0, 10) : "";
}

function googleSheetDateSerial(value: unknown): number | string {
  const date = normalizeLinkedDate(value);
  if (!date) return "";
  return Date.parse(`${date}T00:00:00Z`) / 86_400_000 + 25569;
}

function normalizedHeader(value: unknown): string {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
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

  const [vendors, assignments, users, cachedClients, monthlyKeys, backendChannels] = await Promise.all([
    getVendors(),
    getVendorAssignments(),
    kv.get<StoredUser[]>(USERS_KEY).then((value) => value || []),
    getAllCachedClientData(),
    kv.keys(`${MONTHLY_PREFIX}*`),
    getBackendChannels(),
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
  const linkedDates = new Map(
    backendChannels.map((channel) => [channel.channel_id, normalizeLinkedDate(channel.linked_at)])
  );
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
  const preservedLinkedDates = new Map<string, string>();
  if (vendorSheetNames.length > 0) {
    const currentValues = await sheets.spreadsheets.values.batchGet({
      spreadsheetId,
      ranges: vendorSheetNames.map((title) => `${quoteSheetName(title)}!A:ZZ`),
    });
    (currentValues.data.valueRanges || []).forEach((range) => {
      const values = range.values || [];
      const header = values[0] || [];
      const channelIdIndex = header.findIndex((value) => normalizedHeader(value) === "channelid");
      const linkedDateIndex = header.findIndex((value) => {
        const normalized = normalizedHeader(value);
        return normalized === "linkeddate" || normalized === "linkdate";
      });
      if (channelIdIndex < 0 || linkedDateIndex < 0) return;
      values.slice(1).forEach((row) => {
        const channelId = String(row[channelIdIndex] || "").trim();
        const linkedDate = normalizeLinkedDate(row[linkedDateIndex]);
        if (channelId && linkedDate) preservedLinkedDates.set(channelId, linkedDate);
      });
    });
  }
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
  const unmergeRequests: sheets_v4.Schema$Request[] = (refreshedMetadata.data.sheets || [])
    .filter((sheet) => desiredTitles.has(sheet.properties?.title || ""))
    .flatMap((sheet) => (sheet.merges || []).map((range) => ({ unmergeCells: { range } })));
  if (unmergeRequests.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: unmergeRequests },
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
      "Channel Link",
      "Channel ID",
      "Network",
      ...monthlyHeaders,
      "Linked Date",
    ]];
    const monthlyRevenueTotals = monthlyCaches.map(() => 0);

    for (const channelId of channelIds) {
      const analyticsByMonth = monthlyAnalytics.map(({ channels }) => channels.get(channelId));
      const latestAnalytics = [...analyticsByMonth].reverse().find(Boolean);
      rows.push([
        vendor.name,
        channelOwners.get(channelId) || "",
        latestAnalytics?.channel_name || channelNames.get(channelId) || channelId,
        `https://www.youtube.com/channel/${channelId}`,
        channelId,
        channelNetworks.get(channelId) || "",
        ...analyticsByMonth.map((analytics, monthIndex) => {
          const revenue = analytics?.revenue_usd || 0;
          monthlyRevenueTotals[monthIndex] += revenue;
          return Number(revenue.toFixed(2));
        }),
        googleSheetDateSerial(preservedLinkedDates.get(channelId) || linkedDates.get(channelId)),
      ]);
      totalRows += 1;
    }
    rows.push(
      [""],
      [""],
      [
        "TOTAL USD",
        "",
        "",
        "",
        "",
        "",
        ...monthlyRevenueTotals.map((value) => Number(value.toFixed(2))),
        "",
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

  const black = { red: 0, green: 0, blue: 0 };
  const white = { red: 1, green: 1, blue: 1 };
  const headerBlue = { red: 31 / 255, green: 78 / 255, blue: 120 / 255 };
  const totalBlue = { red: 217 / 255, green: 234 / 255, blue: 247 / 255 };
  const linkBlue = { red: 17 / 255, green: 85 / 255, blue: 204 / 255 };
  const thinBorder = { style: "SOLID", color: black };
  const formatRequests: sheets_v4.Schema$Request[] = [];
  const summarySheetId = sheetIdByTitle.get("Summary");
  if (summarySheetId !== undefined) {
    formatRequests.push(
      {
        repeatCell: {
          range: { sheetId: summarySheetId, startRowIndex: 0, endRowIndex: summaryRows.length, startColumnIndex: 0, endColumnIndex: 5 },
          cell: { userEnteredFormat: { textFormat: { fontFamily: "Arial", fontSize: 10, foregroundColor: black }, wrapStrategy: "WRAP", verticalAlignment: "MIDDLE" } },
          fields: "userEnteredFormat(textFormat,wrapStrategy,verticalAlignment)",
        },
      },
      {
        repeatCell: {
          range: { sheetId: summarySheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 5 },
          cell: { userEnteredFormat: { backgroundColor: headerBlue, textFormat: { fontFamily: "Arial", fontSize: 10, bold: true, foregroundColor: white }, horizontalAlignment: "CENTER", verticalAlignment: "MIDDLE", wrapStrategy: "WRAP" } },
          fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment,wrapStrategy)",
        },
      }
    );
  }
  Array.from(vendorRows).forEach(([title, rows]) => {
    const sheetId = sheetIdByTitle.get(title);
    if (sheetId === undefined) return;
    const totalRowIndex = rows.length - 1;
    const linkedDateColumn = 6 + monthlyCaches.length;
    const columnCount = linkedDateColumn + 1;
    formatRequests.push(
      {
        repeatCell: {
          range: { sheetId, startRowIndex: 0, endRowIndex: rows.length, startColumnIndex: 0, endColumnIndex: columnCount },
          cell: { userEnteredFormat: { backgroundColor: white, textFormat: { fontFamily: "Arial", fontSize: 10, bold: false, foregroundColor: black }, verticalAlignment: "MIDDLE", wrapStrategy: "WRAP" } },
          fields: "userEnteredFormat(backgroundColor,textFormat,verticalAlignment,wrapStrategy)",
        },
      },
      {
        repeatCell: {
          range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: columnCount },
          cell: { userEnteredFormat: { backgroundColor: headerBlue, textFormat: { fontFamily: "Arial", fontSize: 10, bold: true, foregroundColor: white }, horizontalAlignment: "CENTER", verticalAlignment: "MIDDLE", wrapStrategy: "WRAP" } },
          fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment,wrapStrategy)",
        },
      },
      {
        repeatCell: {
          range: { sheetId, startRowIndex: 1, endRowIndex: totalRowIndex, startColumnIndex: linkedDateColumn, endColumnIndex: columnCount },
          cell: { userEnteredFormat: { numberFormat: { type: "DATE", pattern: "dd-mmm-yyyy" }, horizontalAlignment: "CENTER" } },
          fields: "userEnteredFormat(numberFormat,horizontalAlignment)",
        },
      },
      {
        repeatCell: {
          range: { sheetId, startRowIndex: totalRowIndex, endRowIndex: totalRowIndex + 1, startColumnIndex: 0, endColumnIndex: columnCount },
          cell: { userEnteredFormat: { backgroundColor: totalBlue, textFormat: { fontFamily: "Arial", fontSize: 10, bold: true, foregroundColor: black }, horizontalAlignment: "CENTER", verticalAlignment: "MIDDLE", wrapStrategy: "WRAP", borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder } } },
          fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment,wrapStrategy,borders)",
        },
      },
      {
        mergeCells: {
          range: { sheetId, startRowIndex: totalRowIndex, endRowIndex: totalRowIndex + 1, startColumnIndex: 0, endColumnIndex: 6 },
          mergeType: "MERGE_ALL",
        },
      },
      {
        updateDimensionProperties: {
          range: { sheetId, dimension: "ROWS", startIndex: 0, endIndex: 1 },
          properties: { pixelSize: 42 },
          fields: "pixelSize",
        },
      }
    );
    if (totalRowIndex > 3) {
      formatRequests.push({
        repeatCell: {
          range: { sheetId, startRowIndex: 1, endRowIndex: totalRowIndex - 2, startColumnIndex: 3, endColumnIndex: 4 },
          cell: { userEnteredFormat: { textFormat: { foregroundColor: linkBlue } } },
          fields: "userEnteredFormat.textFormat.foregroundColor",
        },
      });
    }
    if (linkedDateColumn > 6) {
      formatRequests.push({
        repeatCell: {
          range: { sheetId, startRowIndex: 1, endRowIndex: rows.length, startColumnIndex: 6, endColumnIndex: linkedDateColumn },
          cell: { userEnteredFormat: { numberFormat: { type: "NUMBER", pattern: "0.00" }, horizontalAlignment: "RIGHT" } },
          fields: "userEnteredFormat(numberFormat,horizontalAlignment)",
        },
      });
    }
    [130, 180, 180, 260, 210, 150].forEach((pixelSize, column) => {
      formatRequests.push({
        updateDimensionProperties: {
          range: { sheetId, dimension: "COLUMNS", startIndex: column, endIndex: column + 1 },
          properties: { pixelSize },
          fields: "pixelSize",
        },
      });
    });
    if (linkedDateColumn > 6) {
      formatRequests.push({
        updateDimensionProperties: {
          range: { sheetId, dimension: "COLUMNS", startIndex: 6, endIndex: linkedDateColumn },
          properties: { pixelSize: 165 },
          fields: "pixelSize",
        },
      });
    }
    formatRequests.push({
      updateDimensionProperties: {
        range: { sheetId, dimension: "COLUMNS", startIndex: linkedDateColumn, endIndex: columnCount },
        properties: { pixelSize: 125 },
        fields: "pixelSize",
      },
    });
  });
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
