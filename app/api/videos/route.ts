import { NextResponse } from "next/server";
import { CHANNELS, CHANNEL_NAMES, DISCOVER, DISCOVER_ON, HOME_PER_CHANNEL, LANG_QUERIES, type Channel, type Video } from "@/lib/config";
import { yt, channelOk, videoOk, toVideo, toChannel, uploads, verify } from "@/lib/yt";
import { COUNTRY_LANG } from "@/lib/lang";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function fromItem(it: any, handle: string): Promise<Channel | null> {
  if (!it || !channelOk(it.id, it.snippet.title, it.snippet.description)) return null;
  const u = await uploads(it, true, 2); // newest ~100 for Home; the channel page loads everything
  return u ? toChannel(it, handle, false, u.vids.slice(0, HOME_PER_CHANNEL), u.total) : null;
}
const byHandle = async (h: string) => fromItem((await yt("channels", { part: "snippet,contentDetails", forHandle: h })).items?.[0], h);
async function byName(n: string) {
  const s = await yt("search", { part: "snippet", type: "channel", q: n + " islam", maxResults: "1" }, 604800);
  const id = s.items?.[0]?.snippet?.channelId || s.items?.[0]?.id?.channelId;
  return id ? fromItem((await yt("channels", { part: "snippet,contentDetails", id })).items?.[0], "") : null;
}

async function discover(lang: string): Promise<Channel[]> {
  const local = lang !== "en" ? LANG_QUERIES[lang] || [] : [];
  const qs = [...local.map((q) => [q, lang] as const), ...(local.length ? DISCOVER.slice(0, 4) : DISCOVER).map((q) => [q, "en"] as const)];
  const found = new Map<string, Map<string, Video>>();
  await Promise.allSettled(qs.map(async ([q, l]) => {
    const r = await yt("search", { part: "snippet", type: "video", maxResults: "50", q, safeSearch: "strict", relevanceLanguage: l }, 43200);
    for (const i of r.items || []) {
      const s = i.snippet;
      if (!videoOk(s.title, s.description || "")) continue;
      if (!found.has(s.channelId)) found.set(s.channelId, new Map());
      found.get(s.channelId)!.set(i.id.videoId, toVideo(i.id.videoId, s.title, s.description, s.publishedAt, s.thumbnails, s.channelId, s.channelTitle, l !== "en" ? l : undefined));
    }
  }));
  return verify(found);
}

export async function GET(req: Request) {
  if (!process.env.YOUTUBE_API_KEY) return NextResponse.json({ error: "Missing YOUTUBE_API_KEY environment variable." }, { status: 500 });
  const country = req.headers.get("x-vercel-ip-country") || "";
  const asked = new URL(req.url).searchParams.get("lang") || "";
  const lang = LANG_QUERIES[asked] ? asked : COUNTRY_LANG[country] && LANG_QUERIES[COUNTRY_LANG[country]] ? COUNTRY_LANG[country] : "en";
  const [wl, extra] = await Promise.all([
    Promise.allSettled([...CHANNELS.map(byHandle), ...CHANNEL_NAMES.map(byName)]),
    DISCOVER_ON ? discover(lang).catch(() => [] as Channel[]) : Promise.resolve([] as Channel[]),
  ]);
  const map = new Map<string, Channel>();
  wl.forEach((r) => { if (r.status === "fulfilled" && r.value && !map.has(r.value.id)) map.set(r.value.id, r.value); });
  extra.forEach((c) => { if (!map.has(c.id)) map.set(c.id, c); });
  const errors = [...new Set(wl.flatMap((r) => (r.status === "rejected" ? [(r.reason as Error).message] : [])))];
  return NextResponse.json({ channels: [...map.values()], errors, lang, country });
}
