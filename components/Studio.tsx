"use client";
import { useEffect, useMemo, useState } from "react";
import { TOPICS, type Channel, type Video } from "@/lib/config";

type View = "home" | "channels" | "subs";
type Info = { id: string; title: string; thumb: string; count?: number };
const ago = (d: string) => {
  const s = (Date.now() - +new Date(d)) / 1000;
  for (const [n, l] of [[31536000, "year"], [2592000, "month"], [604800, "week"], [86400, "day"], [3600, "hour"]] as const)
    if (s >= n) { const x = Math.floor(s / n); return `${x} ${l}${x > 1 ? "s" : ""} ago`; }
  return "Just now";
};

export default function Studio({ authSlot }: { authSlot?: React.ReactNode }) {
  const [chans, setChans] = useState<Channel[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errs, setErrs] = useState<string[]>([]);
  const [view, setView] = useState<View>("home");
  const [topic, setTopic] = useState("All");
  const [q, setQ] = useState("");
  const [subs, setSubs] = useState<string[]>([]);
  const [info, setInfo] = useState<Record<string, Info>>({});
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState<Video | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [chLoad, setChLoad] = useState(false);

  useEffect(() => {
    try { setSubs(JSON.parse(localStorage.getItem("maar_subs") || "[]")); setInfo(JSON.parse(localStorage.getItem("maar_subinfo") || "{}")); } catch {}
    setReady(true);
    fetch("/api/videos").then((r) => r.json()).then((j) => {
      if (j.error) { setErrs([j.error]); setStatus("error"); return; }
      setChans(j.channels);
      setErrs(j.channels.length ? [] : [j.errors?.[0] || "No approved channels could be loaded. Check the handles in lib/config.ts."]);
      setStatus("ready");
    }).catch(() => { setErrs(["Could not reach the server."]); setStatus("error"); });
  }, []);
  useEffect(() => { if (ready) { localStorage.setItem("maar_subs", JSON.stringify(subs)); localStorage.setItem("maar_subinfo", JSON.stringify(info)); } }, [subs, info, ready]);
  useEffect(() => { document.body.style.overflow = playing ? "hidden" : ""; }, [playing]);
  useEffect(() => {
    if (status !== "ready") return;
    const go = () => { const id = new URLSearchParams(location.search).get("channel"); id ? openChannel(id, false) : setOpenId(null); };
    go(); window.addEventListener("popstate", go); return () => window.removeEventListener("popstate", go);
  }, [status]); // eslint-disable-line

  async function openChannel(id: string, push = true) {
    setPlaying(null); setOpenId(id); window.scrollTo(0, 0);
    if (push) history.pushState(null, "", `?channel=${id}`);
    const c = chans.find((x) => x.id === id);
    if (c && !c.partial) return;
    setChLoad(true);
    try {
      const j = await (await fetch(`/api/channel?id=${id}`)).json();
      if (j.channel) setChans((p) => [...p.filter((x) => x.id !== id), j.channel]);
    } catch {}
    setChLoad(false);
  }
  function closeChannel() { setOpenId(null); history.pushState(null, "", "/"); }

  const vids = useMemo(() => chans.flatMap((c) => c.vids).sort((a, b) => +new Date(b.date) - +new Date(a.date)), [chans]);
  const match = (v: Video) => {
    const hay = (v.title + " " + v.desc).toLowerCase();
    if (topic !== "All" && !new RegExp(TOPICS[topic], "i").test(hay)) return false;
    return q.toLowerCase().split(/\s+/).filter(Boolean).every((w) => hay.includes(w) || v.chTitle.toLowerCase().includes(w));
  };
  const toggle = (id: string) => {
    const c = chans.find((x) => x.id === id);
    if (c) setInfo((i) => ({ ...i, [id]: { id, title: c.title, thumb: c.thumb } }));
    setSubs((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const VCard = (v: Video) => (
    <div className="v" key={v.id} tabIndex={0} onClick={() => setPlaying(v)} onKeyDown={(e) => e.key === "Enter" && setPlaying(v)}>
      <div className="th"><img src={v.thumb} alt="" loading="eager" /></div>
      <div className="in"><h3>{v.title}</h3><p><span className="clink" onClick={(e) => { e.stopPropagation(); openChannel(v.ch); }}>{v.chTitle}</span> · {ago(v.date)}</p></div>
    </div>
  );
  const Sub = ({ id }: { id: string }) => (
    <button className={"sub" + (subs.includes(id) ? " on" : "")} onClick={() => toggle(id)}>{subs.includes(id) ? "Subscribed" : "Subscribe"}</button>
  );
  const CCard = (c: Info) => (
    <div className="ch" key={c.id}>
      <img src={c.thumb} alt="" loading="eager" onClick={() => openChannel(c.id)} />
      <div className="clk" onClick={() => openChannel(c.id)}><b>{c.title}</b><small>{c.count != null ? `${c.count} Islamic videos` : "Open channel"}</small></div>
      <Sub id={c.id} />
    </div>
  );
  const cInfo = (c: Channel): Info => ({ id: c.id, title: c.title, thumb: c.thumb, count: c.vids.length });

  const list = vids.filter(match);
  const subList: Info[] = subs.map((id) => { const c = chans.find((x) => x.id === id); return c ? cInfo(c) : info[id]; }).filter(Boolean);
  const cur = openId ? chans.find((c) => c.id === openId && !c.partial) || chans.find((c) => c.id === openId) : null;

  return (
    <>
      <header>
        <div className="top"><div className="brand" onClick={() => { setOpenId(null); setView("home"); history.pushState(null, "", "/"); }}><img src="/logo.svg" alt="MAAR Islamic Studio" /><div><b>مَعَار</b><span>MAAR Islamic Studio</span></div></div>{authSlot}</div>
        <div className="search"><input type="search" value={q} onChange={(e) => { setQ(e.target.value.trim()); if (view === "channels") setView("home"); }} placeholder="Search Islamic videos and channels…" /></div>
      </header>
      {!(view === "channels" && !openId) && (
        <div className="chips">{Object.keys(TOPICS).map((t) => <button key={t} className={"chip" + (t === topic ? " on" : "")} onClick={() => setTopic(t)}>{t}</button>)}</div>
      )}
      <main>
        {status === "loading" && <div className="empty"><div className="orbit" />Loading Islamic videos…</div>}
        {errs[0] && <div className="err">{errs[0]}</div>}
        {status === "ready" && openId && (
          <>
            <button className="back" onClick={closeChannel}>← Back</button>
            {chLoad && <div className="empty"><div className="orbit" />Loading channel…</div>}
            {cur && (
              <>
                <div className="chead"><img src={cur.thumb} alt="" /><div><h1>{cur.title}</h1><small>{cur.vids.length} Islamic videos{cur.partial ? " found so far" : ""}</small></div><Sub id={cur.id} /></div>
                <a className="ytl" href={`https://www.youtube.com/channel/${cur.id}`} target="_blank" rel="noreferrer">Open on YouTube ↗</a>
                <h2>Videos</h2>
                <div className="grid">{cur.vids.filter(match).sort((a, b) => +new Date(b.date) - +new Date(a.date)).map(VCard)}</div>
              </>
            )}
            {!cur && !chLoad && <div className="empty">This channel is not available.</div>}
          </>
        )}
        {status === "ready" && !openId && view === "home" && !q && topic === "All" && chans.length > 0 && (
          <section className="hero">
            <span className="tag">Approved Islamic content only</span>
            <h1>Knowledge, <em>illuminated.</em></h1>
            <p>Every video and channel here is checked as Islamic. Nothing else ever reaches your screen.</p>
            <div className="stats"><div><b>{chans.length}</b><small>Channels</small></div><div><b>{vids.length}</b><small>Videos</small></div><div><b>{subs.length}</b><small>Subscribed</small></div></div>
          </section>
        )}
        {status === "ready" && !openId && view === "home" && (list.length ? <><h2>{q || topic !== "All" ? "Results" : "Latest"}</h2><div className="grid">{list.map(VCard)}</div></> : <div className="empty">No Islamic videos match. Try another keyword.</div>)}
        {status === "ready" && !openId && view === "channels" && <><h2>Islamic channels</h2><div className="chs">{chans.filter((c) => !q || c.title.toLowerCase().includes(q.toLowerCase())).map((c) => CCard(cInfo(c)))}</div></>}
        {status === "ready" && !openId && view === "subs" && (subList.length
          ? <><h2>Your subscriptions</h2><div className="chs">{subList.map(CCard)}</div><h2>Latest from them</h2><div className="grid">{vids.filter((v) => subs.includes(v.ch) && match(v)).map(VCard)}</div></>
          : <div className="empty">You have not subscribed to any channel yet.<br />Open Channels and tap Subscribe.</div>)}
      </main>
      <nav>
        {([["home", "◉", "Home"], ["channels", "☰", "Channels"], ["subs", "★", "Subscribed"]] as const).map(([v, i, l]) => (
          <button key={v} className={!openId && view === v ? "on" : ""} onClick={() => { setView(v); if (openId) closeChannel(); window.scrollTo(0, 0); }}><i>{i}</i>{l}</button>
        ))}
      </nav>
      {playing && (
        <div className="pl">
          <div className="pbar"><span>Now playing</span><button onClick={() => setPlaying(null)}>Close</button></div>
          <div className="frame"><iframe src={`https://www.youtube-nocookie.com/embed/${playing.id}?rel=0&modestbranding=1&autoplay=1&playsinline=1`} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen /></div>
          <div className="pinfo">
            <h1>{playing.title}</h1>
            <p style={{ color: "var(--mut)", fontSize: 13, margin: "6px 0 12px" }}><span className="clink" onClick={() => openChannel(playing.ch)}>{playing.chTitle}</span> · {ago(playing.date)}</p>
            <Sub id={playing.ch} />
            <h2>More from this channel</h2>
            <div className="grid">{vids.filter((x) => x.ch === playing.ch && x.id !== playing.id).slice(0, 12).map(VCard)}</div>
          </div>
        </div>
      )}
    </>
  );
}
