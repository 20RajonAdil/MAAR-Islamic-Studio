import { NextResponse } from "next/server";
import { CHANNELS, BLOCK, ISLAMIC, STRICT_KEYWORDS, type Channel, type Video } from "@/lib/config";

export const dynamic = "force-dynamic";
export const maxDuration = 60;
const revalidate = 21600; // upstream YouTube calls cached 6h to save API quota

const blockRe = new RegExp(BLOCK.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), "i");
const islamicRe = new RegExp(ISLAMIC, "i");

async function yt(path: string, params: Record<string, string>) {
  const u = new URL("https://www.googleapis.com/youtube/v3/" + path);
  Object.entries({ ...params, key: process.env.YOUTUBE_API_KEY as string }).forEach(([k, v]) => u.searchParams.set(k, v));
  const r = await fetch(u, { next: { revalidate } });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error?.message || "YouTube API error");
  return j;
}

async function load(handle: string): Promise<Channel | null> {
  const ch = await yt("channels", { part: "snippet,contentDetails", forHandle: handle });
  const it = ch.items?.[0];
  if (!it) return null;
  // Channel-level gate: the channel itself must be Islamic, otherwise it is skipped completely.
  if (!islamicRe.test(it.snippet.title + " " + (it.snippet.description || "")) || blockRe.test(it.snippet.title)) return null;
  const uploads = it.contentDetails?.relatedPlaylists?.uploads || "UU" + it.id.slice(2);
  const vids: Video[] = [];
  let token = "";
  for (let i = 0; i < 100; i++) { // no 50-video limit: read every page of uploads (safety cap 5000)
    const pl = await yt("playlistItems", { part: "snippet", maxResults: "50", playlistId: uploads, ...(token ? { pageToken: token } : {}) }).catch(() => null);
    if (!pl) { if (i === 0) return null; break; }
    for (const v of pl.items || []) {
      const t = v.snippet.title, d = (v.snippet.description || "").slice(0, 400), hay = t + " " + d;
      if (t === "Private video" || t === "Deleted video" || blockRe.test(hay)) continue;
      if (STRICT_KEYWORDS && !islamicRe.test(hay)) continue;
      vids.push({ id: v.snippet.resourceId.videoId, title: t, desc: d.slice(0, 240), date: v.snippet.publishedAt,
        thumb: (v.snippet.thumbnails?.medium || v.snippet.thumbnails?.default || {}).url || "", ch: it.id, chTitle: it.snippet.title });
    }
    token = pl.nextPageToken || "";
    if (!token) break;
  }
  return { id: it.id, title: it.snippet.title, thumb: it.snippet.thumbnails?.default?.url || "", handle, vids };
}

export async function GET() {
  if (!process.env.YOUTUBE_API_KEY) return NextResponse.json({ error: "Missing YOUTUBE_API_KEY environment variable." }, { status: 500 });
  const res = await Promise.allSettled(CHANNELS.map((h) => load(h)));
  const channels = res.flatMap((r) => (r.status === "fulfilled" && r.value ? [r.value] : []));
  const errors = [...new Set(res.flatMap((r) => (r.status === "rejected" ? [(r.reason as Error).message] : [])))];
  return NextResponse.json({ channels, errors });
}
