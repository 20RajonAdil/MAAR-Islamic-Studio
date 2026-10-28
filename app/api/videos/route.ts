import { NextResponse } from "next/server";
import { CHANNELS, BLOCK, type Channel } from "@/lib/config";

export const dynamic = "force-dynamic";
const revalidate = 21600; // upstream YouTube calls cached 6h to save API quota

const blockRe = new RegExp(BLOCK.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), "i");

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
  const pl = await yt("playlistItems", { part: "snippet", maxResults: "50", playlistId: it.contentDetails.relatedPlaylists.uploads });
  return {
    id: it.id, title: it.snippet.title, thumb: it.snippet.thumbnails?.default?.url || "", handle,
    vids: (pl.items || [])
      .filter((v: any) => v.snippet.title !== "Private video" && v.snippet.title !== "Deleted video")
      .map((v: any) => ({
        id: v.snippet.resourceId.videoId, title: v.snippet.title, desc: (v.snippet.description || "").slice(0, 300),
        date: v.snippet.publishedAt, thumb: (v.snippet.thumbnails?.medium || v.snippet.thumbnails?.default || {}).url || "",
        ch: it.id, chTitle: it.snippet.title,
      }))
      .filter((v: any) => !blockRe.test(v.title + " " + v.desc)),
  };
}

export async function GET() {
  if (!process.env.YOUTUBE_API_KEY) return NextResponse.json({ error: "Missing YOUTUBE_API_KEY environment variable." }, { status: 500 });
  const res = await Promise.allSettled(CHANNELS.map(load));
  const channels = res.flatMap((r) => (r.status === "fulfilled" && r.value ? [r.value] : []));
  const errors = [...new Set(res.flatMap((r) => (r.status === "rejected" ? [(r.reason as Error).message] : [])))];
  return NextResponse.json({ channels, errors });
}
