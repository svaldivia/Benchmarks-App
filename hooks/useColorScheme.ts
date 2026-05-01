import { useColorScheme as useRNColorScheme } from 'react-native';

export function useColorScheme(): 'light' | 'dark' | undefined {
  const scheme = useRNColorScheme();
  return scheme === 'unspecified' ? undefined : scheme;
}
