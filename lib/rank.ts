import type { Video } from "./config";
import { detectLang } from "./lang";

// Search ranking: typo-tolerant, prefix-aware, multi-script, recency-weighted, language- and subscription-boosted.
const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[\u064B-\u065F\u0670\u0300-\u036F]/g, "");
const toks = (s: string) => norm(s).split(/[^\p{L}\p{N}]+/u).filter(Boolean);

function near(a: string, b: string) {
  const lim = Math.min(a.length, b.length) >= 8 ? 2 : 1;
  if (Math.abs(a.length - b.length) > lim) return false;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[b.length] <= lim;
}
const best = (t: string, field: string[]) => {
  let m = 0;
  for (const w of field) {
    if (w === t) return 1;
    if (t.length >= 2 && w.startsWith(t)) m = Math.max(m, 0.8);
    else if (t.length >= 3 && w.includes(t)) m = Math.max(m, 0.5);
    else if (t.length >= 5 && near(t, w)) m = Math.max(m, 0.6);
  }
  return m;
};

export function rank(q: string, vids: Video[], ctx: { lang?: string; subs?: Set<string> } = {}): Video[] {
  const qt = toks(q);
  if (!qt.length) return vids;
  const need = Math.ceil(qt.length * 0.6), nq = norm(q.trim());
  const now = Date.now();
  const out: { v: Video; s: number }[] = [];
  for (const v of vids) {
    const T = toks(v.title), C = toks(v.chTitle), D = toks(v.desc);
    let s = 0, hit = 0;
    for (const t of qt) {
      const a = best(t, T), b = best(t, C), c = best(t, D);
      if (a || b || c) hit++;
      s += 3 * a + 1.2 * b + 0.6 * c;
    }
    if (hit < need) continue;
    s *= hit / qt.length;
    if (norm(v.title).includes(nq)) s += 4;
    s *= 1 + 0.5 * Math.exp(-(now - +new Date(v.date)) / 864e5 / 365);
    if (ctx.lang && (v.lang === ctx.lang || detectLang(v.title) === ctx.lang)) s *= 1.25;
    if (ctx.subs?.has(v.ch)) s *= 1.15;
    out.push({ v, s });
  }
  return out.sort((a, b) => b.s - a.s).map((x) => x.v);
}
