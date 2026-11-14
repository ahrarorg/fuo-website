import { RINGS } from "@/lib/astrolabe";
import { DEPARTMENT_HUES, DEPARTMENT_SLUGS } from "@/lib/departments";

// Rounded so server and client trig results serialize identically (hydration).
const q = (n: number) => Math.round(n * 100) / 100;

export function AstrolabeFallback() {
  const ticks = Array.from({ length: 72 }, (_, i) => {
    const a = (i / 72) * Math.PI * 2;
    const long = i % 6 === 0;
    const r1 = long ? 356 : 364;
    const r2 = 372;
    return {
      x1: q(400 + Math.cos(a) * r1),
      y1: q(400 + Math.sin(a) * r1),
      x2: q(400 + Math.cos(a) * r2),
      y2: q(400 + Math.sin(a) * r2),
      long,
    };
  });

  return (
    <svg
      viewBox="0 0 800 800"
      className="h-full w-full"
      role="img"
      aria-label="Astrolabe: ten orbits around one core"
    >
      <defs>
        <radialGradient id="core-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffd98a" stopOpacity="0.85" />
          <stop offset="40%" stopColor="#e8b84b" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#e8b84b" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="400" cy="400" r="380" fill="none" stroke="#e8b84b" strokeOpacity="0.25" strokeWidth="1" />
      {ticks.map((t, i) => (
        <line
          key={i}
          x1={t.x1}
          y1={t.y1}
          x2={t.x2}
          y2={t.y2}
          stroke="#e8b84b"
          strokeOpacity={t.long ? 0.6 : 0.3}
          strokeWidth={t.long ? 1.6 : 1}
        />
      ))}
      <g className="origin-center animate-[spin_160s_linear_infinite]">
        {RINGS.map((ring, i) => {
          const rx = q(ring.radius * 104);
          const ry = q(Math.max(rx * Math.abs(Math.cos(ring.incl)), rx * 0.16));
          return (
            <ellipse
              key={i}
              cx="400"
              cy="400"
              rx={rx}
              ry={ry}
              fill="none"
              stroke={DEPARTMENT_HUES[DEPARTMENT_SLUGS[i]]}
              strokeOpacity="0.55"
              strokeWidth="1.3"
              transform={`rotate(${q((ring.node * 180) / Math.PI)} 400 400)`}
            />
          );
        })}
      </g>
      <circle cx="400" cy="400" r="120" fill="url(#core-glow)" />
      <circle cx="400" cy="400" r="46" fill="none" stroke="#e8b84b" strokeWidth="2.5" />
      <line x1="400" y1="285" x2="400" y2="515" stroke="#9c7a2f" strokeWidth="1.5" />
      <path d="M400 278 L407 296 L393 296 Z" fill="#ffd98a" />
      <circle cx="400" cy="400" r="14" fill="#ffd98a" fillOpacity="0.9" />
    </svg>
  );
}