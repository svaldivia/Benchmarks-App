// Palette – Tailwind-inspired color scales.
// We use blue, slate, gray, and red.

const Palette = {
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },
  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },
  white: '#ffffff',
  black: '#000000',
};

export { Palette };

export const Colors = {
  light: {
    // Text
    textPrimary: Palette.slate[900],
    textSecondary: Palette.slate[500],
    textMuted: Palette.slate[400],

    // Backgrounds
    backgroundPrimary: Palette.slate[100],
    backgroundSecondary: Palette.white,
    backgroundTertiary: Palette.slate[50],

    // Borders
    border: Palette.slate[200],
    borderStrong: Palette.slate[300],

    // Accent / tint
    tint: Palette.blue[600],
    accentBackground: Palette.blue[50],
    accentBackgroundStrong: Palette.blue[100],
    accentBorder: Palette.blue[500],
    accentText: Palette.blue[600],

    // Tab bar
    tabIconDefault: Palette.slate[400],
    tabIconSelected: Palette.blue[600],

    // Overlay
    overlay: 'rgba(0, 0, 0, 0.4)',
  },
  dark: {
    // Text
    textPrimary: Palette.slate[100],
    textSecondary: Palette.slate[400],
    textMuted: Palette.slate[500],

    // Backgrounds
    backgroundPrimary: Palette.gray[950],
    backgroundSecondary: Palette.gray[900],
    backgroundTertiary: Palette.gray[800],

    // Borders
    border: Palette.gray[800],
    borderStrong: Palette.gray[700],

    // Accent / tint
    tint: Palette.blue[400],
    accentBackground: Palette.blue[950],
    accentBackgroundStrong: Palette.blue[900],
    accentBorder: Palette.blue[400],
    accentText: Palette.blue[400],

    // Tab bar
    tabIconDefault: Palette.slate[400],
    tabIconSelected: Palette.blue[400],

    // Overlay
    overlay: 'rgba(0, 0, 0, 0.6)',
  },
};
