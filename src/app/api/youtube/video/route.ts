import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getValidAccessToken } from "@/lib/channel-tokens";

export const dynamic = "force-dynamic";

const ADMIN_EMAILS = [
  "ajeetgurjarofficial@gmail.com",
  "bainslamusicofficial@gmail.com",
  "shivlalbainslaofficial@gmail.com",
];

async function getAccessTokenForChannel(channelId: string): Promise<string | null> {
  // Always use per-channel OAuth token (has YouTube API scope)
  // Session tokens from credentials login don't have YouTube scope
  const token = await getValidAccessToken(channelId);
  return token;
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { videoId, channelId, title, description, privacyStatus, thumbnailUrl, tags } = body;

    if (!videoId || !channelId) {
      return Response.json({ error: "videoId and channelId required" }, { status: 400 });
    }

    const accessToken = await getAccessTokenForChannel(channelId);
    if (!accessToken) {
      return Response.json({ error: "No valid token for this channel. Please validate the channel token first." }, { status: 401 });
    }

    // Get current video details first
    const detailRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,status&id=${videoId}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const detailData = await detailRes.json();
    if (!detailData.items?.length) {
      return Response.json({ error: "Video not found" }, { status: 404 });
    }

    const video = detailData.items[0];
    const updateBody: Record<string, unknown> = {
      id: videoId,
      snippet: {
        ...video.snippet,
        categoryId: video.snippet.categoryId,
      },
      status: {
        ...video.status,
      },
    };

    if (title !== undefined) updateBody.snippet = { ...(updateBody.snippet as Record<string, unknown>), title };
    if (description !== undefined) updateBody.snippet = { ...(updateBody.snippet as Record<string, unknown>), description };
    if (tags !== undefined) updateBody.snippet = { ...(updateBody.snippet as Record<string, unknown>), tags };
    if (privacyStatus) updateBody.status = { ...(updateBody.status as Record<string, unknown>), privacyStatus };

    const updateRes = await fetch(
      "https://www.googleapis.com/youtube/v3/videos?part=snippet,status",
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateBody),
      }
    );

    const updateData = await updateRes.json();
    if (!updateRes.ok) {
      return Response.json(
        { error: updateData.error?.message || "Failed to update video" },
        { status: updateRes.status }
      );
    }

    // Handle thumbnail update if provided
    if (thumbnailUrl) {
      // thumbnailUrl is a base64 data URL or external URL — we'd need to upload
      // For now, thumbnail change via URL is not supported by YouTube API without file upload
    }

    return Response.json({ data: updateData });
  } catch (error) {
    console.error("[YouTube Video] Update error:", error);
    return Response.json({ error: "Failed to update video" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, videos } = body as { action: string; videos: { videoId: string; channelId: string }[] };

    if (!action || !videos || !Array.isArray(videos) || videos.length === 0) {
      return Response.json({ error: "action and videos array required" }, { status: 400 });
    }

    const results: { videoId: string; success: boolean; error?: string }[] = [];

    if (action === "bulkDelete") {
      for (const { videoId, channelId } of videos) {
        const accessToken = await getAccessTokenForChannel(channelId);
        if (!accessToken) {
          results.push({ videoId, success: false, error: "No valid token" });
          continue;
        }
        try {
          const deleteRes = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?id=${videoId}`,
            { method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` } }
          );
          if (deleteRes.ok || deleteRes.status === 204) {
            results.push({ videoId, success: true });
          } else {
            const data = await deleteRes.json().catch(() => ({}));
            results.push({ videoId, success: false, error: (data as Record<string, Record<string, string>>)?.error?.message || "Failed" });
          }
        } catch {
          results.push({ videoId, success: false, error: "Network error" });
        }
      }
    } else if (action === "bulkPrivacy") {
      const { privacyStatus } = body as { privacyStatus: string; action: string; videos: { videoId: string; channelId: string }[] };
      if (!privacyStatus) {
        return Response.json({ error: "privacyStatus required for bulkPrivacy" }, { status: 400 });
      }
      for (const { videoId, channelId } of videos) {
        const accessToken = await getAccessTokenForChannel(channelId);
        if (!accessToken) {
          results.push({ videoId, success: false, error: "No valid token" });
          continue;
        }
        try {
          const detailRes = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=snippet,status&id=${videoId}`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
          const detailData = await detailRes.json();
          if (!detailData.items?.length) {
            results.push({ videoId, success: false, error: "Video not found" });
            continue;
          }
          const video = detailData.items[0];
          const updateBody = {
            id: videoId,
            snippet: { ...video.snippet, categoryId: video.snippet.categoryId },
            status: { ...video.status, privacyStatus },
          };
          const updateRes = await fetch(
            "https://www.googleapis.com/youtube/v3/videos?part=snippet,status",
            {
              method: "PUT",
              headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
              body: JSON.stringify(updateBody),
            }
          );
          if (updateRes.ok) {
            results.push({ videoId, success: true });
          } else {
            const data = await updateRes.json().catch(() => ({}));
            results.push({ videoId, success: false, error: (data as Record<string, Record<string, string>>)?.error?.message || "Failed" });
          }
        } catch {
          results.push({ videoId, success: false, error: "Network error" });
        }
      }
    } else {
      return Response.json({ error: "Invalid action. Use bulkDelete or bulkPrivacy" }, { status: 400 });
    }

    const successCount = results.filter((r) => r.success).length;
    return Response.json({ data: { results, successCount, totalCount: videos.length } });
  } catch (error) {
    console.error("[YouTube Video] Bulk action error:", error);
    return Response.json({ error: "Failed to perform bulk action" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const videoId = url.searchParams.get("videoId");
    const channelId = url.searchParams.get("channelId");

    if (!videoId || !channelId) {
      return Response.json({ error: "videoId and channelId required" }, { status: 400 });
    }

    const accessToken = await getAccessTokenForChannel(channelId);
    if (!accessToken) {
      return Response.json({ error: "No valid token for this channel. Please validate the channel token first." }, { status: 401 });
    }

    const deleteRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!deleteRes.ok && deleteRes.status !== 204) {
      const data = await deleteRes.json().catch(() => ({}));
      return Response.json(
        { error: (data as Record<string, Record<string, string>>)?.error?.message || "Failed to delete video" },
        { status: deleteRes.status }
      );
    }

    return Response.json({ data: { success: true } });
  } catch (error) {
    console.error("[YouTube Video] Delete error:", error);
    return Response.json({ error: "Failed to delete video" }, { status: 500 });
  }
}
