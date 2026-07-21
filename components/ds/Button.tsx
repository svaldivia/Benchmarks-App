// Button — DS pill-shaped action control. RN mirror of the DS Button spec:
// variants map to brand roles, sizes sm(36)/md(44)/lg(52), tactile press state.
import { ReactNode } from "react";
import { Pressable, Text, type PressableProps } from "react-native";

export type ButtonVariant =
  | "primary"
  | "accent"
  | "secondary"
  | "ghost"
  | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const SIZE: Record<ButtonSize, { container: string; label: string }> = {
  sm: { container: "h-9 px-4", label: "text-sm" },
  md: { container: "h-11 px-5", label: "text-body" },
  lg: { container: "h-[52px] px-7", label: "text-body-lg" },
};

const VARIANT: Record<ButtonVariant, { container: string; label: string }> = {
  primary: { container: "bg-brand shadow-md", label: "text-on-brand" },
  accent: { container: "bg-accent shadow-md", label: "text-on-accent" },
  secondary: {
    container: "bg-surface border border-border-strong shadow-xs",
    label: "text-text",
  },
  ghost: { container: "bg-transparent", label: "text-text-2" },
  danger: { container: "bg-danger", label: "text-on-danger" },
};

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

export type ButtonProps = Omit<PressableProps, "children" | "style"> & {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  full?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  className?: string;
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  full = false,
  disabled = false,
  iconLeft,
  iconRight,
  className,
  ...rest
}: ButtonProps) {
  const s = SIZE[size];
  const v = VARIANT[variant];
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      className={cx(
        "flex-row items-center justify-center gap-2 rounded-pill",
        s.container,
        v.container,
        full ? "w-full" : "self-start",
        disabled && "opacity-45",
        className
      )}
      style={({ pressed }) =>
        pressed && !disabled
          ? { transform: [{ translateY: 1 }, { scale: 0.985 }], opacity: 0.92 }
          : null
      }
      {...rest}
    >
      {iconLeft}
      {typeof children === "string" ? (
        <Text
          className={cx("font-sans-bold tracking-snug", s.label, v.label)}
          numberOfLines={1}
        >
          {children}
        </Text>
      ) : (
        children
      )}
      {iconRight}
    </Pressable>
  );
}
