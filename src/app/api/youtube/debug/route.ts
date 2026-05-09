import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);

  const debugInfo: Record<string, unknown> = {
    authenticated: !!session,
    hasAccessToken: !!session?.accessToken,
    accessTokenPrefix: session?.accessToken
      ? session.accessToken.substring(0, 10) + "..."
      : null,
    accessTokenLength: session?.accessToken?.length || 0,
    hasError: !!session?.error,
    sessionError: session?.error || null,
    userRole: session?.user?.role || null,
    user: session?.user
      ? {
          name: session.user.name,
          email: session.user.email,
          role: session.user.role,
        }
      : null,
    envCheck: {
      hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      nextAuthUrl: process.env.NEXTAUTH_URL || "not set",
    },
    timestamp: new Date().toISOString(),
  };

  if (session?.accessToken) {
    try {
      const response = await fetch(
        "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true",
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );
      const data = await response.json();
      debugInfo.youtubeApiTest = {
        status: response.status,
        ok: response.ok,
        channelCount: data.items?.length || 0,
        channelName: data.items?.[0]?.snippet?.title || null,
        channelId: data.items?.[0]?.id || null,
        subscribers: data.items?.[0]?.statistics?.subscriberCount || null,
        error: data.error?.message || null,
        errorCode: data.error?.code || null,
      };
    } catch (err) {
      debugInfo.youtubeApiTest = {
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
  }

  return Response.json(debugInfo);
}
