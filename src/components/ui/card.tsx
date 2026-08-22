import { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { radius, spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

export function Card({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  const { colors, isDark } = useAppTheme();
  return <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow, shadowOpacity: isDark ? 0 : 0.07 }, style]}>{children}</View>;
}
const styles = StyleSheet.create({ card: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.lg, shadowOffset: { width: 0, height: 5 }, shadowRadius: 14, elevation: 2 } });
