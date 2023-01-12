import { FC } from "react";

export interface CombGraphProps {
  data: Map<number, number>;

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

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={className}>
      {[...data.entries()]
        .sort(([a], [b]) => a - b)
        .map(([x, y]) => {
          return {
            original: { x, y },
            pixelSpace: {
              ...mapPoint({ x, y }),
              bottom: mapPoint({ x, y: 0 }),
            },
          };
        })
        .map((v, index, array) => {
          const next = array[index + 1];
          const prev = array[index - 1];

          const left = prev
            ? (v.pixelSpace.x + prev.pixelSpace.x) / 2
            : v.pixelSpace.x;

          const right = next
            ? (v.pixelSpace.x + next.pixelSpace.x) / 2
            : v.pixelSpace.x;

          const top = v.pixelSpace.y - 10;

          return {
            ...v,
            pixelSpace: {
              ...v.pixelSpace,
              left,
              top,
              width: right - left,
              height: v.pixelSpace.bottom.y - top,
            },
          };
        })
        .map(({ original, pixelSpace }) => {
          return (
            <g key={original.x}>
              <line
                x1={pixelSpace.bottom.x}
                y1={pixelSpace.bottom.y}
                x2={pixelSpace.x}
                y2={pixelSpace.y}
                stroke="currentColor"
              />
              <circle r={2} cx={pixelSpace.x} cy={pixelSpace.y} />
              <rect
                x={pixelSpace.left}
                y={pixelSpace.top}
                width={pixelSpace.width}
                height={pixelSpace.height}
                fill="transparent"
              />
              <title>{`${original.x} has a ${(original.y * 100).toPrecision(
                2
              )}% chance.`}</title>
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
