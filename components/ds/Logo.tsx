// Logo — Benchmark brand mark + wordmark lockup. The mark is ported from the
// DS asset assets/logo-mark.svg (a clipboard + bar-chart glyph) into
// react-native-svg so no SVG-transformer / metro config change is needed.
import { View } from "react-native";
import Svg, { Rect } from "react-native-svg";

import { ThemedText } from "@/components/ThemedText";

export function LogoMark({ size = 64 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Rect width={64} height={64} rx={16} fill="#2c6bff" />
      <Rect x={17} y={16} width={30} height={38} rx={5} fill="#ffffff" />
      <Rect x={24.5} y={10} width={15} height={10} rx={3.5} fill="#9dc0ff" />
      <Rect x={29.5} y={12.5} width={5} height={4.5} rx={2.2} fill="#ffffff" />
      <Rect x={23} y={38} width={5} height={9} rx={2} fill="#2c6bff" />
      <Rect x={30.5} y={33} width={5} height={14} rx={2} fill="#2c6bff" />
      <Rect x={38} y={27} width={5} height={20} rx={2} fill="#f74b3b" />
    </Svg>
  );
}

export type LogoLockupProps = {
  size?: number;
  wordmark?: boolean;
};

export function LogoLockup({ size = 64, wordmark = true }: LogoLockupProps) {
  return (
    <View className="items-center gap-3">
      <LogoMark size={size} />
      {wordmark && (
        <ThemedText type="display" className="tracking-tight">
          Benchmark
        </ThemedText>
      )}
    </View>
  );
}
