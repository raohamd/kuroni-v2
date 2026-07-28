// lib/youtube.ts
const YT_API_KEY = process.env.YOUTUBE_API_KEY!;
export async function searchOfficialEpisode(query: string, channelId: string) {
  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("q", query);
  url.searchParams.set("channelId", channelId);
  url.searchParams.set("type", "video");
  url.searchParams.set("maxResults", "10");
  url.searchParams.set("key", YT_API_KEY);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("YouTube search failed");
  return res.json();
}