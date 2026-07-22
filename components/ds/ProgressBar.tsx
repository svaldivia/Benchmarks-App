// ProgressBar — linear progress / goal meter with an optional label row.
// RN mirror of the DS ProgressBar spec.
import { Text, View } from "react-native";

import { cx } from "./cn";
import { DsColorName } from "./tokens";

export type ProgressBarSize = "sm" | "md" | "lg";

const TRACK_H: Record<ProgressBarSize, string> = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-3.5",
};

const FILL: Record<DsColorName, string> = {
  brand: "bg-brand",
  accent: "bg-accent",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

export type ProgressBarProps = {
  value?: number;
  max?: number;
  color?: DsColorName;
  size?: ProgressBarSize;
  label?: string;
  valueText?: string;
  showValue?: boolean;
  className?: string;
};

export function ProgressBar({
  value = 0,
  max = 100,
  color = "brand",
  size = "md",
  label,
  valueText,
  showValue = false,
  className,
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <View className={cx("w-full gap-1.5", className)}>
      {(label || showValue || valueText) && (
        <View className="flex-row items-baseline justify-between">
          {label && (
            <Text className="font-sans-semibold text-sm text-text-2">
              {label}
            </Text>
          )}
          {(valueText || showValue) && (
            <Text className="font-mono-medium text-sm text-text-3">
              {valueText ?? `${Math.round(pct)}%`}
            </Text>
          )}
        </View>
      )}
      <View
        className={cx(
          "w-full overflow-hidden rounded-pill bg-surface-inset",
          TRACK_H[size]
        )}
      >
        <View
          className={cx("h-full rounded-pill", FILL[color])}
          style={{ width: `${pct}%` }}
        />
      </View>
    </View>
  );
}
