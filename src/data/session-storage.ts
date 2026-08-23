import { SessionRepository } from './session-repository';
import { createSessionId, normalizeDraft, SessionDraft, TrainingSession } from './session-types';
import { initializeDatabase } from './database';
import { recordTombstone } from '@/cloud/sync-metadata';
import { notifyLocalChange } from '@/cloud/sync-trigger';

type SessionRow = {
  id: string; date: string; start_time: string | null; end_time: string | null; martial_art: TrainingSession['martialArt'];
  primary_focus: string; additional_focuses: string; duration_minutes: number; notes: string | null; scheduled_occurrence_id:string|null; created_at: string; updated_at: string;
};

function fromRow(row: SessionRow): TrainingSession {
  return {
    id: row.id, date: row.date, startTime: row.start_time, endTime: row.end_time, martialArt: row.martial_art,
    primaryFocus: row.primary_focus, additionalFocuses: JSON.parse(row.additional_focuses) as string[], durationMinutes: row.duration_minutes,
    notes: row.notes, scheduledOccurrenceId:row.scheduled_occurrence_id, createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

class SQLiteSessionRepository implements SessionRepository {
  async initialize() { await initializeDatabase(); }

  async list() {
    await this.initialize();
    const rows = await (await initializeDatabase()).getAllAsync<SessionRow>('SELECT * FROM training_sessions ORDER BY date DESC, created_at DESC');
    return rows.map(fromRow);
  }

  async get(id: string) {
    await this.initialize();
    const row = await (await initializeDatabase()).getFirstAsync<SessionRow>('SELECT * FROM training_sessions WHERE id = ?', id);
    return row ? fromRow(row) : null;
  }

  async create(input: SessionDraft) {
    await this.initialize();
    const draft = normalizeDraft(input);
    const now = new Date().toISOString();
    const session: TrainingSession = { ...draft, id: createSessionId(), createdAt: now, updatedAt: now };
    await (await initializeDatabase()).runAsync(
      `INSERT INTO training_sessions (id, date, start_time, end_time, martial_art, primary_focus, additional_focuses, duration_minutes, notes, scheduled_occurrence_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      session.id, session.date, session.startTime, session.endTime, session.martialArt, session.primaryFocus,
      JSON.stringify(session.additionalFocuses), session.durationMinutes, session.notes, session.scheduledOccurrenceId, session.createdAt, session.updatedAt,
    );
    notifyLocalChange();
    return session;
  }

  async update(id: string, input: SessionDraft) {
    await this.initialize();
    const existing = await this.get(id);
    if (!existing) throw new Error('That training session could not be found.');
    const draft = normalizeDraft(input);
    const session: TrainingSession = { ...existing, ...draft, updatedAt: new Date().toISOString() };
    await (await initializeDatabase()).runAsync(
      `UPDATE training_sessions SET date = ?, start_time = ?, end_time = ?, martial_art = ?, primary_focus = ?, additional_focuses = ?, duration_minutes = ?, notes = ?, scheduled_occurrence_id=?, updated_at = ? WHERE id = ?`,
      session.date, session.startTime, session.endTime, session.martialArt, session.primaryFocus,
      JSON.stringify(session.additionalFocuses), session.durationMinutes, session.notes, session.scheduledOccurrenceId, session.updatedAt, id,
    );
    notifyLocalChange();
    return session;
  }

  async delete(id: string) {
    await this.initialize();
    await (await initializeDatabase()).runAsync('DELETE FROM training_sessions WHERE id = ?', id);
    await recordTombstone('session', id); notifyLocalChange();
  }
  async upsertFromSync(session:TrainingSession){await this.initialize();await(await initializeDatabase()).runAsync(`INSERT INTO training_sessions (id,date,start_time,end_time,martial_art,primary_focus,additional_focuses,duration_minutes,notes,scheduled_occurrence_id,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET date=excluded.date,start_time=excluded.start_time,end_time=excluded.end_time,martial_art=excluded.martial_art,primary_focus=excluded.primary_focus,additional_focuses=excluded.additional_focuses,duration_minutes=excluded.duration_minutes,notes=excluded.notes,scheduled_occurrence_id=excluded.scheduled_occurrence_id,created_at=excluded.created_at,updated_at=excluded.updated_at`,session.id,session.date,session.startTime,session.endTime,session.martialArt,session.primaryFocus,JSON.stringify(session.additionalFocuses),session.durationMinutes,session.notes,session.scheduledOccurrenceId,session.createdAt,session.updatedAt);}
  async deleteFromSync(id:string){await(await initializeDatabase()).runAsync('DELETE FROM training_sessions WHERE id=?',id);}
}

export const sessionRepository: SessionRepository = new SQLiteSessionRepository();
