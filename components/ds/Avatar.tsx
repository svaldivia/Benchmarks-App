// Avatar — initials circle with optional status ring. RN mirror of the DS
// Avatar spec (image source omitted; this app only needs the initials fallback).
import { Text, View } from "react-native";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

const DIM: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
};

export type AvatarProps = {
  name?: string;
  size?: AvatarSize;
  ring?: boolean;
};

export function Avatar({ name = "", size = "md", ring = false }: AvatarProps) {
  const dim = DIM[size];
  const initials =
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "?";

  const circle = (
    <View
      className="items-center justify-center rounded-pill bg-brand-subtle"
      style={{ width: dim, height: dim }}
    >
      <Text
        className="font-display tracking-tight text-brand"
        style={{ fontSize: Math.round(dim * 0.4) }}
      >
        {initials}
      </Text>
    </View>
  );

  if (ring) {
    return (
      <View className="rounded-pill border-2 border-accent bg-surface p-0.5">
        {circle}
      </View>
    );
  }
  return circle;
}
