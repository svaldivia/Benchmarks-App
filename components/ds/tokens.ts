// Theme-aware raw color values for the DS components that draw with
// react-native-svg (Sparkline, ProgressRing, ProgressBar, StatTile arrows),
// where a Nativewind className can't reach. Mirrors the semantic tokens in
// global.css / constants/Colors.ts for the handful of hues those tokens need.
import { useColorScheme } from "@/hooks/useColorScheme";

export type DsPalette = {
  brand: string;
  accent: string;
  success: string;
  warning: string;
  danger: string;
  track: string; // surface-inset
  text: string;
  text3: string;
  surface: string;
};

const LIGHT: DsPalette = {
  brand: "#2c6bff",
  accent: "#f74b3b",
  success: "#15b881",
  warning: "#f5a524",
  danger: "#e11d48",
  track: "#e7ecf5",
  text: "#151b2b",
  text3: "#647193",
  surface: "#ffffff",
};

const DARK: DsPalette = {
  brand: "#4f84ff",
  accent: "#f74b3b",
  success: "#15b881",
  warning: "#f5a524",
  danger: "#ff5d7a",
  track: "#0b0f1c",
  text: "#eef3fc",
  text3: "#7787a6",
  surface: "#121a2b",
};

export function useDsPalette(): DsPalette {
  return (useColorScheme() ?? "light") === "dark" ? DARK : LIGHT;
}

export type DsColorName = "brand" | "accent" | "success" | "warning" | "danger";
