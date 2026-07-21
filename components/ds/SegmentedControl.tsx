// SegmentedControl — pill tab switcher for 2–4 mutually exclusive options.
// RN mirror of the DS SegmentedControl spec. Controlled or uncontrolled.
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

export type SegmentOption = { value: string; label: string };
export type SegmentedTone = "surface" | "brand";

const cx = (...c: (string | false | undefined)[]) =>
  c.filter(Boolean).join(" ");

export type SegmentedControlProps = {
  options: (SegmentOption | string)[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  tone?: SegmentedTone;
  full?: boolean;
  className?: string;
};

export function SegmentedControl({
  options,
  value,
  defaultValue,
  onChange,
  tone = "surface",
  full = false,
  className,
}: SegmentedControlProps) {
  const norm: SegmentOption[] = options.map((o) =>
    typeof o === "string" ? { value: o, label: o } : o
  );
  const controlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue ?? norm[0]?.value);
  const active = controlled ? value : internal;

  const pick = (v: string) => {
    if (!controlled) setInternal(v);
    onChange?.(v);
  };

  return (
    <View
      className={cx(
        "flex-row items-center gap-0.5 rounded-pill bg-surface-inset p-1",
        full ? "w-full" : "self-start",
        className
      )}
    >
      {norm.map((o) => {
        const on = active === o.value;
        const activeContainer =
          tone === "brand" ? "bg-brand shadow-md" : "bg-surface shadow-sm";
        const activeText = tone === "brand" ? "text-on-brand" : "text-text";
        return (
          <Pressable
            key={o.value}
            onPress={() => pick(o.value)}
            className={cx(
              "h-9 flex-1 items-center justify-center rounded-pill px-4",
              on && activeContainer
            )}
          >
            <Text
              className={cx(
                "font-sans-bold text-sm tracking-snug",
                on ? activeText : "text-text-2"
              )}
              numberOfLines={1}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
