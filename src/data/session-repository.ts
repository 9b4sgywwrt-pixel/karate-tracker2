import { SessionDraft, TrainingSession } from './session-types';

export interface SessionRepository {
  initialize(): Promise<void>;
  list(): Promise<TrainingSession[]>;
  get(id: string): Promise<TrainingSession | null>;
  create(draft: SessionDraft): Promise<TrainingSession>;
  update(id: string, draft: SessionDraft): Promise<TrainingSession>;
  delete(id: string): Promise<void>;
  upsertFromSync(session: TrainingSession): Promise<void>;
  deleteFromSync(id: string): Promise<void>;
}
