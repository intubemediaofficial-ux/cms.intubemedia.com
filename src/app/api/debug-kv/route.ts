import { kv } from "@vercel/kv";

export const dynamic = "force-dynamic";

export async function GET() {
  const results: Record<string, unknown> = {};

  // Test basic KV connectivity
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
      results.users = { status: "null", message: "Key does not exist" };
    } else if (Array.isArray(raw)) {
      results.users = { status: "ok", count: raw.length, firstUser: raw[0] ? { id: raw[0].id, name: raw[0].name, email: raw[0].email } : null };
    } else {
      results.users = { status: "unexpected_type", type: typeof raw, preview: JSON.stringify(raw).slice(0, 200) };
    }
  } catch (error) {
    results.users = { status: "error", error: String(error), message: "Failed to read bainsla_users" };
  }

  // Check env vars
  results.env = {
    KV_REST_API_URL: process.env.KV_REST_API_URL ? "set" : "missing",
    KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN ? "set" : "missing",
  };

  return Response.json(results);
}
