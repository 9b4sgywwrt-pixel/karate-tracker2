import { StyleSheet, View } from 'react-native';
import { spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { AppText } from './app-text';
import { Card } from './card';

export function MetricCard({ label, value, detail }: { label: string; value: string; detail?: string }) {
  const { colors } = useAppTheme();
  return <Card style={styles.metricCard}><AppText variant="label" weight="bold" color={colors.textMuted}>{label.toUpperCase()}</AppText><AppText variant="heading" weight="bold" style={styles.metricValue}>{value}</AppText>{detail ? <AppText variant="caption" color={colors.textMuted}>{detail}</AppText> : null}</Card>;
}
export function ProgressRow({ label, value, progress, color }: { label: string; value: string; progress: number; color: string }) {
  const { colors } = useAppTheme();
  return <View style={styles.progressRow}><View style={styles.progressLabels}><AppText weight="medium">{label}</AppText><AppText variant="label" color={colors.textMuted}>{value}</AppText></View><View style={[styles.track, { backgroundColor: colors.surfaceMuted }]}><View style={[styles.fill, { backgroundColor: color, width: `${Math.round(progress * 100)}%` }]} /></View></View>;
}
const styles = StyleSheet.create({
  metricCard: { flex: 1, minWidth: 0, minHeight: 120 }, metricValue: { marginTop: spacing.md, marginBottom: spacing.xs },
  progressRow: { gap: spacing.sm, marginBottom: spacing.lg }, progressLabels: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  track: { height: 7, borderRadius: 99, overflow: 'hidden' }, fill: { height: '100%', borderRadius: 99 },
});
