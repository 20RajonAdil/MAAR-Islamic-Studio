import { BLOCK, ISLAMIC, STRICT_KEYWORDS, BLOCKED_CHANNELS, type Channel, type Video } from "./config";

const blockRe = new RegExp(BLOCK.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), "i");
const islamicRe = new RegExp(ISLAMIC, "i");

export async function yt(path: string, params: Record<string, string>, revalidate = 21600) {
  const u = new URL("https://www.googleapis.com/youtube/v3/" + path);
  Object.entries({ ...params, key: process.env.YOUTUBE_API_KEY as string }).forEach(([k, v]) => u.searchParams.set(k, v));
  const r = await fetch(u, { next: { revalidate } });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error?.message || "YouTube API error");
  return j;
}

export const channelOk = (id: string, title: string, desc: string) =>
  !BLOCKED_CHANNELS.includes(id) && islamicRe.test(title + " " + (desc || "")) && !blockRe.test(title);

export const videoOk = (t: string, d: string) => {
  const h = t + " " + d;
  return t !== "Private video" && t !== "Deleted video" && !blockRe.test(h) && (!STRICT_KEYWORDS || islamicRe.test(h));
};

export const toVideo = (id: string, t: string, d: string, date: string, th: any, ch: string, chTitle: string): Video => ({
  id, title: t, desc: (d || "").slice(0, 240), date, thumb: (th?.medium || th?.default || {}).url || "", ch, chTitle,
});

export const toChannel = (it: any, handle = "", partial = false, vids: Video[] = []): Channel => ({
  id: it.id, title: it.snippet.title, thumb: it.snippet.thumbnails?.default?.url || "", handle, vids, partial,
});

// Reads EVERY upload of a channel (no 50-video limit; safety cap 5000).
export async function uploads(it: any): Promise<Video[] | null> {
  const playlistId = it.contentDetails?.relatedPlaylists?.uploads || "UU" + it.id.slice(2);
  const vids: Video[] = [];
  let token = "";
  for (let i = 0; i < 100; i++) {
    const pl = await yt("playlistItems", { part: "snippet", maxResults: "50", playlistId, ...(token ? { pageToken: token } : {}) }).catch(() => null);
    if (!pl) return i === 0 ? null : vids;
    for (const v of pl.items || []) {
      const s = v.snippet;
      if (videoOk(s.title, (s.description || "").slice(0, 400)))
        vids.push(toVideo(s.resourceId.videoId, s.title, s.description, s.publishedAt, s.thumbnails, it.id, it.snippet.title));
    }
    token = pl.nextPageToken || "";
    if (!token) break;
  }
  return vids;
}
