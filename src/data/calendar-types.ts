import { MartialArt } from './session-types';

export const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
export type Weekday = typeof weekdays[number];
export type CalendarEventType = 'Planned training' | 'Grading' | 'Seminar' | 'Other';

export type WeeklySchedule = {
  id: string; dayOfWeek: number; martialArt: MartialArt; startTime: string; endTime: string | null;
  expectedDurationMinutes: number; location: string | null; notes: string | null; startsOn: string; createdAt: string; updatedAt: string;
};
export type WeeklyScheduleDraft = Omit<WeeklySchedule, 'id' | 'startsOn' | 'createdAt' | 'updatedAt'>;
export type OneOffEvent = {
  id: string; type: CalendarEventType; title: string; date: string; startTime: string | null; endTime: string | null;
  martialArt: MartialArt | null; location: string | null; notes: string | null; createdAt: string; updatedAt: string;
};
export type OneOffEventDraft = Omit<OneOffEvent, 'id' | 'createdAt' | 'updatedAt'>;
export type OccurrenceException = { occurrenceId: string; scheduleId: string; date: string; status: 'skipped' | 'completed'; completedSessionId: string | null; updatedAt: string };
export type ScheduleOccurrence = { occurrenceId: string; date: string; schedule: WeeklySchedule; status: 'scheduled' | 'skipped' | 'completed'; completedSessionId: string | null };

export const occurrenceId = (scheduleId: string, date: string) => `${scheduleId}@${date}`;
export const createCalendarId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
export function localDateKey(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
export function parseDateKey(value: string) { return new Date(`${value}T00:00:00`); }
export function addDays(value: Date, days: number) { const result = new Date(value); result.setDate(result.getDate() + days); return result; }
export function formatTime(value: string | null) { if (!value) return ''; const [hour, minute] = value.split(':').map(Number); const date = new Date(2000, 0, 1, hour, minute); return new Intl.DateTimeFormat('en-AU', { hour: 'numeric', minute: '2-digit' }).format(date); }
export function getOccurrences(schedules: WeeklySchedule[], exceptions: OccurrenceException[], from: string, to: string): ScheduleOccurrence[] {
  const end = parseDateKey(to); const exceptionMap = new Map(exceptions.map((item) => [item.occurrenceId, item]));
  const result: ScheduleOccurrence[] = [];
  for (const schedule of schedules) {
    let cursor = parseDateKey(schedule.startsOn > from ? schedule.startsOn : from);
    while (cursor.getDay() !== schedule.dayOfWeek) cursor = addDays(cursor, 1);
    while (cursor <= end) {
      const date = localDateKey(cursor); const id = occurrenceId(schedule.id, date); const exception = exceptionMap.get(id);
      result.push({ occurrenceId: id, date, schedule, status: exception?.status ?? 'scheduled', completedSessionId: exception?.completedSessionId ?? null });
      cursor = addDays(cursor, 7);
    }
  }
  return result.sort((a, b) => a.date.localeCompare(b.date) || a.schedule.startTime.localeCompare(b.schedule.startTime));
}

export function validateSchedule(draft: WeeklyScheduleDraft) {
  if (!Number.isInteger(draft.dayOfWeek) || draft.dayOfWeek < 0 || draft.dayOfWeek > 6) return 'Choose a day of the week.';
  if (!draft.martialArt) return 'Choose Karate, BJJ or Kobudo.';
  if (!draft.startTime.trim()) return 'Enter a start time.';
  if (!Number.isInteger(draft.expectedDurationMinutes) || draft.expectedDurationMinutes <= 0) return 'Enter an expected duration of at least 1 whole minute.';
  return null;
}
export function validateEvent(draft: OneOffEventDraft) {
  if (!draft.title.trim()) return 'Enter an event title.';
  if (!draft.date.trim() || Number.isNaN(parseDateKey(draft.date).getTime())) return 'Enter a valid event date.';
  return null;
}
