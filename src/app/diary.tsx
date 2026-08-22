import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ComponentProps } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { ChoiceChip, IconButton } from '@/components/ui/controls';
import { Screen } from '@/components/ui/screen';
import { radius, spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];
const sessions: { day: string; art: string; focus: string; extra: string; duration: string; note: string; icon: IconName }[] = [
  { day: 'TODAY', art: 'Karate', focus: 'Kata', extra: '+ Kihon, Bunkai', duration: '1 hr 15 min', note: 'Seipai transitions and applications', icon: 'karate' },
  { day: 'WEDNESDAY, 19 AUGUST', art: 'BJJ', focus: 'Rolling', extra: '+ Positional', duration: '1 hr', note: 'Guard retention rounds', icon: 'account-group-outline' },
  { day: 'MONDAY, 17 AUGUST', art: 'Kobudo', focus: 'Bo', extra: '', duration: '45 min', note: 'Bo kihon and kata', icon: 'sword-cross' },
];

export default function DiaryScreen() {
  const { colors } = useAppTheme();
  return <Screen title="Training diary" subtitle="Your practice, one session at a time" action={<IconButton icon="tune-variant" label="Open filters" />}>
    <View style={[s.search, { backgroundColor: colors.surface, borderColor: colors.border }]}><MaterialCommunityIcons name="magnify" size={21} color={colors.textMuted} /><TextInput accessibilityLabel="Search training diary" placeholder="Search notes and focuses" placeholderTextColor={colors.textMuted} style={[s.input, { color: colors.text }]} /></View>
    <View style={s.chips}><ChoiceChip label="All training" selected /><ChoiceChip label="Karate" /><ChoiceChip label="BJJ" /><ChoiceChip label="Kobudo" /></View>
    {sessions.map((item) => <View key={`${item.day}-${item.art}`}>
      <AppText variant="label" weight="bold" color={colors.textMuted} style={s.day}>{item.day}</AppText>
      <Card style={s.session}><View style={[s.icon, { backgroundColor: colors.surfaceMuted }]}><MaterialCommunityIcons name={item.icon} size={22} color={colors.primary} /></View><View style={s.copy}><View style={s.top}><AppText variant="heading" weight="bold">{item.art}</AppText><AppText variant="label" weight="bold" color={colors.textMuted}>{item.duration}</AppText></View><View style={s.focus}><AppText weight="medium" color={colors.primary}>{item.focus}</AppText>{item.extra ? <AppText variant="caption" color={colors.textMuted}>{item.extra}</AppText> : null}</View><AppText variant="caption" color={colors.textMuted}>{item.note}</AppText></View><MaterialCommunityIcons name="chevron-right" size={22} color={colors.textMuted} /></Card>
    </View>)}
  </Screen>;
}
const s = StyleSheet.create({
  search: { height: 52, borderWidth: 1, borderRadius: radius.md, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  input: { flex: 1, height: '100%', fontSize: 16 }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  day: { marginTop: spacing.xl, marginBottom: spacing.sm }, session: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  icon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, copy: { flex: 1, gap: 4 },
  top: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm }, focus: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
