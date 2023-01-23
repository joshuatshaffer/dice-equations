import { FC } from "react";

const colors = ["blue", "red", "green", "cyan", "yellow", "magenta"];

export interface CombGraphProps {
  data: Map<number, number>[];

  width: number;
  height: number;
  padding: number;

  className?: string;
}

export const CombGraph: FC<CombGraphProps> = ({
  data,
  width,
  height,
  padding,
  className,
}) => {
  const s = stats(data);

  // Include the x-axis in the view.
  if (0 < s.y.min) s.y.min = 0;
  if (0 > s.y.max) s.y.max = 0;

  const mapPoint = ({ x, y }: { x: number; y: number }) => ({
    x: mapRange(x, s.x, { min: padding, max: width - padding }),
    y: mapRange(y, s.y, { min: height - padding, max: padding }),
  });

  const line = ({ x, y, color }: { x: number; y: number; color: string }) => {
    const original = { x, y };
    const pixelSpace = {
      ...mapPoint({ x, y }),
      bottom: mapPoint({ x, y: 0 }),
    };
    return (
      <g key={color + original.x}>
        <line
          x1={pixelSpace.bottom.x}
          y1={pixelSpace.bottom.y}
          x2={pixelSpace.x}
          y2={pixelSpace.y}
          stroke={color}
        />
        <circle r={2} cx={pixelSpace.x} cy={pixelSpace.y} fill={color} />
        <title>{`${original.x} has a ${(original.y * 100).toPrecision(
          2
        )}% chance.`}</title>
      </g>
    );
  };

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={className}
    >
      {data
        .flatMap((m, i) => [...m].map(([x, y]) => ({ x, y, color: colors[i] })))
        .sort((a, b) => (a.x === b.x ? b.y - a.y : a.x - b.x))
        .map(line)}

      {/* X-axis */}
      {(() => {
        const p1 = mapPoint({ x: s.x.min, y: 0 });
        const p2 = mapPoint({ x: s.x.max, y: 0 });
        return (
          <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="currentColor" />
        );
      })()}
    </svg>
  );
};

function stats(data: Iterable<readonly [number, number]>[]) {
  let s = {
    x: { min: Infinity, max: -Infinity },
    y: { min: Infinity, max: -Infinity },
    support: new Set<number>(),
  };

  for (const m of data) {
    for (const [x, y] of m) {
      s.support.add(x);
      if (x < s.x.min) s.x.min = x;
      if (x > s.x.max) s.x.max = x;
      if (y < s.y.min) s.y.min = y;
      if (y > s.y.max) s.y.max = y;
    }
  }

  return s;
}

function mapRange(
  x: number,
  from: { min: number; max: number },
  to: { min: number; max: number }
): number {
  return ((x - from.min) / (from.max - from.min)) * (to.max - to.min) + to.min;
}
