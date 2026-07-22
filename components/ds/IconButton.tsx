// IconButton — circular / square single-icon tap target. RN mirror of the DS
// IconButton spec. The caller passes the icon node (and its color).
import { ReactNode } from "react";
import { Pressable, type PressableProps } from "react-native";

import { cx } from "./cn";

export type IconButtonVariant = "ghost" | "solid" | "accent" | "outline";
export type IconButtonSize = "sm" | "md" | "lg";

const SIZE: Record<IconButtonSize, string> = {
  sm: "h-9 w-9",
  md: "h-11 w-11",
  lg: "h-[52px] w-[52px]",
};

const VARIANT: Record<IconButtonVariant, string> = {
  ghost: "bg-transparent",
  solid: "bg-brand shadow-md",
  accent: "bg-accent shadow-md",
  outline: "bg-surface border border-border-strong",
};

export type IconButtonProps = Omit<PressableProps, "children" | "style"> & {
  children: ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  round?: boolean;
  className?: string;
};

export function IconButton({
  children,
  variant = "ghost",
  size = "md",
  round = false,
  disabled = false,
  className,
  ...rest
}: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      className={cx(
        "items-center justify-center",
        round ? "rounded-pill" : "rounded-md",
        SIZE[size],
        VARIANT[variant],
        disabled && "opacity-40",
        className
      )}
      style={({ pressed }) =>
        pressed && !disabled ? { transform: [{ scale: 0.92 }] } : null
      }
      {...rest}
    >
      {children}
    </Pressable>
  );
}
