import { google } from "googleapis";

function getAuthClient(accessToken: string) {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  auth.setCredentials({ access_token: accessToken });
  return auth;
}

export async function getChannelStats(accessToken: string) {
  const auth = getAuthClient(accessToken);
  const youtube = google.youtube({ version: "v3", auth });

  const response = await youtube.channels.list({
    part: ["snippet", "statistics", "contentDetails", "brandingSettings"],
    mine: true,
  });

  return response.data.items || [];
}

export async function lookupChannel(
  accessToken: string,
  query: string
) {
  const auth = getAuthClient(accessToken);
  const youtube = google.youtube({ version: "v3", auth });

  // Try by channel ID first (starts with UC)
  if (query.startsWith("UC") && query.length >= 20) {
    const response = await youtube.channels.list({
      part: ["snippet", "statistics", "contentDetails", "brandingSettings"],
      id: [query],
    });
    if (response.data.items?.length) return response.data.items;
  }

  // Try by handle (@username)
  if (query.startsWith("@")) {
    const response = await youtube.channels.list({
      part: ["snippet", "statistics", "contentDetails", "brandingSettings"],
      forHandle: query,
    });
    if (response.data.items?.length) return response.data.items;
  }

  // Try extracting channel ID from URL
  const urlPatterns = [
    /youtube\.com\/channel\/(UC[\w-]+)/,
    /youtube\.com\/@([\w.-]+)/,
    /youtube\.com\/c\/([\w.-]+)/,
  ];
  for (const pattern of urlPatterns) {
    const match = query.match(pattern);
    if (match) {
      const idOrHandle = match[1];
      if (idOrHandle.startsWith("UC")) {
        const response = await youtube.channels.list({
          part: ["snippet", "statistics", "contentDetails", "brandingSettings"],
          id: [idOrHandle],
        });
        if (response.data.items?.length) return response.data.items;
      } else {
        const response = await youtube.channels.list({
          part: ["snippet", "statistics", "contentDetails", "brandingSettings"],
          forHandle: `@${idOrHandle}`,
        });
        if (response.data.items?.length) return response.data.items;
      }
    }
  }

  // Fallback: search for channel
  const searchResponse = await youtube.search.list({
    part: ["snippet"],
    q: query,
    type: ["channel"],
    maxResults: 5,
  });

  if (!searchResponse.data.items?.length) return [];

  const channelIds = searchResponse.data.items
    .map((item) => item.snippet?.channelId)
    .filter(Boolean)
    .join(",");

  if (!channelIds) return [];

  const channelResponse = await youtube.channels.list({
    part: ["snippet", "statistics", "contentDetails", "brandingSettings"],
    id: [channelIds],
  });

  return channelResponse.data.items || [];
}

export async function getChannelVideos(
  accessToken: string,
  channelId: string,
  maxResults = 50
) {
  const auth = getAuthClient(accessToken);
  const youtube = google.youtube({ version: "v3", auth });

  const searchResponse = await youtube.search.list({
    part: ["snippet"],
    channelId,
    maxResults,
    order: "date",
    type: ["video"],
  });

  const videoIds =
    searchResponse.data.items
      ?.map((item) => item.id?.videoId)
      .filter(Boolean)
      .join(",") || "";

  if (!videoIds) return [];

  const videoResponse = await youtube.videos.list({
    part: ["snippet", "statistics", "contentDetails"],
    id: [videoIds],
  });

  return videoResponse.data.items || [];
}

export async function getAnalyticsData(
  accessToken: string,
  startDate: string,
  endDate: string,
  metrics: string = "views,estimatedMinutesWatched,subscribersGained,subscribersLost,likes,averageViewDuration",
  dimensions: string = "day"
) {
  const auth = getAuthClient(accessToken);
  const analytics = google.youtubeAnalytics({ version: "v2", auth });

  const response = await analytics.reports.query({
    ids: "channel==MINE",
    startDate,
    endDate,
    metrics,
    dimensions,
    sort: dimensions === "day" ? "day" : undefined,
  });

  return response.data;
}

export async function getTrafficSources(
  accessToken: string,
  startDate: string,
  endDate: string
) {
  const auth = getAuthClient(accessToken);
  const analytics = google.youtubeAnalytics({ version: "v2", auth });

  const response = await analytics.reports.query({
    ids: "channel==MINE",
    startDate,
    endDate,
    metrics: "views,estimatedMinutesWatched",
    dimensions: "insightTrafficSourceType",
    sort: "-views",
  });

  return response.data;
}

export async function getCountryData(
  accessToken: string,
  startDate: string,
  endDate: string
) {
  const auth = getAuthClient(accessToken);
  const analytics = google.youtubeAnalytics({ version: "v2", auth });

  const response = await analytics.reports.query({
    ids: "channel==MINE",
    startDate,
    endDate,
    metrics: "views,estimatedMinutesWatched",
    dimensions: "country",
    sort: "-views",
    maxResults: 10,
  });

  return response.data;
}

export async function getDemographics(
  accessToken: string,
  startDate: string,
  endDate: string
) {
  const auth = getAuthClient(accessToken);
  const analytics = google.youtubeAnalytics({ version: "v2", auth });

  const response = await analytics.reports.query({
    ids: "channel==MINE",
    startDate,
    endDate,
    metrics: "viewerPercentage",
    dimensions: "ageGroup,gender",
  });

  return response.data;
}

export async function getDeviceData(
  accessToken: string,
  startDate: string,
  endDate: string
) {
  const auth = getAuthClient(accessToken);
  const analytics = google.youtubeAnalytics({ version: "v2", auth });

  const response = await analytics.reports.query({
    ids: "channel==MINE",
    startDate,
    endDate,
    metrics: "views,estimatedMinutesWatched",
    dimensions: "deviceType",
    sort: "-views",
  });

  return response.data;
}

export async function getRevenueData(
  accessToken: string,
  startDate: string,
  endDate: string
) {
  const auth = getAuthClient(accessToken);
  const analytics = google.youtubeAnalytics({ version: "v2", auth });

  try {
    const response = await analytics.reports.query({
      ids: "channel==MINE",
      startDate,
      endDate,
      metrics: "estimatedRevenue,estimatedAdRevenue,grossRevenue",
      dimensions: "month",
      sort: "month",
    });
    return response.data;
  } catch {
    return null;
  }
}

export async function getTopVideos(
  accessToken: string,
  startDate: string,
  endDate: string
) {
  const auth = getAuthClient(accessToken);
  const analytics = google.youtubeAnalytics({ version: "v2", auth });

  const response = await analytics.reports.query({
    ids: "channel==MINE",
    startDate,
    endDate,
    metrics: "views,likes,estimatedMinutesWatched,subscribersGained",
    dimensions: "video",
    sort: "-views",
    maxResults: 10,
  });

  if (!response.data.rows?.length) return { analytics: response.data, videos: [] };

  const videoIds =
    response.data.rows.map((row) => row[0] as string).join(",");

  const youtube = google.youtube({ version: "v3", auth });
  const videoResponse = await youtube.videos.list({
    part: ["snippet", "statistics", "contentDetails"],
    id: [videoIds],
  });

  return {
    analytics: response.data,
    videos: videoResponse.data.items || [],
  };
}
