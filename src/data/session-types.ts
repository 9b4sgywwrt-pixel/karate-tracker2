export const focusOptions = {
  Karate: ['Kihon', 'Kata', 'Bunkai', 'Kumite'],
  BJJ: ['Technique', 'Drilling', 'Positional', 'Rolling'],
  Kobudo: ['Bo', 'Sai', 'Tonfa', 'Kama', 'Nunchaku', 'Arnis', 'Other'],
} as const;

export type MartialArt = keyof typeof focusOptions;

export type TrainingSession = {
  id: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  martialArt: MartialArt;
  primaryFocus: string;
  additionalFocuses: string[];
  durationMinutes: number;
  notes: string | null;
  scheduledOccurrenceId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SessionDraft = Omit<TrainingSession, 'id' | 'createdAt' | 'updatedAt'>;

export type SessionValidationErrors = Partial<Record<'date' | 'martialArt' | 'primaryFocus' | 'durationMinutes', string>>;

export function validateSession(draft: SessionDraft): SessionValidationErrors {
  const errors: SessionValidationErrors = {};
  if (!draft.date.trim()) errors.date = 'Choose a training date before saving.';
  if (!draft.martialArt || !focusOptions[draft.martialArt]) errors.martialArt = 'Choose Karate, BJJ or Kobudo.';
  if (!draft.primaryFocus.trim()) errors.primaryFocus = 'Choose one primary focus.';
  else if (!(focusOptions[draft.martialArt] as readonly string[]).includes(draft.primaryFocus)) errors.primaryFocus = `Choose a valid ${draft.martialArt} focus.`;
  if (!Number.isInteger(draft.durationMinutes) || draft.durationMinutes <= 0) errors.durationMinutes = 'Enter a duration of at least 1 whole minute.';
  return errors;
}

export function normalizeDraft(draft: SessionDraft): SessionDraft {
  const validFocuses = new Set<string>(focusOptions[draft.martialArt] ?? []);
  return {
    ...draft,
    date: draft.date.trim(),
    startTime: draft.startTime?.trim() || null,
    endTime: draft.endTime?.trim() || null,
    primaryFocus: draft.primaryFocus.trim(),
    additionalFocuses: [...new Set(draft.additionalFocuses)].filter((focus) => focus !== draft.primaryFocus && validFocuses.has(focus)),
    notes: draft.notes?.trim() || null,
    scheduledOccurrenceId: draft.scheduledOccurrenceId?.trim() || null,
  };
}

export function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (!hours) return `${remainder} min`;
  if (!remainder) return `${hours} hr`;
  return `${hours} hr ${remainder} min`;
}

export function formatSessionDate(date: string, options?: Intl.DateTimeFormatOptions) {
  const value = new Date(`${date}T00:00:00`);
  if (Number.isNaN(value.getTime())) return date;
  return new Intl.DateTimeFormat('en-AU', options ?? { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(value);
}

export function createSessionId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
