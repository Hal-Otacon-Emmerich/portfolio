/**
 * Изометрический чертёж одноплатного компьютера в разобранном виде.
 * Плата рисуется в плоских координатах (560×300) и проецируется матрицей M.
 */
const M = { a: 0.85, b: -0.3, c: 0.5, d: 0.42, e: 40, f: 262 };
const matrix = `matrix(${M.a} ${M.b} ${M.c} ${M.d} ${M.e} ${M.f})`;
const project = (x: number, y: number): [number, number] => [
  M.a * x + M.c * y + M.e,
  M.b * x + M.d * y + M.f,
];

interface Floating {
  lift: number;
  x: number;
  y: number;
  w: number;
  h: number;
  inner?: boolean;
}

/** Детали, «приподнятые» над платой. */
const floating: Floating[] = [
  { lift: 120, x: 330, y: 105, w: 80, h: 70 },
  { lift: 165, x: 430, y: 70, w: 110, h: 90, inner: true },
  { lift: 130, x: 300, y: 10, w: 70, h: 40 },
  { lift: 95, x: 455, y: 200, w: 90, h: 70, inner: true },
];

const callouts: { n: string; at: [number, number]; lift: number }[] = [
  { n: '01', at: [440, 80], lift: 205 },
  { n: '02', at: [270, 32], lift: 40 },
  { n: '03', at: [140, 150], lift: 30 },
  { n: '04', at: [560, 210], lift: 140 },
  { n: '05', at: [330, 260], lift: -10 },
];

export function BoardIllustration({ className = '' }: { className?: string }) {
  const pins = Array.from({ length: 20 }, (_, i) => 70 + i * 19);

  return (
    <svg
      className={`board ${className}`}
      viewBox="0 0 820 440"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {/* Плата */}
      <g transform={matrix} className="board__plane">
        <rect x="0" y="0" width="560" height="300" rx="20" className="board__pcb" />
        {[
          [24, 24],
          [536, 24],
          [24, 276],
          [536, 276],
        ].map(([cx, cy]) => (
          <g key={`${cx}-${cy}`}>
            <circle cx={cx} cy={cy} r="11" />
            <circle cx={cx} cy={cy} r="5" />
          </g>
        ))}

        {/* GPIO */}
        <rect x="62" y="12" width="390" height="40" className="board__thin" />
        {pins.map((x) => (
          <g key={x}>
            <rect x={x} y="18" width="9" height="9" />
            <rect x={x} y="36" width="9" height="9" />
          </g>
        ))}

        {/* SoC */}
        <rect x="195" y="105" width="100" height="100" className="board__soc" />
        <rect x="212" y="122" width="66" height="66" className="board__soc-core" />

        <rect x="320" y="110" width="80" height="70" />
        <rect x="70" y="85" width="95" height="125" className="board__dashed" />
        <rect x="415" y="80" width="120" height="160" className="board__dashed" />
        <rect x="120" y="232" width="56" height="28" rx="14" />
        <rect x="230" y="235" width="140" height="40" className="board__dashed" />

        {/* Порты */}
        <rect x="545" y="40" width="50" height="60" />
        <rect x="545" y="115" width="50" height="60" />
        <rect x="545" y="190" width="50" height="70" />
        <rect x="-20" y="120" width="34" height="50" />
      </g>

      {/* Выносные линии */}
      {floating.map((f) => {
        const [x1, y1] = project(f.x, f.y + f.h);
        const [x2, y2] = project(f.x + f.w, f.y);
        return (
          <g key={`lead-${f.x}`} className="board__leader">
            <line x1={x1} y1={y1 - f.lift} x2={x1} y2={y1} />
            <line x1={x2} y1={y2 - f.lift} x2={x2} y2={y2} />
          </g>
        );
      })}

      {/* Поднятые детали */}
      {floating.map((f) => (
        <g key={`part-${f.x}`} transform={`translate(0 ${-f.lift}) ${matrix}`} className="board__part">
          <rect x={f.x} y={f.y} width={f.w} height={f.h} />
          {f.inner && <rect x={f.x + 14} y={f.y + 14} width={f.w - 28} height={f.h - 28} />}
        </g>
      ))}

      {/* Позиции */}
      {callouts.map((c) => {
        const [x, y] = project(c.at[0], c.at[1]);
        return (
          <g key={c.n} transform={`translate(${x} ${y - c.lift})`} className="board__callout">
            <circle r="12" />
            <text y="3.5" textAnchor="middle">
              {c.n}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
