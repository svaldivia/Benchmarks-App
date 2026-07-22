// Card — primary content surface. RN mirror of the DS Card spec: soft radius,
// ambient shadow, tonal variants. Renders a Pressable when `onPress` is given.
import { ReactNode } from "react";
import { Pressable, View, type ViewProps } from "react-native";

import { cx } from "./cn";

export type CardVariant =
  | "default"
  | "flat"
  | "raised"
  | "inset"
  | "brand"
  | "accent";
export type CardPad = "none" | "sm" | "md" | "lg";

const VARIANT: Record<CardVariant, string> = {
  default: "bg-surface border border-border-subtle shadow-sm",
  flat: "bg-surface border border-border",
  raised: "bg-surface shadow-md",
  inset: "bg-surface-2 border border-border-subtle",
  brand: "bg-brand shadow-md",
  accent: "bg-accent shadow-md",
};

const PAD: Record<CardPad, string> = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export type CardProps = ViewProps & {
  children: ReactNode;
  variant?: CardVariant;
  pad?: CardPad;
  onPress?: () => void;
  className?: string;
};

export function Card({
  children,
  variant = "default",
  pad = "md",
  onPress,
  className,
  ...rest
}: CardProps) {
  const classes = cx(
    "rounded-lg overflow-hidden",
    VARIANT[variant],
    PAD[pad],
    className
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        className={classes}
        style={({ pressed }) =>
          pressed ? { transform: [{ scale: 0.99 }], opacity: 0.95 } : null
        }
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View className={classes} {...rest}>
      {children}
    </View>
  );
}
