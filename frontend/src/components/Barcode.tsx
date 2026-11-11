import { useMemo } from 'react';

/** Декоративный штрихкод: один и тот же value всегда даёт одинаковый рисунок. */
export function Barcode({ value, className = '' }: { value: string; className?: string }) {
  const { bars, width } = useMemo(() => {
    const source = value || 'barcode';
    let hash = 2166136261;
    let x = 0;
    const out: { x: number; w: number }[] = [];
    for (let i = 0; i < 60; i++) {
      hash ^= source.charCodeAt(i % source.length) + i;
      hash = Math.imul(hash, 16777619) >>> 0;
      const w = 1 + (hash % 3);
      out.push({ x, w });
      x += w + 1 + ((hash >>> 5) % 2);
    }
    return { bars: out, width: x };
  }, [value]);

  return (
    <svg
      className={`barcode ${className}`}
      viewBox={`0 0 ${width} 40`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <g fill="currentColor">
        {bars.map((b) => (
          <rect key={b.x} x={b.x} y={0} width={b.w} height={40} />
        ))}
      </g>
    </svg>
  );
}
