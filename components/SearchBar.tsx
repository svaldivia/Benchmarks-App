import React from "react";
import { ActivityIndicator, Pressable } from "react-native";

import { Input } from "@/components/ds";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useAppColors } from "@/hooks/useAppColors";

export function SearchBar({
  value,
  onChangeText,
  placeholder = "Search",
  isSearching = false,
  className,
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  /** Shows a spinner while results for `value` are on their way. */
  isSearching?: boolean;
  className?: string;
}) {
  const colors = useAppColors();

  return (
    <Input
      containerClassName={className}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      icon={
        <IconSymbol size={18} name="magnifyingglass" color={colors.textMuted} />
      }
      trailing={
        isSearching ? (
          <ActivityIndicator size="small" color={colors.tint} />
        ) : value ? (
          <Pressable
            onPress={() => onChangeText("")}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
          >
            <IconSymbol size={18} name="xmark" color={colors.textMuted} />
          </Pressable>
        ) : null
      }
      autoCapitalize="none"
      autoCorrect={false}
      returnKeyType="search"
      accessibilityRole="search"
    />
  );
}
