// Badge — compact status / count pill. RN mirror of the DS Badge spec.
import { ReactNode } from "react";
import { Text, View, type ViewProps } from "react-native";

import { cx } from "./cn";

export type BadgeTone =
  | "neutral"
  | "brand"
  | "accent"
  | "success"
  | "warning"
  | "danger";

const SOFT: Record<BadgeTone, { container: string; text: string; dot: string }> =
  {
    neutral: { container: "bg-surface-inset", text: "text-text-2", dot: "bg-text-2" },
    brand: { container: "bg-brand-subtle", text: "text-brand", dot: "bg-brand" },
    accent: { container: "bg-accent-subtle", text: "text-accent", dot: "bg-accent" },
    success: { container: "bg-success-subtle", text: "text-success", dot: "bg-success" },
    warning: { container: "bg-warning-subtle", text: "text-warning", dot: "bg-warning" },
    danger: { container: "bg-danger-subtle", text: "text-danger", dot: "bg-danger" },
  };

const SOLID: Record<BadgeTone, { container: string; text: string; dot: string }> =
  {
    neutral: { container: "bg-slate-700", text: "text-white", dot: "bg-white" },
    brand: { container: "bg-brand", text: "text-on-brand", dot: "bg-on-brand" },
    accent: { container: "bg-accent", text: "text-on-accent", dot: "bg-on-accent" },
    success: { container: "bg-success", text: "text-on-success", dot: "bg-white" },
    warning: { container: "bg-warning", text: "text-on-warning", dot: "bg-on-warning" },
    danger: { container: "bg-danger", text: "text-on-danger", dot: "bg-on-danger" },
  };

export type BadgeProps = ViewProps & {
  children: ReactNode;
  tone?: BadgeTone;
  solid?: boolean;
  dot?: boolean;
  className?: string;
};

export function Badge({
  children,
  tone = "neutral",
  solid = false,
  dot = false,
  className,
  ...rest
}: BadgeProps) {
  const t = (solid ? SOLID : SOFT)[tone];
  return (
    <View
      className={cx(
        "h-[22px] flex-row items-center gap-[5px] self-start rounded-pill px-[9px]",
        t.container,
        className
      )}
      {...rest}
    >
      {dot && <View className={cx("h-1.5 w-1.5 rounded-full", t.dot)} />}
      <Text className={cx("font-sans-bold text-xs uppercase tracking-wide", t.text)}>
        {children}
      </Text>
    </View>
  );
}
