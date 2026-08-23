import { OccurrenceException, OneOffEvent, OneOffEventDraft, WeeklySchedule, WeeklyScheduleDraft } from './calendar-types';

export interface CalendarRepository {
  initialize(): Promise<void>;
  listSchedules(): Promise<WeeklySchedule[]>;
  createSchedule(draft: WeeklyScheduleDraft): Promise<WeeklySchedule>;
  updateSchedule(id: string, draft: WeeklyScheduleDraft): Promise<WeeklySchedule>;
  deleteSchedule(id: string): Promise<void>;
  listEvents(): Promise<OneOffEvent[]>;
  createEvent(draft: OneOffEventDraft): Promise<OneOffEvent>;
  updateEvent(id: string, draft: OneOffEventDraft): Promise<OneOffEvent>;
  deleteEvent(id: string): Promise<void>;
  listExceptions(): Promise<OccurrenceException[]>;
  skipOccurrence(scheduleId: string, date: string): Promise<void>;
  restoreOccurrence(scheduleId: string, date: string): Promise<void>;
  completeOccurrence(scheduleId: string, date: string, sessionId: string): Promise<void>;
  unlinkSession(sessionId: string): Promise<void>;
  upsertScheduleFromSync(schedule: WeeklySchedule): Promise<void>;
  deleteScheduleFromSync(id: string): Promise<void>;
  upsertEventFromSync(event: OneOffEvent): Promise<void>;
  deleteEventFromSync(id: string): Promise<void>;
  upsertExceptionFromSync(exception: OccurrenceException): Promise<void>;
  deleteExceptionFromSync(id: string): Promise<void>;
}
