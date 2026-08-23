import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ComponentProps, PropsWithChildren } from 'react';
import { Pressable, PressableProps, StyleSheet, View } from 'react-native';
import { radius, spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { AppText } from './app-text';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];
export function IconButton({ icon, label, onPress, symbol }: { icon: IconName; label: string; onPress?: PressableProps['onPress']; symbol?: string }) {
  const { colors } = useAppTheme();
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.iconButton, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.65 : 1 }]}>{symbol ? <AppText variant="heading" weight="bold" color={colors.text}>{symbol}</AppText> : <MaterialCommunityIcons name={icon} size={21} color={colors.text} />}</Pressable>;
}
export function PrimaryButton({ children, icon = 'plus', onPress, disabled = false }: PropsWithChildren<{ icon?: IconName; onPress?: PressableProps['onPress']; disabled?: boolean }>) {
  const { colors } = useAppTheme();
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.primaryButton, { backgroundColor: colors.primary, opacity: disabled ? 0.55 : pressed ? 0.8 : 1 }]}><MaterialCommunityIcons name={icon} size={20} color={colors.onPrimary} /><AppText weight="bold" color={colors.onPrimary}>{children}</AppText></Pressable>;
}
export function ChoiceChip({ label, selected = false, onPress }: { label: string; selected?: boolean; onPress?: () => void }) {
  const { colors } = useAppTheme();
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={({ pressed }) => [styles.chip, { backgroundColor: selected ? colors.primary : colors.surface, borderColor: selected ? colors.primary : colors.border, opacity: pressed ? 0.72 : 1 }]}>
      {selected ? <MaterialCommunityIcons name="check" size={15} color={colors.onPrimary} /> : null}
      <AppText variant="label" weight="medium" color={selected ? colors.onPrimary : colors.text}>{label}</AppText>
    </Pressable>
  );
}
export function SectionHeader({ title, action }: { title: string; action?: string }) {
  const { colors } = useAppTheme();
  return <View style={styles.sectionHeader}><AppText variant="label" weight="bold" color={colors.textMuted}>{title.toUpperCase()}</AppText>{action ? <AppText variant="label" weight="medium" color={colors.primary}>{action}</AppText> : null}</View>;
}
const styles = StyleSheet.create({
  iconButton: { width: 44, height: 44, borderRadius: radius.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  primaryButton: { minHeight: 54, borderRadius: radius.md, paddingHorizontal: spacing.xl, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  chip: { minHeight: 42, paddingHorizontal: spacing.md, borderRadius: radius.pill, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
  sectionHeader: { marginTop: spacing.xl, marginBottom: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
