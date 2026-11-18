import { useEffect, useRef, useState } from "react";
import type { Insulation } from "@/lib/utils/heating";

export type CalcValues = { area: number; insulation: Insulation; people: number; power: number };

/** Counts smoothly to `value` so the kW display "rolls" when an input changes. */
function useTweened(value: number) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const start = performance.now();
    const a = from.current;
    let frame = 0;
    const step = (t: number) => {
      const k = Math.min(1, (t - start) / 400);
      const v = Math.round(a + (value - a) * (1 - (1 - k) ** 3));
      setShown(v);
      from.current = v;
      if (k < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return shown;
}

const INSULATION = {
  weak: { label: "Gyenge", jacket: 4, color: "#d9534f", losses: 3 },
  medium: { label: "Közepes", jacket: 10, color: "#e0a526", losses: 1 },
  good: { label: "Jó", jacket: 17, color: "#a2c65b", losses: 0 },
} as const;

// Boiler casing (the insulation jacket is drawn around it)
const B = { x: 214, y: 92, w: 170, h: 296 };
// Hot-water gauge
const G = { cx: 299, cy: 318, r: 34 };

/**
 * Animated pellet boiler next to the Kazánkalkulátor.
 * - display: the calculated kW (more kW → bigger flame, faster pellet feed, more heat from the flue)
 * - Szigetelés: thickness/colour of the insulation jacket + heat escaping through weak insulation
 * - Melegvíz-igény: needle of the hot-water gauge and the fill of the hot-water bar
 */
export function BoilerAnimation({ insulation, people, power }: CalcValues) {
  const kw = useTweened(power);
  const level = Math.min(1, Math.max(0, (power - 6) / 39)); // 6 … 45 kW → 0 … 1
  const ins = INSULATION[insulation];
  const needle = -120 + (Math.min(8, Math.max(0, people)) / 8) * 240; // 0 … 8 fő
  const feed = (1.6 - level * 1.0).toFixed(2); // seconds per auger cycle
  const flame = 0.65 + level * 0.5;
  const j = ins.jacket;

  return (
    <div
      className="boiler-anim"
      role="img"
      aria-label={`Pelletkazán: ${power} kW, ${ins.label.toLowerCase()} szigetelés, melegvíz ${people} főre`}
    >
      <svg viewBox="0 0 420 440" aria-hidden="true">
        <defs>
          <linearGradient id="ba-casing" x1="0" x2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.6" stopColor="#f3f5ef" />
            <stop offset="1" stopColor="#e3e7dc" />
          </linearGradient>
          <linearGradient id="ba-silo" x1="0" x2="1">
            <stop offset="0" stopColor="#e9ede3" />
            <stop offset="0.5" stopColor="#ffffff" />
            <stop offset="1" stopColor="#dfe4d6" />
          </linearGradient>
          <pattern id="ba-pellets" width="14" height="9" patternUnits="userSpaceOnUse">
            <rect width="14" height="9" fill="#b97a35" />
            <rect x="1" y="1" width="7" height="3.2" rx="1.6" fill="#d9a35d" />
            <rect x="8" y="5" width="6" height="3.2" rx="1.6" fill="#c98b45" />
            <rect x="-3" y="5" width="6" height="3.2" rx="1.6" fill="#e2b06c" />
          </pattern>
          <pattern
            id="ba-wool"
            width="8"
            height="8"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <rect width="8" height="8" fill={ins.color} opacity="0.18" />
            <rect width="3" height="8" fill={ins.color} opacity="0.45" />
          </pattern>
          <radialGradient id="ba-fire" cx="50%" cy="80%" r="75%">
            <stop offset="0" stopColor="#6b2d0b" />
            <stop offset="1" stopColor="#1a1411" />
          </radialGradient>
          <linearGradient id="ba-water" x1="0" x2="0" y1="1" y2="0">
            <stop offset="0" stopColor="#3a8dde" />
            <stop offset="1" stopColor="#e2553c" />
          </linearGradient>
          <clipPath id="ba-window">
            <rect x="254" y="186" width="90" height="74" rx="10" />
          </clipPath>
        </defs>

        {/* floor */}
        <rect x="0" y="404" width="420" height="36" fill="#f1f3ec" />
        <line x1="0" y1="404" x2="420" y2="404" stroke="#dfe3d6" />

        {/* flue + warm air (more kW → more puffs, faster) */}
        <rect x="318" y="34" width="22" height="60" rx="3" fill="#b9c0b0" />
        <rect x="314" y="30" width="30" height="8" rx="3" fill="#9ea596" />
        <g
          className="ba-heat"
          style={{ "--speed": `${(3 - level * 1.6).toFixed(2)}s` } as React.CSSProperties}
        >
          {[0, 1, 2].map((i) => (
            <path
              key={i}
              className="ba-puff"
              style={{
                animationDelay: `${-i * 0.9}s`,
                opacity: i < 1 + Math.round(level * 2) ? 1 : 0,
              }}
              d="M329 28 c-6 -5 6 -9 0 -14 c-6 -5 6 -9 0 -14"
              fill="none"
              stroke="#e08a3c"
              strokeWidth="3"
              strokeLinecap="round"
            />
          ))}
        </g>

        {/* pellet silo */}
        <rect
          x="24"
          y="96"
          width="112"
          height="292"
          rx="14"
          fill="url(#ba-silo)"
          stroke="#cfd5c4"
        />
        <path d="M24 120 Q80 82 136 120" fill="#ffffff" stroke="#cfd5c4" />
        <rect x="24" y="352" width="112" height="10" fill="#a2c65b" />
        <text x="80" y="380" textAnchor="middle" className="ba-label" fill="#a2c65b">
          PELLET
        </text>
        <rect x="46" y="136" width="68" height="200" rx="8" fill="#f7f8f4" stroke="#cfd5c4" />
        <g className="ba-silo-fill">
          <rect x="48" y="196" width="64" height="138" rx="6" fill="url(#ba-pellets)" />
          <path d="M48 200 Q64 188 80 196 T112 194 V204 H48 Z" fill="url(#ba-pellets)" />
        </g>
        <rect x="52" y="140" width="6" height="190" rx="3" fill="#ffffff" opacity="0.6" />

        {/* auger tube: silo → boiler, pellets travel along it */}
        <path
          d="M128 348 C170 348 170 268 214 262"
          fill="none"
          stroke="#c3c9ba"
          strokeWidth="16"
          strokeLinecap="round"
        />
        <path
          className="ba-auger"
          d="M128 348 C170 348 170 268 214 262"
          fill="none"
          stroke="#c98b45"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="5 9"
          style={{ animationDuration: `${feed}s` }}
        />

        {/* insulation jacket (thicker + greener = better insulation) */}
        <rect
          className="ba-jacket"
          x={B.x - j}
          y={B.y - j}
          width={B.w + 2 * j}
          height={B.h + 2 * j}
          rx={16 + j}
          fill="url(#ba-wool)"
          stroke={ins.color}
          strokeWidth="1.5"
        />
        {/* heat escaping through weak insulation */}
        {[0, 1, 2].map((i) => (
          <g key={i} className="ba-loss" style={{ opacity: i < ins.losses ? 1 : 0 }}>
            <path
              style={{ animationDelay: `${-i * 0.6}s` }}
              d={`M${B.x - j - 6} ${180 + i * 70} c-8 -6 -8 -14 0 -20 c8 -6 8 -14 0 -20`}
              fill="none"
              stroke="#e2553c"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              style={{ animationDelay: `${-i * 0.6 - 0.3}s` }}
              d={`M${B.x + B.w + j + 6} ${200 + i * 70} c8 -6 8 -14 0 -20 c-8 -6 -8 -14 0 -20`}
              fill="none"
              stroke="#e2553c"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>
        ))}

        {/* boiler casing */}
        <rect
          x={B.x}
          y={B.y}
          width={B.w}
          height={B.h}
          rx="16"
          fill="url(#ba-casing)"
          stroke="#cfd5c4"
        />
        <rect x={B.x} y={B.y + B.h - 26} width={B.w} height="26" rx="0" fill="#a2c65b" />
        <rect x={B.x} y={B.y + B.h - 10} width={B.w} height="10" rx="0" fill="#a2c65b" />

        {/* control panel with kW display */}
        <rect x="232" y="108" width="134" height="58" rx="10" fill="#2b2b2b" />
        <rect x="242" y="116" width="78" height="42" rx="6" fill="#161616" />
        <text x="281" y="146" textAnchor="middle" className="ba-lcd" fill="#a2c65b">
          {kw}
        </text>
        <text x="342" y="132" textAnchor="middle" className="ba-lcd-unit" fill="#a2c65b">
          kW
        </text>
        <circle cx="342" cy="148" r="5" fill="#a2c65b" className="ba-led" />

        {/* fire window */}
        <rect x="248" y="180" width="102" height="86" rx="14" fill="#c9cfc0" />
        <rect x="254" y="186" width="90" height="74" rx="10" fill="url(#ba-fire)" />
        <g clipPath="url(#ba-window)">
          <g
            className="ba-flame"
            style={{ transform: `scale(${flame})`, transformOrigin: "299px 262px" }}
          >
            <path
              className="ba-tongue a"
              d="M272 262 C266 246 274 236 280 226 C282 238 290 242 288 262 Z"
              fill="#e8622a"
            />
            <path
              className="ba-tongue b"
              d="M286 262 C280 240 292 222 299 204 C306 222 318 240 312 262 Z"
              fill="#f08a2c"
            />
            <path
              className="ba-tongue c"
              d="M310 262 C308 244 316 238 320 226 C326 238 332 248 326 262 Z"
              fill="#e8622a"
            />
            <path
              className="ba-tongue d"
              d="M292 262 C290 248 296 238 299 228 C302 238 308 248 306 262 Z"
              fill="#ffc23d"
            />
          </g>
          <rect x="254" y="254" width="90" height="8" fill="#3a1d0e" />
        </g>
        <rect x="258" y="190" width="8" height="66" rx="4" fill="#ffffff" opacity="0.12" />

        {/* hot-water gauge: needle follows Melegvíz-igény */}
        <circle cx={G.cx} cy={G.cy} r={G.r + 5} fill="#c9cfc0" />
        <circle cx={G.cx} cy={G.cy} r={G.r} fill="#ffffff" />
        <path
          d={arc(G.cx, G.cy, G.r - 7, -120, 120)}
          fill="none"
          stroke="url(#ba-water)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {Array.from({ length: 9 }, (_, i) => {
          const a = ((-120 + i * 30 - 90) * Math.PI) / 180;
          return (
            <line
              key={i}
              x1={G.cx + Math.cos(a) * (G.r - 14)}
              y1={G.cy + Math.sin(a) * (G.r - 14)}
              x2={G.cx + Math.cos(a) * (G.r - 18)}
              y2={G.cy + Math.sin(a) * (G.r - 18)}
              stroke="#8a9180"
              strokeWidth="1.5"
            />
          );
        })}
        <g
          className="ba-needle"
          style={{ transform: `rotate(${needle}deg)`, transformOrigin: `${G.cx}px ${G.cy}px` }}
        >
          <path
            d={`M${G.cx - 3} ${G.cy} L${G.cx} ${G.cy - G.r + 9} L${G.cx + 3} ${G.cy} Z`}
            fill="#2b2b2b"
          />
        </g>
        <circle cx={G.cx} cy={G.cy} r="5" fill="#2b2b2b" />
        <text x={G.cx} y={G.cy + 22} textAnchor="middle" className="ba-gauge-val" fill="#333333">
          {people} fő
        </text>

        {/* labels */}
        <text x="299" y={B.y + B.h - 9} textAnchor="middle" className="ba-label" fill="#2b2b2b">
          PELLETKAZÁN
        </text>
        {/* plinth + shadow */}
        <ellipse cx="300" cy="404" rx="100" ry="6" fill="#000" opacity="0.08" />
        <ellipse cx="80" cy="404" rx="62" ry="5" fill="#000" opacity="0.08" />
      </svg>

      <ul className="boiler-legend">
        <li>
          <span className="dot" style={{ background: ins.color }} />
          Szigetelés: <strong>{ins.label}</strong>
        </li>
        <li>
          <span className="dot" style={{ background: "linear-gradient(#e2553c,#3a8dde)" }} />
          Melegvíz: <strong>{people} fő</strong>
        </li>
        <li>
          <span className="dot" style={{ background: "#a2c65b" }} />
          Teljesítmény: <strong>{power} kW</strong>
        </li>
      </ul>
    </div>
  );
}

/** SVG arc path between two angles (degrees, 0 = up, clockwise). */
function arc(cx: number, cy: number, r: number, from: number, to: number) {
  const p = (deg: number) => {
    const a = ((deg - 90) * Math.PI) / 180;
    return `${(cx + Math.cos(a) * r).toFixed(2)} ${(cy + Math.sin(a) * r).toFixed(2)}`;
  };
  return `M${p(from)} A${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${p(to)}`;
}
