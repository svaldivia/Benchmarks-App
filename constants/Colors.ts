// Benchmark Design System palette (JS mirror of tokens/colors.css).
// The CSS variables in global.css are the source of truth for className
// styling; this file exists for the few JS-side consumers that need a real
// color value (React Navigation theme/tab options, icon `color` props,
// TextInput placeholder/selection colors) where a className can't reach.

const Palette = {
  // Blue — primary, "athletic azure"
  blue: {
    50: "#eaf1ff",
    100: "#d6e4ff",
    200: "#aecbff",
    300: "#82a9ff",
    400: "#4f84ff",
    500: "#2c6bff",
    600: "#1a52e6",
    700: "#1542b4",
    800: "#163a8f",
    900: "#16336f",
    950: "#101f44",
  },
  // Coral — warm accent
  coral: {
    50: "#fff1ee",
    100: "#ffe0da",
    200: "#ffc0b4",
    300: "#ff9786",
    400: "#fb6a55",
    500: "#f74b3b",
    600: "#e2382a",
    700: "#bb2e22",
    800: "#92271f",
    900: "#76251e",
  },
  // Slate — cool, blue-leaning neutrals
  slate: {
    0: "#ffffff",
    25: "#f7f9fc",
    50: "#f1f4fa",
    100: "#e7ecf5",
    200: "#d6deec",
    300: "#b9c4da",
    400: "#8a98b5",
    500: "#647193",
    600: "#4a5573",
    700: "#353e57",
    800: "#222a3d",
    900: "#151b2b",
    950: "#0b0f1a",
  },
  white: "#ffffff",
  black: "#000000",
};

export { Palette };

export const Colors = {
  light: {
    // Text
    textPrimary: Palette.slate[900],
    textSecondary: Palette.slate[600],
    textMuted: Palette.slate[400],

    // Backgrounds
    backgroundPrimary: Palette.slate[25],
    backgroundSecondary: Palette.slate[0],
    backgroundTertiary: Palette.slate[25],

    // Borders
    border: Palette.slate[200],
    borderStrong: Palette.slate[300],

    // Accent / tint (brand)
    tint: Palette.blue[500],
    accentBackground: Palette.blue[50],
    accentBackgroundStrong: Palette.blue[100],
    accentBorder: Palette.blue[500],
    accentText: Palette.blue[600],

    // Tab bar
    tabIconDefault: Palette.slate[500],
    tabIconSelected: Palette.blue[500],

    // Overlay (scrim)
    overlay: "rgba(11, 15, 26, 0.45)",
  },
  dark: {
    // Text
    textPrimary: "#eef3fc",
    textSecondary: "#a9b6d1",
    textMuted: "#6b7a99",

    // Backgrounds
    backgroundPrimary: "#090d16",
    backgroundSecondary: "#121a2b",
    backgroundTertiary: "#0f1626",

    // Borders
    border: "#273350",
    borderStrong: "#36456a",

    // Accent / tint (brand)
    tint: Palette.blue[400],
    accentBackground: "rgba(44, 107, 255, 0.16)",
    accentBackgroundStrong: "rgba(44, 107, 255, 0.26)",
    accentBorder: Palette.blue[400],
    accentText: Palette.blue[300],

    // Tab bar
    tabIconDefault: "#7787a6",
    tabIconSelected: Palette.blue[400],

    // Overlay (scrim)
    overlay: "rgba(3, 6, 14, 0.6)",
  },
};
