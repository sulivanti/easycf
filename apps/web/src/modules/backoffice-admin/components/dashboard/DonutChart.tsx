/**
 * @contract UX-000-M02, UX-DASH-001
 * Donut chart with SVG segments, center total, and legend.
 */

interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  title: string;
  segments: DonutSegment[];
  total: number;
}

const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function DonutChart({ title, segments, total }: DonutChartProps) {
  // Calculate dash offsets from cumulative percentages
  const arcs = segments.reduce<
    Array<DonutSegment & { dashArray: number; dashOffset: number; pct: number }>
  >((acc, seg) => {
    const prev = acc.length > 0 ? acc[acc.length - 1] : null;
    const prevEnd = prev ? (prev.dashOffset / -CIRCUMFERENCE + prev.pct) : 0;
    const pct = seg.value / total;
    const dashArray = pct * CIRCUMFERENCE;
    const dashOffset = -prevEnd * CIRCUMFERENCE;
    acc.push({ ...seg, dashArray, dashOffset, pct });
    return acc;
  }, []);

  return (
    <div className="rounded-2xl border border-a1-border bg-white p-6">
      <h3 className="mb-5 text-sm font-bold text-a1-text-primary">{title}</h3>
      <div className="flex items-center gap-8">
        {/* SVG donut */}
        <div className="relative size-36 shrink-0">
          <svg viewBox="0 0 100 100" className="size-full -rotate-90">
            {/* Background track */}
            <circle
              cx="50" cy="50" r={RADIUS}
              fill="transparent"
              stroke="#F0F0EE"
              strokeWidth="14"
            />
            {/* Segments */}
            {arcs.map((arc) => (
              <circle
                key={arc.label}
                cx="50" cy="50" r={RADIUS}
                fill="transparent"
                stroke={arc.color}
                strokeWidth="14"
                strokeDasharray={`${arc.dashArray} ${CIRCUMFERENCE - arc.dashArray}`}
                strokeDashoffset={arc.dashOffset}
                strokeLinecap="round"
              />
            ))}
          </svg>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-2xl font-extrabold text-a1-text-primary">
              {total}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-[1px] text-a1-text-hint">
              TOTAL
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-3">
          {arcs.map((arc) => (
            <div key={arc.label} className="flex items-center gap-2.5">
              <span
                className="inline-block size-2 shrink-0 rounded-full"
                style={{ backgroundColor: arc.color }}
              />
              <span className="w-[90px] text-xs text-a1-text-tertiary">{arc.label}</span>
              <span className="text-xs font-bold text-a1-text-primary">
                {Math.round(arc.pct * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export { DonutChart };
export type { DonutChartProps, DonutSegment };
