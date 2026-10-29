import { BLOCK, BLOCK_UNTRUSTED, HOSTILE, HOSTILE_CHANNEL, ISLAMIC, STRICT_KEYWORDS, BLOCKED_CHANNELS, type Channel, type Video } from "./config";

const re = (l: string[], plain = false) => new RegExp(l.map((w) => (plain ? w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") : w)).join("|"), "i");
const blockRe = re(BLOCK, true), untrustedRe = re(BLOCK_UNTRUSTED, true), hostileRe = re(HOSTILE), hostileChRe = re(HOSTILE_CHANNEL);
const islamicRe = new RegExp(ISLAMIC, "i");
export const isIslamicText = (s: string) => islamicRe.test(s);

export async function yt(path: string, params: Record<string, string>, revalidate = 21600) {
  const u = new URL("https://www.googleapis.com/youtube/v3/" + path);
  Object.entries({ ...params, key: process.env.YOUTUBE_API_KEY as string }).forEach(([k, v]) => u.searchParams.set(k, v));
  const r = await fetch(u, { next: { revalidate } });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error?.message || "YouTube API error");
  return j;
}

// A channel must itself be Islamic (and not anti-Islam) to be used anywhere.
export const channelOk = (id: string, title: string, desc: string) =>
  !BLOCKED_CHANNELS.includes(id) && islamicRe.test(title + " " + (desc || "")) && !blockRe.test(title) && !hostileChRe.test(title) && !hostileRe.test(title);

// Video filter. Islamic keyword match first, then the Islamophobia / non-Islamic filter on the title.
// trusted = comes from a verified Islamic channel, so no keyword is required and only the title is checked.
export function videoOk(t: string, d: string, trusted = false) {
  if (t === "Private video" || t === "Deleted video") return false;
  if (blockRe.test(t) || hostileRe.test(t)) return false;
  if (trusted) return true;
  const h = t + " " + d;
  if (blockRe.test(h) || hostileRe.test(h) || untrustedRe.test(h)) return false;
  return !STRICT_KEYWORDS || islamicRe.test(h);
}

export const toVideo = (id: string, t: string, d: string, date: string, th: any, ch: string, chTitle: string, lang?: string): Video => ({
  id, title: t, desc: (d || "").slice(0, 160), date, thumb: (th?.medium || th?.default || {}).url || "", ch, chTitle, ...(lang ? { lang } : {}),
});

export const toChannel = (it: any, handle = "", partial = false, vids: Video[] = [], total?: number): Channel => ({
  id: it.id, title: it.snippet.title, thumb: it.snippet.thumbnails?.default?.url || "", handle, vids, partial, ...(total != null ? { total } : {}),
});

// Reads a channel's uploads page by page (50 per call). maxPages 100 = every upload (safety cap 5000).
export async function uploads(it: any, trusted: boolean, maxPages = 100): Promise<{ vids: Video[]; total: number } | null> {
  const playlistId = it.contentDetails?.relatedPlaylists?.uploads || "UU" + it.id.slice(2);
  const vids: Video[] = [];
  let token = "", total = 0;
  for (let i = 0; i < maxPages; i++) {
    const pl = await yt("playlistItems", { part: "snippet", maxResults: "50", playlistId, ...(token ? { pageToken: token } : {}) }).catch(() => null);
    if (!pl) return i === 0 ? null : { vids, total };
    total = pl.pageInfo?.totalResults ?? total;
    for (const v of pl.items || []) {
      const s = v.snippet;
      if (videoOk(s.title, (s.description || "").slice(0, 400), trusted))
        vids.push(toVideo(s.resourceId.videoId, s.title, s.description, s.publishedAt, s.thumbnails, it.id, it.snippet.title));
    }
    token = pl.nextPageToken || "";
    if (!token) break;
  }
  return { vids, total };
}

// Turns raw search results into verified Islamic channels with their matching videos.
export async function verify(found: Map<string, Map<string, Video>>): Promise<Channel[]> {
  const ids = [...found.keys()], out: Channel[] = [];
  for (let i = 0; i < ids.length; i += 50) {
    const r = await yt("channels", { part: "snippet", id: ids.slice(i, i + 50).join(",") }, 43200).catch(() => null);
    for (const it of r?.items || [])
      if (channelOk(it.id, it.snippet.title, it.snippet.description)) out.push(toChannel(it, "", true, [...found.get(it.id)!.values()]));
  }
  return out;
}
