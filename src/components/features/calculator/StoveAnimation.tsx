import { useEffect, useRef, useState } from "react";

/** Pellets falling into the hopper: fixed pseudo-random layout (same on server and client). */
const PELLETS = Array.from({ length: 44 }, (_, i) => {
  const r = (n: number) => {
    const x = Math.sin(i * 12.9898 + n * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };
  return {
    x: 150 + (r(1) - 0.5) * 34 + (r(2) - 0.5) * 10,
    delay: r(3) * 2.4,
    rot: Math.round(r(4) * 180),
    len: 7 + r(5) * 4,
    drift: (r(6) - 0.5) * 12,
  };
});

/** Counts smoothly to `value` so the kW display "rolls" when a slider moves. */
function useTweened(value: number) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const start = performance.now();
    const a = from.current;
    let frame = 0;
    const step = (t: number) => {
      const k = Math.min(1, (t - start) / 350);
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

/**
 * Animated pellet stove next to the Kazánkalkulátor: pellets fall into the hopper and the
 * display shows the calculated power. More kW → more pellets, faster fall, bigger flame.
 */
export function StoveAnimation({ power }: { power: number }) {
  const kw = useTweened(power);
  // 0 … 1 between a small (6 kW) and a large (45 kW) appliance
  const level = Math.min(1, Math.max(0, (power - 6) / 39));
  const visible = Math.round(14 + level * (PELLETS.length - 14));
  const fall = 2.6 - level * 1.2; // seconds per pellet
  const flame = 0.72 + level * 0.45;

  return (
    <div className="stove-anim" role="img" aria-label={`Pelletkályha, ${power} kW teljesítmény`}>
      <svg viewBox="0 0 300 470" aria-hidden="true">
        <defs>
          <radialGradient id="stove-glow" cx="50%" cy="38%" r="55%">
            <stop offset="0" stopColor="#f6dcc0" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="stove-body" x1="0" x2="1">
            <stop offset="0" stopColor="#2f3640" />
            <stop offset="0.45" stopColor="#3d4652" />
            <stop offset="1" stopColor="#2a3038" />
          </linearGradient>
          <linearGradient id="stove-hopper" x1="0" x2="1">
            <stop offset="0" stopColor="#30363e" />
            <stop offset="0.5" stopColor="#424b57" />
            <stop offset="1" stopColor="#2c3239" />
          </linearGradient>
          <radialGradient id="stove-fire" cx="50%" cy="60%" r="60%">
            <stop offset="0" stopColor="#5a2a0c" />
            <stop offset="1" stopColor="#1d1410" />
          </radialGradient>
          <linearGradient id="stove-ring" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#d9b27a" />
            <stop offset="1" stopColor="#9a7445" />
          </linearGradient>
          <clipPath id="stove-window">
            <circle cx="150" cy="378" r="35" />
          </clipPath>
        </defs>

        <rect width="300" height="470" fill="url(#stove-glow)" />

        {/* falling pellets */}
        <g className="stove-pellets">
          {PELLETS.slice(0, visible).map((p, i) => (
            <rect
              key={i}
              className="stove-pellet"
              x={p.x - p.len / 2}
              y={-12}
              width={p.len}
              height={5}
              rx={2.5}
              style={
                {
                  "--delay": `${-(p.delay * fall) / 2.4}s`,
                  "--dur": `${fall}s`,
                  "--rot": `${p.rot}deg`,
                  "--drift": `${p.drift}px`,
                  transformOrigin: `${p.x}px -10px`,
                } as React.CSSProperties
              }
            />
          ))}
        </g>

        {/* hopper */}
        <rect x="104" y="228" width="92" height="9" rx="3" fill="#59626e" />
        <path d="M106 237 H194 V290 L180 304 H120 L106 290 Z" fill="url(#stove-hopper)" />
        <path d="M108 290 L120 302 H180 L192 290 Z" fill="#c98b45" className="stove-hopper-fill" />
        <g fill="#a86a2c" opacity="0.8">
          {[116, 128, 140, 152, 164, 176].map((x, i) => (
            <rect key={x} x={x} y={292 + (i % 2) * 3} width="7" height="3" rx="1.5" />
          ))}
        </g>

        {/* body */}
        <rect x="88" y="304" width="124" height="128" rx="14" fill="url(#stove-body)" />
        <rect x="88" y="318" width="124" height="2" fill="#c9a26b" opacity="0.7" />
        {/* display */}
        <rect x="118" y="308" width="64" height="10" rx="3" fill="#121518" />
        <text
          x="150"
          y="316"
          textAnchor="middle"
          className="stove-display"
          fill="#f0a73a"
          fontSize="8"
        >
          {kw} kW
        </text>

        {/* fire window */}
        <circle cx="150" cy="378" r="41" fill="url(#stove-ring)" />
        <circle cx="150" cy="378" r="35" fill="url(#stove-fire)" />
        <g clipPath="url(#stove-window)">
          <g
            className="stove-flame"
            style={{ transform: `scale(${flame})`, transformOrigin: "150px 410px" }}
          >
            <path
              className="flame-outer"
              d="M150 344 C164 362 174 378 170 394 C167 406 158 412 150 412 C142 412 133 406 130 394 C127 380 138 366 150 344 Z"
              fill="#e8622a"
            />
            <path
              className="flame-inner"
              d="M150 366 C158 377 162 386 160 396 C158 404 154 408 150 408 C146 408 142 404 140 396 C138 387 143 377 150 366 Z"
              fill="#f7b733"
            />
          </g>
          <ellipse cx="150" cy="410" rx="22" ry="4" fill="#f3a03a" opacity="0.6" />
        </g>
        <rect x="98" y="402" width="18" height="2.5" rx="1.2" fill="#1b1f24" />
        <rect x="98" y="408" width="18" height="2.5" rx="1.2" fill="#1b1f24" />
        <circle cx="198" cy="406" r="3" fill="#1b1f24" />
        <circle cx="198" cy="406" r="1.2" fill="#6b7480" />

        {/* legs + shadow */}
        <ellipse cx="150" cy="452" rx="74" ry="8" fill="#000" opacity="0.12" />
        <rect x="104" y="430" width="14" height="16" rx="3" fill="#20252b" />
        <rect x="182" y="430" width="14" height="16" rx="3" fill="#20252b" />
      </svg>
    </div>
  );
}
