import { SessionRepository } from './session-repository';
import { createSessionId, normalizeDraft, SessionDraft, TrainingSession } from './session-types';
import { recordTombstone } from '@/cloud/sync-metadata';
import { notifyLocalChange } from '@/cloud/sync-trigger';

const STORAGE_KEY = 'karate-tracker-v2.sessions.v1';
let serverMemory: TrainingSession[] = [];

function read(): TrainingSession[] {
  if (typeof window === 'undefined') return serverMemory;
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value ? JSON.parse(value) as TrainingSession[] : [];
  } catch {
    return [];
  }
}

function write(sessions: TrainingSession[]) {
  if (typeof window === 'undefined') serverMemory = sessions;
  else window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

class WebSessionRepository implements SessionRepository {
  async initialize() {}
  async list() { return read().sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)); }
  async get(id: string) { return read().find((session) => session.id === id) ?? null; }
  async create(input: SessionDraft) {
    if (input.scheduledOccurrenceId && read().some((session) => session.scheduledOccurrenceId === input.scheduledOccurrenceId)) throw new Error('This scheduled training has already been completed.');
    const now = new Date().toISOString();
    const session: TrainingSession = { ...normalizeDraft(input), id: createSessionId(), createdAt: now, updatedAt: now };
    write([...read(), session]);
    notifyLocalChange();
    return session;
  }
  async update(id: string, input: SessionDraft) {
    const sessions = read();
    const index = sessions.findIndex((session) => session.id === id);
    if (index < 0) throw new Error('That training session could not be found.');
    const updated: TrainingSession = { ...sessions[index], ...normalizeDraft(input), updatedAt: new Date().toISOString() };
    sessions[index] = updated;
    write(sessions);
    notifyLocalChange();
    return updated;
  }
  async delete(id: string) { write(read().filter((session) => session.id !== id)); await recordTombstone('session',id); notifyLocalChange(); }
  async upsertFromSync(session:TrainingSession){write([...read().filter(item=>item.id!==session.id),session]);}
  async deleteFromSync(id:string){write(read().filter(item=>item.id!==id));}
}

export const sessionRepository: SessionRepository = new WebSessionRepository();
