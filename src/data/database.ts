import * as SQLite from 'expo-sqlite';

const DATABASE_VERSION = 3;
let databasePromise: ReturnType<typeof SQLite.openDatabaseAsync> | null = null;
let initialization: Promise<SQLite.SQLiteDatabase> | null = null;
export function openDatabase() { databasePromise ??= SQLite.openDatabaseAsync('karate-tracker.db'); return databasePromise; }
export function initializeDatabase() {
  initialization ??= (async () => {
    const db = await openDatabase();
    const version = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
    const current = version?.user_version ?? 0;
    if (current > DATABASE_VERSION) throw new Error('This database was created by a newer app version.');
    if (current < 1) await db.execAsync(`
      PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;
      CREATE TABLE IF NOT EXISTS training_sessions (id TEXT PRIMARY KEY NOT NULL, date TEXT NOT NULL, start_time TEXT, end_time TEXT, martial_art TEXT NOT NULL CHECK (martial_art IN ('Karate','BJJ','Kobudo')), primary_focus TEXT NOT NULL, additional_focuses TEXT NOT NULL DEFAULT '[]', duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0), notes TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
      CREATE INDEX IF NOT EXISTS training_sessions_date_index ON training_sessions(date DESC, created_at DESC);
      PRAGMA user_version = 1;
    `);
    if (current < 2) await db.execAsync(`
      ALTER TABLE training_sessions ADD COLUMN scheduled_occurrence_id TEXT;
      CREATE UNIQUE INDEX IF NOT EXISTS training_sessions_occurrence_index ON training_sessions(scheduled_occurrence_id) WHERE scheduled_occurrence_id IS NOT NULL;
      CREATE TABLE IF NOT EXISTS weekly_schedules (id TEXT PRIMARY KEY NOT NULL, day_of_week INTEGER NOT NULL, martial_art TEXT NOT NULL, start_time TEXT NOT NULL, end_time TEXT, expected_duration_minutes INTEGER NOT NULL, location TEXT, notes TEXT, starts_on TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS calendar_events (id TEXT PRIMARY KEY NOT NULL, type TEXT NOT NULL, title TEXT NOT NULL, date TEXT NOT NULL, start_time TEXT, end_time TEXT, martial_art TEXT, location TEXT, notes TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
      CREATE INDEX IF NOT EXISTS calendar_events_date_index ON calendar_events(date);
      CREATE TABLE IF NOT EXISTS occurrence_exceptions (occurrence_id TEXT PRIMARY KEY NOT NULL, schedule_id TEXT NOT NULL, date TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('skipped','completed')), completed_session_id TEXT, FOREIGN KEY(schedule_id) REFERENCES weekly_schedules(id) ON DELETE CASCADE);
      CREATE UNIQUE INDEX IF NOT EXISTS occurrence_completed_session_index ON occurrence_exceptions(completed_session_id) WHERE completed_session_id IS NOT NULL;
      PRAGMA user_version = 2;
    `);
    if (current < 3) await db.execAsync(`
      ALTER TABLE occurrence_exceptions ADD COLUMN updated_at TEXT;
      UPDATE occurrence_exceptions SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE updated_at IS NULL;
      CREATE TABLE IF NOT EXISTS sync_tombstones (entity_type TEXT NOT NULL, record_id TEXT NOT NULL, deleted_at TEXT NOT NULL, PRIMARY KEY(entity_type,record_id));
      PRAGMA user_version = 3;
    `);
    await db.execAsync('PRAGMA foreign_keys = ON;');
    return db;
  })();
  return initialization;
}
