import { View, type ViewProps } from "react-native";

export type ThemedViewProps = ViewProps & {
  className?: string;
};

export function ThemedView({ className, ...otherProps }: ThemedViewProps) {
  return (
    <View
      className={["bg-bg", className].filter(Boolean).join(" ")}
      {...otherProps}
    />
  );
}
