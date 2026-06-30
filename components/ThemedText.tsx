import { Text, type TextProps } from "react-native";

export type ThemedTextProps = TextProps & {
  className?: string;
  type?: "default" | "title" | "defaultSemiBold" | "subtitle" | "link";
};

const TYPE_CLASSES: Record<NonNullable<ThemedTextProps["type"]>, string> = {
  default: "text-body leading-normal",
  defaultSemiBold: "text-body leading-normal font-semibold",
  title: "font-display text-h1 font-bold leading-tight",
  subtitle: "text-h3 font-bold",
  link: "text-body-lg leading-relaxed text-text-link",
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
