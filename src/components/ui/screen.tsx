import { PropsWithChildren, ReactNode } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { contentMaxWidth, spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { AppText } from './app-text';

type Props = PropsWithChildren<{ title: string; eyebrow?: string; action?: ReactNode; subtitle?: string }>;
export function Screen({ title, eyebrow, action, subtitle, children }: Props) {
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const horizontalPadding = width < 360 ? spacing.md : spacing.lg;
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={[styles.container, { paddingHorizontal: horizontalPadding }]}>
          <View style={styles.headerRow}>
            <View style={styles.headerCopy}>
              {eyebrow ? <AppText variant="label" weight="medium" color={colors.primary} style={styles.eyebrow}>{eyebrow.toUpperCase()}</AppText> : null}
              <AppText variant="title" weight="bold">{title}</AppText>
              {subtitle ? <AppText color={colors.textMuted} style={styles.subtitle}>{subtitle}</AppText> : null}
            </View>
            {action}
          </View>
          {children}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, minWidth: 0 }, scrollContent: { flexGrow: 1, paddingBottom: spacing.xxxl },
  container: { width: '100%', maxWidth: contentMaxWidth, minWidth: 0, alignSelf: 'center' },
  headerRow: { minHeight: 92, paddingTop: spacing.md, paddingBottom: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerCopy: { flex: 1, paddingRight: spacing.md }, eyebrow: { marginBottom: spacing.xs }, subtitle: { marginTop: spacing.xs },
});
