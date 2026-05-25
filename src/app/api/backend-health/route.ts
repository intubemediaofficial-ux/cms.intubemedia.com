export const dynamic = "force-dynamic";

const BACKEND_URL = process.env.BACKEND_URL || "https://api.intubemedia.com";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/health`, {
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const data = await res.json();
      return Response.json({
        frontend: "ok",
        backend: data,
        backendUrl: BACKEND_URL,
        connected: true,
      });
    }
    return Response.json({
      frontend: "ok",
      backend: { status: "error", httpStatus: res.status },
      backendUrl: BACKEND_URL,
      connected: false,
    });
  } catch (err) {
    return Response.json({
      frontend: "ok",
      backend: {
        status: "unreachable",
        error: err instanceof Error ? err.message : "Unknown error",
      },
      backendUrl: BACKEND_URL,
      connected: false,
    });
  }
}
