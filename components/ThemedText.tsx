import { Text, type TextProps } from "react-native";

export type ThemedTextProps = TextProps & {
  className?: string;
  type?:
    | "default"
    | "title"
    | "defaultSemiBold"
    | "subtitle"
    | "link"
    | "display"
    | "h2"
    | "overline";
};

// DS type scale (Saira display / Hanken sans). Family carries the weight on
// native, so each role names its exact font-* utility rather than font-bold etc.
const TYPE_CLASSES: Record<NonNullable<ThemedTextProps["type"]>, string> = {
  default: "font-sans text-body leading-normal",
  defaultSemiBold: "font-sans-semibold text-body leading-normal",
  title: "font-display text-h1 leading-tight tracking-tight",
  h2: "font-display text-h2 leading-tight tracking-tight",
  subtitle: "font-display text-h3 leading-snug",
  display: "font-display-black text-display-md leading-tight tracking-tight",
  link: "font-sans text-body-lg leading-relaxed text-text-link",
  overline:
    "font-sans-bold text-xs uppercase tracking-caps text-text-3 leading-normal",
};

// Matches an explicit DS text-color utility (not sizes like text-base / text-h1).
// When the caller supplies one, we drop the default `text-text` so it doesn't
// win on CSS source order.
const COLOR_RE =
  /(?:^|\s)text-(text-2|text-3|text-link|text-disabled|text-on-fill|text|brand-hover|brand|accent|on-brand|on-accent|success|warning|danger|info|white|black)(?![\w-])/;

export function ThemedText({
  className,
  type = "default",
  ...rest
}: ThemedTextProps) {
  const typeHasColor = COLOR_RE.test(TYPE_CLASSES[type]);
  const propHasColor = className ? COLOR_RE.test(className) : false;
  const base = typeHasColor || propHasColor ? "" : "text-text";

  return (
    <Text
      className={[base, TYPE_CLASSES[type], className].filter(Boolean).join(" ")}
      {...rest}
    />
  );
}
