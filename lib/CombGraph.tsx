import { FC } from "react";

export interface CombGraphProps {
  data: Map<number, number>;

  width: number;
  height: number;
}

export const CombGraph: FC<CombGraphProps> = ({ data, width, height }) => {
  const s = stats(data);

  return (
    <svg viewBox={`0 0 ${width} ${height}`}>
      {[...data.entries()].map(([k, v]) => {
        return (
          <g>
            <line
              key={k}
              x1={mapRange(k, s.x, { min: 0, max: width })}
              y1={height}
              x2={mapRange(k, s.x, { min: 0, max: width })}
              y2={mapRange(v, s.y, { min: height, max: 0 })}
              stroke="currentColor"
            />
            <circle
              r={4}
              cx={mapRange(k, s.x, { min: 0, max: width })}
              cy={mapRange(v, s.y, { min: height, max: 0 })}
            />
          </g>
        );
      })}
    </svg>
  );
};

function stats(data: Map<number, number>) {
  let s = {
    x: { min: Infinity, max: -Infinity },
    y: { min: 0, max: 0 },
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
