// StatTile — the brand's signature big-number readout with label, unit, and an
// optional trend delta. RN mirror of the DS StatTile spec.
import { Text, View, type ViewProps } from "react-native";
import Svg, { Path } from "react-native-svg";

import { cx } from "./cn";
import { useDsPalette } from "./tokens";

export type StatTileSize = "sm" | "md" | "lg";
type Trend = "up" | "down" | "flat";

const NUM_SIZE: Record<StatTileSize, string> = {
  sm: "text-h1",
  md: "text-display-md",
  lg: "text-display-2xl",
};
const UNIT_SIZE: Record<StatTileSize, string> = {
  sm: "text-body-lg",
  md: "text-body-lg",
  lg: "text-display-md",
};

const ARROW_D: Record<Trend, string> = {
  up: "M12 19V5M5 12l7-7 7 7",
  down: "M12 5v14M19 12l-7 7-7-7",
  flat: "M5 12h14",
};

function DeltaArrow({ dir, color }: { dir: Trend; color: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path
        d={ARROW_D[dir]}
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export type StatTileProps = ViewProps & {
  label?: string;
  value: string | number;
  unit?: string;
  delta?: number | string | null;
  trend?: Trend;
  size?: StatTileSize;
  onBrand?: boolean;
  className?: string;
};

export function StatTile({
  label,
  value,
  unit,
  delta = null,
  trend,
  size = "md",
  onBrand = false,
  className,
  ...rest
}: StatTileProps) {
  const pal = useDsPalette();
  const dir: Trend =
    trend ??
    (typeof delta === "number"
      ? delta > 0
        ? "up"
        : delta < 0
          ? "down"
          : "flat"
      : "flat");
  const deltaColor = onBrand
    ? "#ffffff"
    : dir === "up"
      ? pal.success
      : dir === "down"
        ? pal.danger
        : pal.text3;

  return (
    <View className={cx("gap-1", className)} {...rest}>
      {label && (
        <Text
          className={cx(
            "font-sans-bold text-xs uppercase tracking-caps",
            onBrand ? "text-white/70" : "text-text-3"
          )}
        >
          {label}
        </Text>
      )}
      <View className="flex-row items-baseline gap-1.5">
        <Text
          className={cx(
            "font-display-black tracking-tight",
            NUM_SIZE[size],
            onBrand ? "text-white" : "text-text"
          )}
          style={{ fontVariant: ["tabular-nums"] }}
        >
          {value}
        </Text>
        {unit && (
          <Text
            className={cx(
              "font-sans-bold",
              UNIT_SIZE[size],
              onBrand ? "text-white/70" : "text-text-3"
            )}
          >
            {unit}
          </Text>
        )}
      </View>
      {delta != null && (
        <View className="mt-0.5 flex-row items-center gap-1">
          <DeltaArrow dir={dir} color={deltaColor} />
          <Text
            className="font-sans-bold text-sm"
            style={{ color: deltaColor }}
          >
            {typeof delta === "number"
              ? `${delta > 0 ? "+" : ""}${delta}`
              : delta}
          </Text>
        </View>
      )}
    </View>
  );
}
