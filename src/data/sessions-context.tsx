import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { sessionRepository } from './session-storage';
import { SessionDraft, TrainingSession } from './session-types';
import { calendarRepository } from './calendar-storage';

type SessionsContextValue = {
  sessions: TrainingSession[];
  loading: boolean;
  error: string | null;
  refresh(): Promise<void>;
  getSession(id: string): Promise<TrainingSession | null>;
  createSession(draft: SessionDraft): Promise<TrainingSession>;
  updateSession(id: string, draft: SessionDraft): Promise<TrainingSession>;
  deleteSession(id: string): Promise<void>;
};

const SessionsContext = createContext<SessionsContextValue | null>(null);

export function SessionsProvider({ children }: PropsWithChildren) {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    try { setError(null); await sessionRepository.initialize(); setSessions(await sessionRepository.list()); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Training data could not be loaded.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => { void refresh(); }, 0);
    return () => clearTimeout(timer);
  }, [refresh]);
  const getSession = useCallback((id: string) => sessionRepository.get(id), []);
  const createSession = useCallback(async (draft: SessionDraft) => { const result = await sessionRepository.create(draft); await refresh(); return result; }, [refresh]);
  const updateSession = useCallback(async (id: string, draft: SessionDraft) => { const result = await sessionRepository.update(id, draft); await refresh(); return result; }, [refresh]);
  const deleteSession = useCallback(async (id: string) => { await sessionRepository.delete(id); await calendarRepository.unlinkSession(id); await refresh(); }, [refresh]);
  const value = useMemo<SessionsContextValue>(() => ({
    sessions, loading, error, refresh,
    getSession, createSession, updateSession, deleteSession,
  }), [sessions, loading, error, refresh, getSession, createSession, updateSession, deleteSession]);
  return <SessionsContext.Provider value={value}>{children}</SessionsContext.Provider>;
}

export function useSessions() {
  const value = useContext(SessionsContext);
  if (!value) throw new Error('useSessions must be used inside SessionsProvider.');
  return value;
}
