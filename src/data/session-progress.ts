import { focusOptions, MartialArt, TrainingSession } from './session-types';

export type ProgressPeriod = 'thisMonth' | 'lastMonth' | 'allTime';
export type MonthlyTotal = { key: string; label: string; minutes: number };
export type ProgressStats = {
  totalMinutes: number; trainingDays: number; completedSessions: number;
  currentWeeklyStreak: number; bestWeeklyStreak: number;
  byArt: Record<MartialArt, number>;
  focusOccurrences: Record<MartialArt, Record<string, number>>;
  primaryRollingMinutes: number; monthlyTotals: MonthlyTotal[];
};

function localDate(value: string) { return new Date(`${value}T00:00:00`); }
function dateKey(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
function startOfWeek(value: Date) { const date = new Date(value.getFullYear(), value.getMonth(), value.getDate()); date.setDate(date.getDate() - ((date.getDay() + 6) % 7)); return date; }
function monthKey(value: Date) { return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}`; }
function sessionsForPeriod(sessions: TrainingSession[], period: ProgressPeriod, now: Date) {
  if (period === 'allTime') return sessions;
  const offset = period === 'lastMonth' ? -1 : 0;
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 1);
  return sessions.filter((session) => { const date = localDate(session.date); return date >= start && date < end; });
}
function streaks(sessions: TrainingSession[], now: Date) {
  const weeks = [...new Set(sessions.map((session) => dateKey(startOfWeek(localDate(session.date)))))].sort();
  let best = 0; let run = 0; let previous: Date | null = null;
  for (const key of weeks) { const week = localDate(key); if (previous && Math.round((week.getTime() - previous.getTime()) / 604800000) === 1) run += 1; else run = 1; best = Math.max(best, run); previous = week; }
  const currentStart = startOfWeek(now); let current = 0; const trained = new Set(weeks); const cursor = new Date(currentStart);
  while (trained.has(dateKey(cursor))) { current += 1; cursor.setDate(cursor.getDate() - 7); }
  return { current, best };
}
function recentMonthlyTotals(sessions: TrainingSession[], now: Date): MonthlyTotal[] {
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1); const key = monthKey(date);
    return { key, label: date.toLocaleDateString('en-AU', { month: 'short' }), minutes: sessions.filter((session) => session.date.startsWith(key)).reduce((sum, session) => sum + session.durationMinutes, 0) };
  });
}

export function calculateProgressStats(sessions: TrainingSession[], period: ProgressPeriod, now = new Date()): ProgressStats {
  const selected = sessionsForPeriod(sessions, period, now); const streak = streaks(sessions, now);
  const focusOccurrences = Object.fromEntries((Object.keys(focusOptions) as MartialArt[]).map((art) => [art, Object.fromEntries(focusOptions[art].map((focus) => [focus, 0]))])) as ProgressStats['focusOccurrences'];
  for (const session of selected) { const practised = new Set([session.primaryFocus, ...session.additionalFocuses]); for (const focus of practised) if (focus in focusOccurrences[session.martialArt]) focusOccurrences[session.martialArt][focus] += 1; }
  const byArt = Object.fromEntries((Object.keys(focusOptions) as MartialArt[]).map((art) => [art, selected.filter((session) => session.martialArt === art).reduce((sum, session) => sum + session.durationMinutes, 0)])) as Record<MartialArt, number>;
  return { totalMinutes: selected.reduce((sum, session) => sum + session.durationMinutes, 0), trainingDays: new Set(selected.map((session) => session.date)).size, completedSessions: selected.length, currentWeeklyStreak: streak.current, bestWeeklyStreak: streak.best, byArt, focusOccurrences, primaryRollingMinutes: selected.filter((session) => session.martialArt === 'BJJ' && session.primaryFocus === 'Rolling').reduce((sum, session) => sum + session.durationMinutes, 0), monthlyTotals: recentMonthlyTotals(sessions, now) };
}
