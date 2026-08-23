import { MartialArt, TrainingSession } from './session-types';

export type TrainingStats = {
  weekMinutes: number;
  weekDays: number;
  weekSessions: number;
  weeklyStreak: number;
  totalMinutes: number;
  byArt: Record<MartialArt, number>;
};

function localDate(date: string) { return new Date(`${date}T00:00:00`); }
function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
function startOfWeek(value: Date) {
  const date = new Date(value.getFullYear(), value.getMonth(), value.getDate());
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return date;
}

export function calculateTrainingStats(sessions: TrainingSession[], now = new Date()): TrainingStats {
  const weekStart = startOfWeek(now);
  const nextWeek = new Date(weekStart); nextWeek.setDate(nextWeek.getDate() + 7);
  const thisWeek = sessions.filter((session) => { const date = localDate(session.date); return date >= weekStart && date < nextWeek; });
  const trainedWeeks = new Set(sessions.map((session) => dateKey(startOfWeek(localDate(session.date)))));
  let weeklyStreak = 0;
  const cursor = new Date(weekStart);
  while (trainedWeeks.has(dateKey(cursor))) { weeklyStreak += 1; cursor.setDate(cursor.getDate() - 7); }
  return {
    weekMinutes: thisWeek.reduce((total, session) => total + session.durationMinutes, 0),
    weekDays: new Set(thisWeek.map((session) => session.date)).size,
    weekSessions: thisWeek.length,
    weeklyStreak,
    totalMinutes: sessions.reduce((total, session) => total + session.durationMinutes, 0),
    byArt: {
      Karate: sessions.filter((session) => session.martialArt === 'Karate').reduce((total, session) => total + session.durationMinutes, 0),
      BJJ: sessions.filter((session) => session.martialArt === 'BJJ').reduce((total, session) => total + session.durationMinutes, 0),
      Kobudo: sessions.filter((session) => session.martialArt === 'Kobudo').reduce((total, session) => total + session.durationMinutes, 0),
    },
  };
}
