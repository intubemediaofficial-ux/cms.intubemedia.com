import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getValidAccessToken } from "@/lib/channel-tokens";

export const dynamic = "force-dynamic";

const ADMIN_EMAILS = [
  "vijendrachoudhary95@gmail.com",
  "ajeetgurjarofficial@gmail.com",
  "bainslamusicofficial@gmail.com",
];

async function getAccessTokenForChannel(channelId: string, sessionToken?: string): Promise<string | null> {
  if (sessionToken) return sessionToken;
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
    const { videoId, channelId, title, description, privacyStatus, thumbnailUrl } = body;

    if (!videoId || !channelId) {
      return Response.json({ error: "videoId and channelId required" }, { status: 400 });
    }

    const accessToken = await getAccessTokenForChannel(channelId, session.accessToken || undefined);
    if (!accessToken) {
      return Response.json({ error: "No valid token for this channel" }, { status: 401 });
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

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = ADMIN_EMAILS.includes(session.user.email.toLowerCase());

  try {
    const url = new URL(request.url);
    const videoId = url.searchParams.get("videoId");
    const channelId = url.searchParams.get("channelId");

    if (!videoId || !channelId) {
      return Response.json({ error: "videoId and channelId required" }, { status: 400 });
    }

    const accessToken = await getAccessTokenForChannel(channelId, session.accessToken || undefined);
    if (!accessToken) {
      return Response.json({ error: "No valid token for this channel" }, { status: 401 });
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
