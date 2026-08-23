import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { ChoiceChip, SectionHeader } from '@/components/ui/controls';
import { MetricCard, ProgressRow } from '@/components/ui/metric';
import { Screen } from '@/components/ui/screen';
import { spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

export { default } from '@/features/progress-screen';

const monthly = [8, 13, 11, 15];
export function LegacyProgressScreen() {
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const compact = width < 360;
  return <Screen title="Progress" subtitle="Consistency you can see">
    <View style={s.row}><ChoiceChip label="August 2026" selected /><ChoiceChip label="All time" /></View>
    <View style={[s.metrics, compact && s.stack]}><MetricCard label="Training time" value="14 hr 30 min" detail="This month" /><MetricCard label="Training days" value="12" detail="This month" /></View>
    <SectionHeader title="Hours by discipline" /><Card><ProgressRow label="Karate" value="8 hr" progress={.8} color={colors.karate} /><ProgressRow label="BJJ" value="4 hr 30 min" progress={.45} color={colors.bjj} /><ProgressRow label="Kobudo" value="2 hr" progress={.2} color={colors.kobudo} /></Card>
    <SectionHeader title="Monthly training" /><Card style={s.chartCard}><View style={s.chart}>{monthly.map((value, i) => <View key={i} style={s.column}><View style={[s.bar, { height: value * 7, backgroundColor: i === 3 ? colors.primary : colors.primarySoft }]} /><AppText variant="caption" color={colors.textMuted}>{['May', 'Jun', 'Jul', 'Aug'][i]}</AppText></View>)}</View></Card>
    <SectionHeader title="Practice highlights" /><Card><Highlight label="Kata practised" value="7 sessions" /><Highlight label="BJJ Rolling" value="4 sessions" /><Highlight label="Primary Rolling time" value="2 hr 15 min" /><Highlight label="Weapons practice" value="5 sessions" last /></Card>
    <SectionHeader title="Weapons" /><View style={s.row}><ChoiceChip label="Bo · 3" selected /><ChoiceChip label="Sai · 1" /><ChoiceChip label="Tonfa · 1" /></View>
    <SectionHeader title="Streaks" /><Card style={s.streak}><View><AppText variant="label" color={colors.textMuted}>CURRENT</AppText><AppText variant="heading" weight="bold">6 weeks</AppText></View><View style={[s.divider, { backgroundColor: colors.border }]} /><View><AppText variant="label" color={colors.textMuted}>PERSONAL BEST</AppText><AppText variant="heading" weight="bold">9 weeks</AppText></View></Card>
  </Screen>;
}
function Highlight({ label, value, last }: { label: string; value: string; last?: boolean }) {
  const { colors } = useAppTheme();
  return <View style={[s.highlight, !last && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}><AppText>{label}</AppText><AppText weight="bold" color={colors.primary}>{value}</AppText></View>;
}
const s = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }, metrics: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md }, stack: { flexDirection: 'column' }, chartCard: { height: 184 },
  chart: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', paddingTop: spacing.md }, column: { flex: 1, height: '100%', alignItems: 'center', justifyContent: 'flex-end', gap: spacing.sm },
  bar: { width: 32, maxWidth: '70%', borderTopLeftRadius: 10, borderTopRightRadius: 10 }, highlight: { minHeight: 52, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, alignItems: 'center', justifyContent: 'space-between' },
  streak: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }, divider: { width: 1, height: 44 },
});
