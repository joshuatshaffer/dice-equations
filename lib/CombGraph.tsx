import { FC } from "react";

export interface CombGraphProps {
  data: Map<number, number>;

  width: number;
  height: number;
  padding: number;
}

export const CombGraph: FC<CombGraphProps> = ({
  data,
  width,
  height,
  padding,
}) => {
  const s = stats(data);

  // Include the x-axis in the view.
  if (0 < s.y.min) s.y.min = 0;
  if (0 > s.y.max) s.y.max = 0;

  const mapPoint = ({ x, y }: { x: number; y: number }) => ({
    x: mapRange(x, s.x, { min: padding, max: width - padding }),
    y: mapRange(y, s.y, { min: height - padding, max: padding }),
  });

  return (
    <svg viewBox={`0 0 ${width} ${height}`}>
      {[...data.entries()].map(([x, y]) => {
        const p1 = mapPoint({ x, y: 0 });
        const p2 = mapPoint({ x, y });
        return (
          <g key={x}>
            <line
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke="currentColor"
            />
            <circle r={2} cx={p2.x} cy={p2.y} />
            <title>{`${x} has a ${(y * 100).toPrecision(2)}% chance.`}</title>
          </g>
        );
      })}

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

function stats(data: Map<number, number>) {
  let s = {
    x: { min: Infinity, max: -Infinity },
    y: { min: Infinity, max: -Infinity },
  };

  for (const [x, y] of data.entries()) {
    if (x < s.x.min) s.x.min = x;
    if (x > s.x.max) s.x.max = x;
    if (y < s.y.min) s.y.min = y;
    if (y > s.y.max) s.y.max = y;
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
