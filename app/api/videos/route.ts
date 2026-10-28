import { NextResponse } from "next/server";
import { CHANNELS, DISCOVER, DISCOVER_ON, type Channel, type Video } from "@/lib/config";
import { yt, channelOk, videoOk, toVideo, toChannel, uploads } from "@/lib/yt";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function load(handle: string): Promise<Channel | null> {
  const ch = await yt("channels", { part: "snippet,contentDetails", forHandle: handle });
  const it = ch.items?.[0];
  if (!it || !channelOk(it.id, it.snippet.title, it.snippet.description)) return null;
  const vids = await uploads(it);
  return vids ? toChannel(it, handle, false, vids) : null;
}

// Finds Islamic videos and channels beyond the whitelist; everything is re-checked.
async function discover(known: Set<string>): Promise<Channel[]> {
  const found = new Map<string, Map<string, Video>>();
  await Promise.allSettled(DISCOVER.map(async (q) => {
    const r = await yt("search", { part: "snippet", type: "video", maxResults: "50", q, safeSearch: "strict", relevanceLanguage: "en" }, 43200);
    for (const i of r.items || []) {
      const s = i.snippet;
      if (known.has(s.channelId) || !videoOk(s.title, s.description || "")) continue;
      if (!found.has(s.channelId)) found.set(s.channelId, new Map());
      found.get(s.channelId)!.set(i.id.videoId, toVideo(i.id.videoId, s.title, s.description, s.publishedAt, s.thumbnails, s.channelId, s.channelTitle));
    }
  }));
  const ids = [...found.keys()], out: Channel[] = [];
  for (let i = 0; i < ids.length; i += 50) {
    const r = await yt("channels", { part: "snippet", id: ids.slice(i, i + 50).join(",") }, 43200).catch(() => null);
    for (const it of r?.items || [])
      if (channelOk(it.id, it.snippet.title, it.snippet.description)) out.push(toChannel(it, "", true, [...found.get(it.id)!.values()]));
  }
  return out;
}

export async function GET() {
  if (!process.env.YOUTUBE_API_KEY) return NextResponse.json({ error: "Missing YOUTUBE_API_KEY environment variable." }, { status: 500 });
  const [wl, extra] = await Promise.all([
    Promise.allSettled(CHANNELS.map((h) => load(h))),
    DISCOVER_ON ? discover(new Set()).catch(() => [] as Channel[]) : Promise.resolve([] as Channel[]),
  ]);
  const channels = wl.flatMap((r) => (r.status === "fulfilled" && r.value ? [r.value] : []));
  const have = new Set(channels.map((c) => c.id));
  channels.push(...extra.filter((c) => !have.has(c.id)));
  const errors = [...new Set(wl.flatMap((r) => (r.status === "rejected" ? [(r.reason as Error).message] : [])))];
  return NextResponse.json({ channels, errors });
}
