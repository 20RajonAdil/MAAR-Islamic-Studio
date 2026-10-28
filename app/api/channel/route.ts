import { NextResponse } from "next/server";
import { yt, channelOk, toChannel, uploads } from "@/lib/yt";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id") || "";
  if (!/^UC[\w-]{22}$/.test(id)) return NextResponse.json({ error: "Invalid channel." }, { status: 400 });
  try {
    const r = await yt("channels", { part: "snippet,contentDetails", id });
    const it = r.items?.[0];
    if (!it || !channelOk(it.id, it.snippet.title, it.snippet.description))
      return NextResponse.json({ error: "This channel is not an approved Islamic channel." }, { status: 404 });
    return NextResponse.json({ channel: toChannel(it, "", false, (await uploads(it)) || []) });
  } catch (e) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }); }
}
