import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Href, useFocusEffect, useRouter } from 'expo-router';
import { ComponentProps, useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { ChoiceChip, IconButton, PrimaryButton } from '@/components/ui/controls';
import { Screen } from '@/components/ui/screen';
import { radius, spacing } from '@/constants/theme';
import { useSessions } from '@/data/sessions-context';
import { formatDuration, formatSessionDate, MartialArt, TrainingSession } from '@/data/session-types';
import { useAppTheme } from '@/hooks/use-app-theme';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];
const artIcons: Record<MartialArt, IconName> = { Karate: 'karate', BJJ: 'account-group-outline', Kobudo: 'sword-cross' };
type Filter = 'All training' | MartialArt;

export default function DiaryScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { sessions, loading, error, refresh } = useSessions();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('All training');
  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));
  const visible = useMemo(() => sessions.filter((session) => {
    const matchesArt = filter === 'All training' || session.martialArt === filter;
    const haystack = [session.martialArt, session.primaryFocus, ...session.additionalFocuses, session.notes ?? ''].join(' ').toLowerCase();
    return matchesArt && haystack.includes(query.trim().toLowerCase());
  }), [sessions, filter, query]);

  return <Screen title="Training diary" subtitle="Your practice, one session at a time" action={<IconButton icon="tune-variant" label="Open filters" />}>
    <View style={[s.search, { backgroundColor: colors.surface, borderColor: colors.border }]}><MaterialCommunityIcons name="magnify" size={21} color={colors.textMuted} /><TextInput accessibilityLabel="Search training diary" value={query} onChangeText={setQuery} placeholder="Search notes and focuses" placeholderTextColor={colors.textMuted} style={[s.input, { color: colors.text }]} /></View>
    <View style={s.chips}>{(['All training', 'Karate', 'BJJ', 'Kobudo'] as Filter[]).map((item) => <ChoiceChip key={item} label={item} selected={filter === item} onPress={() => setFilter(item)} />)}</View>
    {loading ? <ActivityIndicator style={s.state} color={colors.primary} /> : null}
    {error ? <Card style={s.state}><AppText weight="bold" color={colors.primary}>Training diary unavailable</AppText><AppText color={colors.textMuted}>{error}</AppText></Card> : null}
    {!loading && !error && sessions.length === 0 ? <Card style={s.empty}><MaterialCommunityIcons name="book-open-page-variant-outline" size={32} color={colors.primary} /><AppText variant="heading" weight="bold">Your diary is ready</AppText><AppText color={colors.textMuted} style={s.center}>Log your first training session and it will appear here.</AppText><PrimaryButton onPress={() => router.navigate('/log')}>Log training</PrimaryButton></Card> : null}
    {!loading && sessions.length > 0 && visible.length === 0 ? <Card style={s.state}><AppText weight="bold">No matching sessions</AppText><AppText color={colors.textMuted}>Try another search or choose All training.</AppText></Card> : null}
    {visible.map((session) => <SessionRow key={session.id} session={session} onPress={() => router.push({ pathname: '/session', params: { id: session.id } } as Href)} />)}
  </Screen>;
}

function SessionRow({ session, onPress }: { session: TrainingSession; onPress: () => void }) {
  const { colors } = useAppTheme();
  return <View><AppText variant="label" weight="bold" color={colors.textMuted} style={s.day}>{formatSessionDate(session.date, { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}</AppText><Pressable accessibilityRole="button" accessibilityLabel={`Open ${session.martialArt} session`} onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.72 : 1 })}><Card style={s.session}><View style={[s.icon, { backgroundColor: colors.surfaceMuted }]}><MaterialCommunityIcons name={artIcons[session.martialArt]} size={22} color={colors.primary} /></View><View style={s.copy}><View style={s.top}><AppText variant="heading" weight="bold">{session.martialArt}</AppText><AppText variant="label" weight="bold" color={colors.textMuted}>{formatDuration(session.durationMinutes)}</AppText></View><View style={s.focus}><AppText weight="medium" color={colors.primary}>{session.primaryFocus}</AppText>{session.additionalFocuses.length ? <AppText variant="caption" color={colors.textMuted}>+ {session.additionalFocuses.join(', ')}</AppText> : null}</View>{session.notes ? <AppText variant="caption" color={colors.textMuted} numberOfLines={2}>{session.notes}</AppText> : null}</View><MaterialCommunityIcons name="chevron-right" size={22} color={colors.textMuted} /></Card></Pressable></View>;
}

const s = StyleSheet.create({
  search: { height: 52, borderWidth: 1, borderRadius: radius.md, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm }, input: { flex: 1, height: '100%', fontSize: 16 }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  state: { marginTop: spacing.xl, gap: spacing.sm }, empty: { marginTop: spacing.xl, alignItems: 'center', gap: spacing.md }, center: { textAlign: 'center' }, day: { marginTop: spacing.xl, marginBottom: spacing.sm }, session: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  icon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, copy: { flex: 1, minWidth: 0, gap: 4 }, top: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm }, focus: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
