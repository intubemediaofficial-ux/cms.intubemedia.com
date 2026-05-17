import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getChannelToken,
  setChannelToken,
  deleteChannelToken,
  getTokenStatus,
  isKVConfigured,
} from "@/lib/channel-tokens";

export const dynamic = "force-dynamic";

const ADMIN_EMAILS = [
  "vijendrachoudhary95@gmail.com",
  "ajeetgurjarofficial@gmail.com",
  "bainslamusicofficial@gmail.com",
];

function isAdmin(email: string | null | undefined): boolean {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase());
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdminUser = isAdmin(session.user.email);

  const url = new URL(request.url);
  const action = url.searchParams.get("action");

  switch (action) {
    case "generateInviteLink": {
      if (!isAdminUser) {
        return Response.json({ error: "Admin access required" }, { status: 403 });
      }
      const channelId = url.searchParams.get("channelId");
      const channelTitle = url.searchParams.get("channelTitle") || "";
      if (!channelId) {
        return Response.json({ error: "channelId required" }, { status: 400 });
      }

      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
      if (!clientId) {
        return Response.json({ error: "Google Client ID not configured" }, { status: 500 });
      }

      // Use x-forwarded-host for correct public URL on Vercel
      const forwardedHost = request.headers.get("x-forwarded-host");
      const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
      const requestUrl = new URL(request.url);
      const host = forwardedHost || requestUrl.host;
      const protocol = forwardedHost ? forwardedProto : requestUrl.protocol.replace(":", "");
      const redirectUri = `${protocol}://${host}/callback`;
      const state = channelId;

      const scopes = [
        "https://www.googleapis.com/auth/youtube.readonly",
        "https://www.googleapis.com/auth/yt-analytics.readonly",
        "https://www.googleapis.com/auth/yt-analytics-monetary.readonly",
      ];

      // Build scope string with literal + separator (not encoded) — matches GMJ format
      const scopeString = scopes.map(s => encodeURIComponent(s)).join("+");

      const oauthUrl = `https://accounts.google.com/o/oauth2/auth?` +
        `access_type=offline` +
        `&client_id=${encodeURIComponent(clientId)}` +
        `&prompt=consent` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=code` +
        `&scope=${scopeString}` +
        `&state=${state}`;

      return Response.json({
        data: {
          oauthUrl,
          channelId,
          channelTitle,
          state,
          redirectUri,
        },
      });
    }

    case "tokenStatus": {
      const channelId = url.searchParams.get("channelId");
      if (!channelId) {
        return Response.json({ error: "channelId required" }, { status: 400 });
      }

      const status = await getTokenStatus(channelId);
      const token = await getChannelToken(channelId);
      return Response.json({
        data: {
          channelId,
          status,
          channelTitle: token?.channelTitle || null,
          updatedAt: token?.updatedAt || null,
          kvConfigured: isKVConfigured(),
        },
      });
    }

    case "bulkTokenStatus": {
      const channelIdsParam = url.searchParams.get("channelIds") || "";
      const channelIds = channelIdsParam.split(",").filter(Boolean);

      const statuses: Record<string, { status: string; channelTitle?: string; updatedAt?: string }> = {};
      for (const id of channelIds) {
        const status = await getTokenStatus(id);
        const token = await getChannelToken(id);
        statuses[id] = {
          status,
          channelTitle: token?.channelTitle || undefined,
          updatedAt: token?.updatedAt || undefined,
        };
      }

      return Response.json({ data: { statuses, kvConfigured: isKVConfigured() } });
    }

    case "deleteToken": {
      // Allow any authenticated user to delete channel tokens
      // (clients delete their own channel tokens on channel remove/delink)
      const channelId = url.searchParams.get("channelId");
      if (!channelId) {
        return Response.json({ error: "channelId required" }, { status: 400 });
      }

      await deleteChannelToken(channelId);
      return Response.json({ data: { success: true, channelId } });
    }

    default:
      return Response.json({ error: "Invalid action" }, { status: 400 });
  }
}
