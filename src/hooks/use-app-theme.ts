import { useColorScheme } from 'react-native';
import { palette } from '@/constants/theme';

export function useAppTheme() {
  const isDark = useColorScheme() === 'dark';
  return { colors: isDark ? palette.dark : palette.light, isDark };
}
