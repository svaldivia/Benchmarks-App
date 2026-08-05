// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { type ColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<Extract<SymbolViewProps['name'], string>, ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  'plus': 'add',
  'xmark': 'close',
  'checkmark': 'check',
  'chevron.down': 'keyboard-arrow-down',
  'list.clipboard': 'list-alt',
  'dumbbell.fill': 'fitness-center',
  'trophy.fill': 'emoji-events',
  'flame.fill': 'local-fire-department',
  'chart.line.uptrend.xyaxis': 'trending-up',
  'person.fill': 'person',
  'arrow.up.right': 'north-east',
  'calendar': 'calendar-today',
  'gearshape.fill': 'settings',
  'magnifyingglass': 'search',
  'envelope.fill': 'email',
  'lock.fill': 'lock',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: ColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  // RN 0.88 widened ColorValue to admit null and processed-color numbers, which
  // MaterialIcons does not take. Neither reaches here: the tab bar hands back
  // the tint strings it was configured with, and every other caller passes one.
  const iconColor = typeof color === 'number' || color === null ? undefined : color;
  return <MaterialIcons color={iconColor} size={size} name={MAPPING[name]} style={style} />;
}
