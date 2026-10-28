import Link from "next/link";

const stars = Array.from({ length: 70 }, (_, i) => ({ x: (i * 197) % 1024, y: (i * 89) % 470, r: 0.8 + (i % 3) * 0.5 }));
const lights = Array.from({ length: 17 }, (_, i) => { const t = Math.pow(i / 16, 1.5); return { t, y: 550 + 104 * t, r: 2.5 + 15 * t, dx: 384 * t }; });

export const metadata = { title: "Page not found · MAAR Islamic Studio" };

export default function NotFound() {
  return (
    <div className="nf">
      <svg viewBox="0 0 1024 768" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1a0638" /><stop offset=".55" stopColor="#4a0f8f" /><stop offset="1" stopColor="#a455d9" /></linearGradient>
          <linearGradient id="gr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a1170" /><stop offset=".25" stopColor="#1b0838" /><stop offset="1" stopColor="#0c0420" /></linearGradient>
          <radialGradient id="moon"><stop offset="0" stopColor="#fff" /><stop offset="1" stopColor="#e9c9ff" /></radialGradient>
          <filter id="glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="5" /></filter>
        </defs>
        <rect width="1024" height="768" fill="url(#sky)" />
        {stars.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff" opacity=".8" />)}
        {[330, 270, 215, 165].map((r, i) => <circle key={r} cx="519" cy="505" r={r} fill="#c27bff" opacity={0.07 + i * 0.03} />)}
        <circle cx="519" cy="505" r="125" fill="url(#moon)" />
        <g fill="#6a3aa3" opacity=".55"><path d="M100 545l12-24 8 6 90 12v6zM870 548l60-8 20-14 6 14-6 8z" /><rect x="797" y="480" width="8" height="66" /><rect x="787" y="458" width="28" height="18" rx="4" /></g>
        <g fill="#0f1245">
          <path d="M178 404C300 445 420 448 492 428L496 446C410 452 300 440 178 404Z" />
          <path d="M814 292C700 400 600 430 528 428L524 446C610 440 720 400 814 292Z" />
          <path d="M489 306L504 392H516L500 322Z" />
          <ellipse cx="510" cy="422" rx="31" ry="33" />
          {[[342, 463], [415, 464], [612, 429], [682, 402]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="21" />)}
          <path d="M466 440l-8 30M552 440l8 24M515 450v20" stroke="#0f1245" strokeWidth="5" />
        </g>
        <rect y="548" width="1024" height="220" fill="url(#gr)" />
        {lights.map((l, i) => (
          <g key={i} fill="#fff">
            {[452 - l.dx, 573 + l.dx].map((x) => <g key={x}><circle cx={x} cy={l.y} r={l.r * 1.8} fill="#b36bff" opacity=".6" filter="url(#glow)" /><circle cx={x} cy={l.y} r={l.r} /></g>)}
          </g>
        ))}
      </svg>
      <div className="txt">
        <h1>404</h1>
        <p>This page has left the runway. Let's take you back to the Studio.</p>
        <Link href="/">Back to MAAR Islamic Studio</Link>
      </div>
    </div>
  );
}
