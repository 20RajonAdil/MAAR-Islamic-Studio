"use client";
import { useEffect, useMemo, useState } from "react";
import { TOPICS, type Channel, type Video } from "@/lib/config";

type View = "home" | "channels" | "subs";
const ago = (d: string) => {
  const s = (Date.now() - +new Date(d)) / 1000;
  for (const [n, l] of [[31536000, "year"], [2592000, "month"], [604800, "week"], [86400, "day"], [3600, "hour"]] as const)
    if (s >= n) { const x = Math.floor(s / n); return `${x} ${l}${x > 1 ? "s" : ""} ago`; }
  return "Just now";
};

export default function Studio() {
  const [chans, setChans] = useState<Channel[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errs, setErrs] = useState<string[]>([]);
  const [view, setView] = useState<View>("home");
  const [topic, setTopic] = useState("All");
  const [q, setQ] = useState("");
  const [subs, setSubs] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState<Video | null>(null);

  useEffect(() => {
    try { setSubs(JSON.parse(localStorage.getItem("maar_subs") || "[]")); } catch {}
    setReady(true);
    fetch("/api/videos").then((r) => r.json()).then((j) => {
      if (j.error) { setErrs([j.error]); setStatus("error"); return; }
      setChans(j.channels); setErrs(j.errors || []); setStatus("ready");
    }).catch(() => { setErrs(["Could not reach the server."]); setStatus("error"); });
  }, []);
  useEffect(() => { if (ready) localStorage.setItem("maar_subs", JSON.stringify(subs)); }, [subs, ready]);
  useEffect(() => { document.body.style.overflow = playing ? "hidden" : ""; }, [playing]);

  const vids = useMemo(() => chans.flatMap((c) => c.vids).sort((a, b) => +new Date(b.date) - +new Date(a.date)), [chans]);
  const match = (v: Video) => {
    const hay = (v.title + " " + v.desc).toLowerCase();
    if (topic !== "All" && !new RegExp(TOPICS[topic], "i").test(hay)) return false;
    return q.toLowerCase().split(/\s+/).filter(Boolean).every((w) => hay.includes(w) || v.chTitle.toLowerCase().includes(w));
  };
  const toggle = (id: string) => setSubs((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const VCard = (v: Video) => (
    <div className="v" key={v.id} tabIndex={0} onClick={() => setPlaying(v)} onKeyDown={(e) => e.key === "Enter" && setPlaying(v)}>
      <img src={v.thumb} alt="" loading="eager" />
      <div><h3>{v.title}</h3><p>{v.chTitle} · {ago(v.date)}</p></div>
    </div>
  );
  const Sub = ({ id }: { id: string }) => (
    <button className={"sub" + (subs.includes(id) ? " on" : "")} onClick={() => toggle(id)}>{subs.includes(id) ? "Subscribed" : "Subscribe"}</button>
  );
  const CCard = (c: Channel) => (
    <div className="ch" key={c.id}><img src={c.thumb} alt="" loading="eager" /><div><b>{c.title}</b><small>{c.vids.length} videos</small></div><Sub id={c.id} /></div>
  );

  const list = vids.filter(match);
  const subChans = chans.filter((c) => subs.includes(c.id));

  return (
    <>
      <header>
        <div className="brand"><img src="/logo.svg" alt="MAAR Islamic Studio" /><div><b>مَعَار</b><span>MAAR Islamic Studio</span></div></div>
        <div className="search"><input type="search" value={q} onChange={(e) => { setQ(e.target.value.trim()); if (view === "channels") setView("home"); }} placeholder="Search Islamic videos…" /></div>
      </header>
      {view !== "channels" && (
        <div className="chips">{Object.keys(TOPICS).map((t) => <button key={t} className={"chip" + (t === topic ? " on" : "")} onClick={() => setTopic(t)}>{t}</button>)}</div>
      )}
      <main>
        {status === "loading" && <div className="empty">Loading Islamic videos…</div>}
        {errs[0] && <div className="err">{errs[0]}</div>}
        {status === "ready" && view === "home" && (list.length ? <><h2>{q || topic !== "All" ? "Results" : "Latest"}</h2><div className="grid">{list.map(VCard)}</div></> : <div className="empty">No Islamic videos match. Try another keyword.</div>)}
        {status === "ready" && view === "channels" && <><h2>Approved channels</h2><div className="chs">{chans.map(CCard)}</div></>}
        {status === "ready" && view === "subs" && (subChans.length
          ? <><h2>Your subscriptions</h2><div className="chs">{subChans.map(CCard)}</div><h2>Latest from them</h2><div className="grid">{vids.filter((v) => subs.includes(v.ch) && match(v)).map(VCard)}</div></>
          : <div className="empty">You have not subscribed to any channel yet.<br />Open Channels and tap Subscribe.</div>)}
      </main>
      <nav>
        {([["home", "◉", "Home"], ["channels", "☰", "Channels"], ["subs", "★", "Subscribed"]] as const).map(([v, i, l]) => (
          <button key={v} className={view === v ? "on" : ""} onClick={() => { setView(v); window.scrollTo(0, 0); }}><i>{i}</i>{l}</button>
        ))}
      </nav>
      {playing && (
        <div className="pl">
          <div className="pbar"><span>Now playing</span><button onClick={() => setPlaying(null)}>Close</button></div>
          <div className="frame"><iframe src={`https://www.youtube-nocookie.com/embed/${playing.id}?rel=0&modestbranding=1&autoplay=1&playsinline=1`} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen /></div>
          <div className="pinfo">
            <h1>{playing.title}</h1>
            <p style={{ color: "var(--mut)", fontSize: 13, margin: "6px 0 12px" }}>{playing.chTitle} · {ago(playing.date)}</p>
            <Sub id={playing.ch} />
            <h2>More from this channel</h2>
            <div className="grid">{vids.filter((x) => x.ch === playing.ch && x.id !== playing.id).slice(0, 12).map(VCard)}</div>
          </div>
        </div>
      )}
    </>
  );
}
