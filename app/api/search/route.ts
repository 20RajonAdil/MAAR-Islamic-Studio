import { NextResponse } from "next/server";
import { type Video } from "@/lib/config";
import { yt, videoOk, toVideo, verify, isIslamicText } from "@/lib/yt";
import { detectLang } from "@/lib/lang";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Live Islamic search: asks YouTube, then keeps only verified Islamic channels and clean Islamic videos.
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const q = (sp.get("q") || "").trim().slice(0, 80);
  if (q.length < 2) return NextResponse.json({ channels: [] });
  const lang = detectLang(q) || sp.get("lang") || "en";
  try {
    const r = await yt("search", { part: "snippet", type: "video", maxResults: "50", q: isIslamicText(q) ? q : q + " islam", safeSearch: "strict", relevanceLanguage: lang }, 43200);
    const found = new Map<string, Map<string, Video>>();
    for (const i of r.items || []) {
      const s = i.snippet;
      if (!videoOk(s.title, s.description || "")) continue;
      if (!found.has(s.channelId)) found.set(s.channelId, new Map());
      found.get(s.channelId)!.set(i.id.videoId, toVideo(i.id.videoId, s.title, s.description, s.publishedAt, s.thumbnails, s.channelId, s.channelTitle, lang !== "en" ? lang : undefined));
    }
    return NextResponse.json({ channels: await verify(found), lang });
  } catch (e) { return NextResponse.json({ channels: [], error: (e as Error).message }); }
}
