// ProgressRing — circular progress indicator with a centered value.
// RN mirror of the DS ProgressRing spec, drawn with react-native-svg.
import { ReactNode } from "react";
import { Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import { DsColorName, useDsPalette } from "./tokens";

export type ProgressRingProps = {
  value?: number;
  max?: number;
  size?: number;
  thickness?: number;
  color?: DsColorName | string;
  caption?: string;
  label?: string;
  showValue?: boolean;
  children?: ReactNode;
};

export function ProgressRing({
  value = 0,
  max = 100,
  size = 120,
  thickness = 12,
  color = "brand",
  caption,
  label,
  showValue = true,
  children,
}: ProgressRingProps) {
  const pal = useDsPalette();
  const stroke =
    color in pal ? pal[color as DsColorName] : (color as string);
  const pct = Math.max(0, Math.min(1, value / max));
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const valueFontSize = Math.round(size * 0.26);

  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <Svg
        width={size}
        height={size}
        style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}
      >
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={pal.track}
          strokeWidth={thickness}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
        />
      </Svg>
      <View className="items-center justify-center">
        {children ? (
          children
        ) : (
          <>
            {showValue && (
              <Text
                className="font-display-black tracking-tight text-text"
                style={{ fontSize: valueFontSize, fontVariant: ["tabular-nums"] }}
              >
                {label != null ? label : `${Math.round(pct * 100)}%`}
              </Text>
            )}
            {caption && (
              <Text className="mt-0.5 font-sans-bold text-xs tracking-wide text-text-3 uppercase">
                {caption}
              </Text>
            )}
          </>
        )}
      </View>
    </View>
  );
}
