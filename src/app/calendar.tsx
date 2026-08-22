import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { ChoiceChip, IconButton, SectionHeader } from '@/components/ui/controls';
import { Screen } from '@/components/ui/screen';
import { radius, spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];
const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const dates = Array.from({ length: 35 }, (_, index) => index < 5 ? 27 + index : index - 4);
const marked = new Set([7, 9, 19, 21, 23, 26]);

export default function CalendarScreen() {
  const { colors } = useAppTheme();
  return <Screen title="Calendar" subtitle="Plans, progress and important dates" action={<IconButton icon="plus" label="Add calendar item" />}>
    <Card><View style={s.month}><MaterialCommunityIcons name="chevron-left" size={25} color={colors.textMuted} /><AppText variant="heading" weight="bold">August 2026</AppText><MaterialCommunityIcons name="chevron-right" size={25} color={colors.textMuted} /></View>
      <View style={s.week}>{days.map((day, i) => <AppText key={`${day}-${i}`} variant="caption" weight="bold" color={colors.textMuted} style={s.day}>{day}</AppText>)}</View>
      <View style={s.grid}>{dates.map((date, i) => { const active = date === 22 && i > 4; return <View key={`${date}-${i}`} style={s.cell}><View style={[s.circle, active && { backgroundColor: colors.primary }]}><AppText variant="caption" weight={active ? 'bold' : 'regular'} color={active ? colors.onPrimary : i < 5 ? colors.textMuted : colors.text}>{date}</AppText></View>{marked.has(i) ? <View style={[s.dot, { backgroundColor: i % 2 ? colors.success : colors.primary }]} /> : null}</View>; })}</View>
    </Card>
    <View style={s.switcher}><ChoiceChip label="Month" selected /><ChoiceChip label="Agenda" /></View>
    <SectionHeader title="Monday, 24 August" /><Event icon="karate" title="Karate" detail="6:00 pm · Weekly schedule" status="Planned" color={colors.primary} />
    <SectionHeader title="Wednesday, 26 August" /><Event icon="account-group-outline" title="BJJ" detail="7:00 pm · Weekly schedule" status="Planned" color={colors.bjj} />
    <SectionHeader title="Saturday, 12 September" /><Event icon="medal-outline" title="Spring grading" detail="9:00 am · Main dojo" status="Grading" color={colors.success} />
  </Screen>;
}
function Event({ icon, title, detail, status, color }: { icon: IconName; title: string; detail: string; status: string; color: string }) {
  const { colors } = useAppTheme();
  return <Card style={s.event}><View style={[s.eventIcon, { backgroundColor: colors.surfaceMuted }]}><MaterialCommunityIcons name={icon} size={22} color={color} /></View><View style={s.copy}><AppText weight="bold">{title}</AppText><AppText variant="caption" color={colors.textMuted}>{detail}</AppText></View><View style={[s.status, { borderColor: color }]}><AppText variant="caption" weight="bold" color={color}>{status}</AppText></View></Card>;
}
const s = StyleSheet.create({
  month: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }, week: { flexDirection: 'row' }, day: { width: '14.285%', textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.sm }, cell: { width: '14.285%', height: 47, alignItems: 'center' }, circle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 4, height: 4, borderRadius: 2, marginTop: 2 }, switcher: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg }, event: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  eventIcon: { width: 46, height: 46, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' }, copy: { flex: 1, gap: 3 }, status: { borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
});
