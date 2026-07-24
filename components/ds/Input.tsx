// Input — labelled text/number field. RN mirror of the DS Input spec:
// optional label, leading icon, suffix unit, error/hint, and a big "numeric"
// display style for weights/PRs.
import { ReactNode, useState } from "react";
import { Text, TextInput, View, type TextInputProps } from "react-native";

import { cx } from "./cn";
import { useAppColors } from "@/hooks/useAppColors";

export type InputProps = TextInputProps & {
  label?: string;
  required?: boolean;
  icon?: ReactNode;
  suffix?: string;
  error?: string | null;
  hint?: string | null;
  numeric?: boolean;
  containerClassName?: string;
};

export function Input({
  label,
  required = false,
  icon,
  suffix,
  error,
  hint,
  numeric = false,
  editable = true,
  containerClassName,
  ...rest
}: InputProps) {
  const colors = useAppColors();
  const [focused, setFocused] = useState(false);

  const borderClass = error
    ? "border-danger"
    : focused
      ? "border-brand"
      : "border-field-border";

  return (
    <View className={cx("gap-1.5", containerClassName)}>
      {label && (
        <Text className="font-sans-semibold text-sm text-text-2">
          {label}
          {required && <Text className="text-accent"> *</Text>}
        </Text>
      )}
      <View
        className={cx(
          "h-12 flex-row items-center gap-2 rounded-xs border-[1.5px] bg-field-bg px-4",
          borderClass,
          !editable && "opacity-55"
        )}
      >
        {icon}
        <TextInput
          className={cx(
            "min-w-0 flex-1 text-text",
            numeric
              ? "font-display text-h3"
              : "font-sans text-body-lg"
          )}
          editable={editable}
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.tint}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          {...rest}
        />
        {suffix && (
          <Text className="font-mono-medium text-sm text-text-3">{suffix}</Text>
        )}
      </View>
      {error ? (
        <Text className="font-sans text-sm text-danger">{error}</Text>
      ) : hint ? (
        <Text className="font-sans text-sm text-text-3">{hint}</Text>
      ) : null}
    </View>
  );
}
