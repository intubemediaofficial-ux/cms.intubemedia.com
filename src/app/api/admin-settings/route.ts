import { kv } from "@/lib/redis";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

const ADMIN_EMAILS = [
  "ajeetgurjarofficial@gmail.com",
  "bainslamusicofficial@gmail.com",
  "shivlalbainslaofficial@gmail.com",
];

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const setting = url.searchParams.get("setting");

  if (setting === "realtime") {
    const realtimeSettings = await kv.get<Record<string, boolean>>("realtime_settings") || {};
    return Response.json({ data: realtimeSettings });
  }

  return Response.json({ error: "Invalid setting" }, { status: 400 });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { setting, email, enabled } = body as { setting: string; email: string; enabled: boolean };

    if (setting === "realtime") {
      if (!email) {
        return Response.json({ error: "email required" }, { status: 400 });
      }
      const realtimeSettings = await kv.get<Record<string, boolean>>("realtime_settings") || {};
      realtimeSettings[email] = enabled;
      await kv.set("realtime_settings", realtimeSettings);
      return Response.json({ data: realtimeSettings });
    }

    return Response.json({ error: "Invalid setting" }, { status: 400 });
  } catch {
    return Response.json({ error: "Failed to update setting" }, { status: 500 });
  }
}
