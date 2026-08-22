import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { ChoiceChip, PrimaryButton, SectionHeader } from '@/components/ui/controls';
import { Screen } from '@/components/ui/screen';
import { radius, spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

const focuses = { Karate: ['Kihon', 'Kata', 'Bunkai', 'Kumite'], BJJ: ['Technique', 'Drilling', 'Positional', 'Rolling'], Kobudo: ['Bo', 'Sai', 'Tonfa', 'Kama', 'Nunchaku', 'Arnis', 'Other'] };
type Art = keyof typeof focuses;

export default function LogScreen() {
  const { colors } = useAppTheme();
  const [art, setArt] = useState<Art>('Karate');
  const [primary, setPrimary] = useState('Kata');
  const [additional, setAdditional] = useState<string[]>(['Kihon', 'Bunkai']);
  const chooseArt = (next: Art) => { setArt(next); setPrimary(focuses[next][0]); setAdditional([]); };
  const toggle = (focus: string) => setAdditional((items) => items.includes(focus) ? items.filter((item) => item !== focus) : [...items, focus]);
  return <Screen title="Log training" subtitle="Capture the work while it is fresh">
    <SectionHeader title="Date" />
    <Card style={s.field}><MaterialCommunityIcons name="calendar-blank-outline" size={22} color={colors.primary} /><View style={s.grow}><AppText variant="caption" color={colors.textMuted}>TRAINING DATE</AppText><AppText weight="medium">Saturday, 22 August 2026</AppText></View><MaterialCommunityIcons name="chevron-right" size={23} color={colors.textMuted} /></Card>
    <SectionHeader title="Martial art" /><View style={s.choices}>{(Object.keys(focuses) as Art[]).map((item) => <ChoiceChip key={item} label={item} selected={art === item} onPress={() => chooseArt(item)} />)}</View>
    <SectionHeader title="Primary focus" /><View style={s.choices}>{focuses[art].map((item) => <ChoiceChip key={item} label={item} selected={primary === item} onPress={() => { setPrimary(item); setAdditional((items) => items.filter((focus) => focus !== item)); }} />)}</View>
    <SectionHeader title="Additional focuses" /><View style={s.choices}>{focuses[art].filter((item) => item !== primary).map((item) => <ChoiceChip key={item} label={item} selected={additional.includes(item)} onPress={() => toggle(item)} />)}</View>
    <SectionHeader title="Duration" /><View style={s.choices}><ChoiceChip label="30 min" /><ChoiceChip label="45 min" /><ChoiceChip label="1 hr" /><ChoiceChip label="1 hr 15 min" selected /></View>
    <SectionHeader title="Time" action="Optional" /><View style={s.times}><Card style={s.time}><AppText variant="caption" color={colors.textMuted}>START</AppText><AppText weight="medium">6:00 pm</AppText></Card><Card style={s.time}><AppText variant="caption" color={colors.textMuted}>END</AppText><AppText weight="medium">7:15 pm</AppText></Card></View>
    <SectionHeader title="Notes" action="Optional" /><View style={[s.notes, { backgroundColor: colors.surface, borderColor: colors.border }]}><TextInput multiline accessibilityLabel="Training notes" placeholder="What did you work on?" placeholderTextColor={colors.textMuted} style={[s.notesInput, { color: colors.text }]} /></View>
    <View style={s.save}><PrimaryButton icon="check">Save training</PrimaryButton></View><AppText variant="caption" color={colors.textMuted} style={s.message}>Visual preview only — saving comes in the database phase.</AppText>
  </Screen>;
}
const s = StyleSheet.create({
  field: { flexDirection: 'row', alignItems: 'center', gap: spacing.md }, grow: { flex: 1, gap: 2 }, choices: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  times: { flexDirection: 'row', gap: spacing.md }, time: { flex: 1, gap: spacing.xs }, notes: { minHeight: 118, borderWidth: 1, borderRadius: radius.md, padding: spacing.md },
  notesInput: { minHeight: 86, fontSize: 16, textAlignVertical: 'top' }, save: { marginTop: spacing.xl }, message: { textAlign: 'center', marginTop: spacing.sm },
});
