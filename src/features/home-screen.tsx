import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Href, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { ActivityIndicator, StyleSheet, useWindowDimensions, View } from 'react-native';
import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { IconButton, PrimaryButton, SectionHeader } from '@/components/ui/controls';
import { MetricCard, ProgressRow } from '@/components/ui/metric';
import { Screen } from '@/components/ui/screen';
import { radius, spacing } from '@/constants/theme';
import { useSessions } from '@/data/sessions-context';
import { calculateTrainingStats } from '@/data/session-stats';
import { formatDuration, formatSessionDate } from '@/data/session-types';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useCalendar } from '@/data/calendar-context';
import { addDays, formatTime, getOccurrences, localDateKey } from '@/data/calendar-types';

export default function HomeScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const compact = width < 360;
  const { sessions, loading, error, refresh } = useSessions();
  const calendar = useCalendar();
  const refreshCalendar=calendar.refresh;
  useFocusEffect(useCallback(() => { void Promise.all([refresh(),refreshCalendar()]); }, [refresh,refreshCalendar]));
  const stats = useMemo(() => calculateTrainingStats(sessions), [sessions]);
  const maxDiscipline = Math.max(...Object.values(stats.byArt), 1);
  const today = new Intl.DateTimeFormat('en-AU', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
  const todayKey=localDateKey(new Date()),horizon=localDateKey(addDays(new Date(),365));
  const nextTraining=useMemo(()=>getOccurrences(calendar.schedules,calendar.exceptions,todayKey,horizon).find(item=>item.status==='scheduled')??null,[calendar.schedules,calendar.exceptions,todayKey,horizon]);
  const nextEvent=useMemo(()=>calendar.events.filter(item=>item.date>=todayKey&&item.type!=='Planned training').sort((a,b)=>a.date.localeCompare(b.date)||(a.startTime??'').localeCompare(b.startTime??''))[0]??null,[calendar.events,todayKey]);

  return <Screen eyebrow={today} title="Good morning" subtitle="Ready for your next session?" action={<IconButton icon="cog-outline" symbol="⚙" label="Account and settings" onPress={()=>router.navigate('/account' as Href)} />}>
    {loading ? <ActivityIndicator color={colors.primary} /> : null}
    {error ? <Card><AppText weight="bold" color={colors.primary}>Training stats unavailable</AppText><AppText color={colors.textMuted}>{error}</AppText></Card> : null}
    {!loading && !error && sessions.length === 0 ? <Card style={s.empty}><MaterialCommunityIcons name="chart-line" size={32} color={colors.primary} /><AppText variant="heading" weight="bold">Your training stats will appear here</AppText><AppText color={colors.textMuted} style={s.center}>Log your first completed session to start your diary, totals and weekly streak.</AppText><PrimaryButton onPress={() => router.navigate('/log')}>Log first session</PrimaryButton></Card> : null}
    {sessions.length > 0 ? <>
      <Card style={[s.hero, { backgroundColor: colors.hero, borderColor: colors.hero }]}><View style={s.row}><View><AppText variant="label" weight="bold" color={colors.onHeroMuted}>THIS WEEK</AppText><AppText variant="display" weight="bold" color={colors.onHero} style={s.value}>{formatDuration(stats.weekMinutes)}</AppText></View><View style={[s.fire, { backgroundColor: colors.primary }]}><MaterialCommunityIcons name="fire" size={23} color={colors.onPrimary} /></View></View><AppText color={colors.onHeroMuted}>{stats.weekDays} training {stats.weekDays === 1 ? 'day' : 'days'} · {stats.weekSessions} completed {stats.weekSessions === 1 ? 'session' : 'sessions'}</AppText></Card>
      <View style={[s.metrics, compact && s.stack]}><MetricCard label="Weekly streak" value={`${stats.weeklyStreak} ${stats.weeklyStreak === 1 ? 'week' : 'weeks'}`} detail="Consecutive active weeks" /><MetricCard label="Total training" value={formatDuration(stats.totalMinutes)} detail="All completed sessions" /></View>
      <SectionHeader title="Disciplines" action="View progress" /><Card><ProgressRow label="Karate" value={formatDuration(stats.byArt.Karate)} progress={stats.byArt.Karate / maxDiscipline} color={colors.karate} /><ProgressRow label="BJJ" value={formatDuration(stats.byArt.BJJ)} progress={stats.byArt.BJJ / maxDiscipline} color={colors.bjj} /><ProgressRow label="Kobudo" value={formatDuration(stats.byArt.Kobudo)} progress={stats.byArt.Kobudo / maxDiscipline} color={colors.kobudo} /></Card>
    </> : null}
    <SectionHeader title="Next scheduled training" />{nextTraining?<CalendarPreview date={nextTraining.date} title={nextTraining.schedule.martialArt} detail={`${formatTime(nextTraining.schedule.startTime)}${nextTraining.schedule.location?` · ${nextTraining.schedule.location}`:''}`} onPress={()=>router.navigate('/calendar')}/>:<Card style={s.empty}><AppText weight="bold">No weekly training scheduled</AppText><AppText color={colors.textMuted} style={s.center}>Add your regular training days and they will appear here.</AppText><PrimaryButton onPress={()=>router.navigate('/calendar')}>Set up your training schedule</PrimaryButton></Card>}
    <SectionHeader title="Upcoming event" />{nextEvent?<CalendarPreview date={nextEvent.date} title={nextEvent.title} detail={`${nextEvent.type}${nextEvent.startTime?` · ${formatTime(nextEvent.startTime)}`:''}${nextEvent.location?` · ${nextEvent.location}`:''}`} success onPress={()=>router.navigate('/calendar')}/>:<Card><AppText color={colors.textMuted}>No upcoming grading, seminar or other important event.</AppText></Card>}
    <View style={s.button}><PrimaryButton onPress={() => router.navigate('/log')}>Log training</PrimaryButton></View>
  </Screen>;
}

function CalendarPreview({ date, title, detail, success, onPress }: { date: string; title: string; detail: string; success?: boolean; onPress:()=>void }) {
  const { colors } = useAppTheme();
  const tint = success ? colors.success : colors.primary;
  return <Card style={s.event}><View style={[s.date, { backgroundColor: success ? colors.successSoft : colors.primarySoft }]}><AppText variant="caption" weight="bold" color={tint} style={s.center}>{formatSessionDate(date,{weekday:'short',day:'numeric'}).toUpperCase()}</AppText></View><View style={s.copy}><AppText weight="bold">{title}</AppText><AppText variant="caption" color={colors.textMuted}>{detail}</AppText></View><IconButton icon="chevron-right" label="Open calendar" onPress={onPress} /></Card>;
}
const s = StyleSheet.create({
  empty: { alignItems: 'center', gap: spacing.md }, center: { textAlign: 'center' }, hero: { padding: spacing.xl }, row: { flexDirection: 'row', justifyContent: 'space-between' }, value: { marginVertical: spacing.sm }, fire: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  metrics: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md }, stack: { flexDirection: 'column' }, event: { flexDirection: 'row', alignItems: 'center', gap: spacing.md }, date: { width: 54, height: 54, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' }, copy: { flex: 1, minWidth: 0, gap: 3 }, button: { marginTop: spacing.xl },
});
