import { kv } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function GET() {
  const results: Record<string, unknown> = {};

  // Test basic Redis connectivity
  try {
    await kv.set("test_connectivity", "ok");
    const val = await kv.get("test_connectivity");
    results.connectivity = { status: "ok", value: val };
  } catch (error) {
    results.connectivity = { status: "error", error: String(error) };
  }

  // Test reading bainsla_users key
  try {
    const raw = await kv.get("bainsla_users");
    if (raw === null) {
      results.users = { status: "null", message: "Key does not exist — no users stored yet" };
    } else if (Array.isArray(raw)) {
      results.users = {
        status: "ok",
        count: raw.length,
        sampleUsers: raw.slice(0, 3).map((u: Record<string, unknown>) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          status: u.status,
          channelsCount: Array.isArray(u.channels) ? u.channels.length : 0,
        })),
      };
    } else {
      results.users = { status: "unexpected_type", type: typeof raw, preview: JSON.stringify(raw).slice(0, 200) };
    }
  } catch (error) {
    results.users = { status: "error", error: String(error), message: "Failed to read bainsla_users key" };
  }

  // Check env vars
  results.env = {
    REDIS_URL: process.env.REDIS_URL ? "set (" + process.env.REDIS_URL.slice(0, 30) + "...)" : "using default (159.89.55.126:6379)",
    storage: "DigitalOcean Redis",
  };

  return Response.json(results);
}
