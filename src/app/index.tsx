import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { IconButton, PrimaryButton, SectionHeader } from '@/components/ui/controls';
import { MetricCard, ProgressRow } from '@/components/ui/metric';
import { Screen } from '@/components/ui/screen';
import { radius, spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

export default function HomeScreen() {
  const { colors } = useAppTheme();
  return <Screen eyebrow="Saturday, 22 August" title="Good morning" subtitle="Ready for your next session?" action={<IconButton icon="cog-outline" label="Settings" />}>
    <Card style={[s.hero, { backgroundColor: colors.hero, borderColor: colors.hero }]}>
      <View style={s.row}><View><AppText variant="label" weight="bold" color={colors.onHeroMuted}>THIS WEEK</AppText><AppText variant="display" weight="bold" color={colors.onHero} style={s.value}>3 hr 15 min</AppText></View><View style={[s.fire, { backgroundColor: colors.primary }]}><MaterialCommunityIcons name="fire" size={23} color={colors.onPrimary} /></View></View>
      <AppText color={colors.onHeroMuted}>3 training days · 4 completed sessions</AppText>
    </Card>
    <View style={s.metrics}><MetricCard label="Weekly streak" value="6 weeks" detail="Keep it moving" /><MetricCard label="Total hours" value="128 hr" detail="All disciplines" /></View>
    <SectionHeader title="Disciplines" action="View progress" />
    <Card><ProgressRow label="Karate" value="72 hr" progress={.78} color={colors.karate} /><ProgressRow label="BJJ" value="41 hr" progress={.55} color={colors.bjj} /><ProgressRow label="Kobudo" value="15 hr" progress={.25} color={colors.kobudo} /></Card>
    <SectionHeader title="Next scheduled training" />
    <Event date="MON 24" title="Karate" detail="6:00 pm · Weekly schedule" />
    <SectionHeader title="Upcoming event" />
    <Event date="12 SEP" title="Spring grading" detail="Saturday · 9:00 am" success />
    <View style={s.button}><PrimaryButton>Log training</PrimaryButton></View>
  </Screen>;
}

function Event({ date, title, detail, success }: { date: string; title: string; detail: string; success?: boolean }) {
  const { colors } = useAppTheme();
  const tint = success ? colors.success : colors.primary;
  return <Card style={s.event}><View style={[s.date, { backgroundColor: success ? colors.successSoft : colors.primarySoft }]}><AppText variant="caption" weight="bold" color={tint} style={s.center}>{date}</AppText></View><View style={s.copy}><AppText weight="bold">{title}</AppText><AppText variant="caption" color={colors.textMuted}>{detail}</AppText></View><MaterialCommunityIcons name="chevron-right" size={24} color={colors.textMuted} /></Card>;
}

const s = StyleSheet.create({
  hero: { padding: spacing.xl },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  value: { marginVertical: spacing.sm },
  fire: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  metrics: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  event: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  date: { width: 54, height: 54, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  center: { textAlign: 'center' },
  copy: { flex: 1, gap: 3 },
  button: { marginTop: spacing.xl },
});
