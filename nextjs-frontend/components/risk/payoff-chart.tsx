"use client";

type PayoffChartProps = {
  xValues: number[];
  yValues: number[];
  xLabel?: string;
  yLabel?: string;
  height?: number;
};

const PADDING = { top: 16, right: 24, bottom: 32, left: 56 };
const WIDTH = 720;

export function PayoffChart({
  xValues,
  yValues,
  xLabel = "Spot Price",
  yLabel = "Value",
  height = 280,
}: PayoffChartProps) {
  if (xValues.length === 0 || yValues.length === 0) {
    return (
      <div className="flex h-[280px] items-center justify-center text-[10px] uppercase tracking-widest text-gray-400">
        No chart data
      </div>
    );
  }

  const xMin = Math.min(...xValues);
  const xMax = Math.max(...xValues);
  const yMin = Math.min(...yValues);
  const yMax = Math.max(...yValues);

  const innerWidth = WIDTH - PADDING.left - PADDING.right;
  const innerHeight = height - PADDING.top - PADDING.bottom;

  const xRange = xMax - xMin || 1;
  const yRange = yMax - yMin || 1;

  const sx = (x: number) => PADDING.left + ((x - xMin) / xRange) * innerWidth;
  const sy = (y: number) =>
    PADDING.top + (1 - (y - yMin) / yRange) * innerHeight;

  const path = xValues
    .map(
      (x, i) =>
        `${i === 0 ? "M" : "L"}${sx(x).toFixed(1)},${sy(yValues[i]).toFixed(1)}`,
    )
    .join(" ");

  const yTicks = 5;
  const tickValues = Array.from(
    { length: yTicks },
    (_, i) => yMin + (i * yRange) / (yTicks - 1),
  );
  const xTicks = 6;
  const xTickValues = Array.from(
    { length: xTicks },
    (_, i) => xMin + (i * xRange) / (xTicks - 1),
  );

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${height}`}
      preserveAspectRatio="none"
      className="w-full h-full"
      role="img"
      aria-label={`${yLabel} vs ${xLabel} chart`}
    >
      <rect
        x={PADDING.left}
        y={PADDING.top}
        width={innerWidth}
        height={innerHeight}
        fill="#fafafa"
        stroke="#d1d5db"
      />
      {tickValues.map((v) => (
        <g key={`yt-${v.toFixed(2)}`}>
          <line
            x1={PADDING.left}
            x2={PADDING.left + innerWidth}
            y1={sy(v)}
            y2={sy(v)}
            stroke="#e5e7eb"
            strokeDasharray="2 3"
          />
          <text
            x={PADDING.left - 6}
            y={sy(v)}
            textAnchor="end"
            dominantBaseline="middle"
            className="fill-gray-500"
            style={{ fontSize: 10, fontFamily: "monospace" }}
          >
            {v.toFixed(2)}
          </text>
        </g>
      ))}
      {xTickValues.map((v) => (
        <g key={`xt-${v.toFixed(2)}`}>
          <line
            x1={sx(v)}
            x2={sx(v)}
            y1={PADDING.top + innerHeight}
            y2={PADDING.top + innerHeight + 4}
            stroke="#9ca3af"
          />
          <text
            x={sx(v)}
            y={PADDING.top + innerHeight + 16}
            textAnchor="middle"
            className="fill-gray-500"
            style={{ fontSize: 10, fontFamily: "monospace" }}
          >
            {v.toFixed(0)}
          </text>
        </g>
      ))}
      <path d={path} fill="none" stroke="#2563EB" strokeWidth={2} />
      <text
        x={PADDING.left + innerWidth / 2}
        y={height - 4}
        textAnchor="middle"
        className="fill-gray-600"
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        {xLabel}
      </text>
      <text
        x={12}
        y={PADDING.top + innerHeight / 2}
        textAnchor="middle"
        transform={`rotate(-90 12 ${PADDING.top + innerHeight / 2})`}
        className="fill-gray-600"
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        {yLabel}
      </text>
    </svg>
  );
}
