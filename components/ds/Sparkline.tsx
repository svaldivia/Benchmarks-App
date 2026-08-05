// Sparkline — compact trend line with optional area fill + end dot.
// RN mirror of the DS Sparkline spec, drawn with react-native-svg.
import { useId, useMemo } from "react";
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from "react-native-svg";

import { DsColorName, useDsPalette } from "./tokens";

export type SparklineProps = {
  data: number[];
  width?: number;
  height?: number;
  color?: DsColorName;
  area?: boolean;
  dot?: boolean;
  strokeWidth?: number;
};

export function Sparkline({
  data,
  width = 120,
  height = 36,
  color = "brand",
  area = true,
  dot = true,
  strokeWidth = 2.5,
}: SparklineProps) {
  const pal = useDsPalette();
  const stroke = pal[color];
  // useId gives a stable per-instance id; strip the ":" delimiters React adds
  // so the value is usable inside an SVG url(#...) reference.
  const rawId = useId();
  const gid = useMemo(
    () => "spark-" + rawId.replace(/[^a-zA-Z0-9]/g, ""),
    [rawId]
  );

  if (data.length < 2) {
    return <Svg width={width} height={height} />;
  }

  const pad = 4;
  const n = data.length;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const x = (i: number) => pad + (i / (n - 1)) * (width - pad * 2);
  const y = (v: number) => pad + (1 - (v - min) / span) * (height - pad * 2);
  const pts = data.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`);
  const line = "M" + pts.join(" L");
  const areaPath = `${line} L${x(n - 1).toFixed(1)},${(height - pad).toFixed(
    1
  )} L${x(0).toFixed(1)},${(height - pad).toFixed(1)} Z`;

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {area && (
        <>
          <Defs>
            <LinearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={stroke} stopOpacity={0.22} />
              <Stop offset="100%" stopColor={stroke} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Path d={areaPath} fill={`url(#${gid})`} />
        </>
      )}
      <Path
        d={line}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {dot && (
        <Circle
          cx={x(n - 1)}
          cy={y(data[n - 1])}
          r={3.5}
          fill={stroke}
          stroke={pal.surface}
          strokeWidth={2}
        />
      )}
    </Svg>
  );
}
