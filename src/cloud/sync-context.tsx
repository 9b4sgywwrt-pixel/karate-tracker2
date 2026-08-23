import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { useCalendar } from '@/data/calendar-context';
import { useSessions } from '@/data/sessions-context';
import { useAuth } from './auth-context';
import { syncCloudData, SyncResult } from './sync-service';
import { subscribeToLocalChanges } from './sync-trigger';
type Status='signedOut'|'needsChoice'|'localOnly'|'syncing'|'synced'|'error';
type Value={status:Status;lastResult:SyncResult|null;error:string|null;syncNow():Promise<void>;chooseExistingData(upload:boolean):Promise<void>};
const Context=createContext<Value|null>(null);
export function SyncProvider({children}:PropsWithChildren){const{session}=useAuth(),sessionsContext=useSessions(),calendar=useCalendar();const[status,setStatus]=useState<Status>('signedOut'),[lastResult,setLastResult]=useState<SyncResult|null>(null),[error,setError]=useState<string|null>(null);const choice=useRef<'upload'|'localOnly'|null>(null),running=useRef(false),timer=useRef<ReturnType<typeof setTimeout>|null>(null);const refreshSessions=sessionsContext.refresh,refreshCalendar=calendar.refresh;
 const syncNow=useCallback(async()=>{if(!session||choice.current!=='upload'||running.current)return;running.current=true;setStatus('syncing');setError(null);try{const result=await syncCloudData(session.user.id);setLastResult(result);await Promise.all([refreshSessions(),refreshCalendar()]);setStatus('synced');}catch(reason){setError(reason instanceof Error?reason.message:'Sync could not be completed.');setStatus('error');}finally{running.current=false;}},[session,refreshSessions,refreshCalendar]);
 useEffect(()=>{if(!session){const timer=setTimeout(()=>{choice.current=null;setStatus('signedOut');},0);return()=>clearTimeout(timer);}let cancelled=false;void AsyncStorage.getItem(`karate-sync-choice:${session.user.id}`).then(saved=>{if(cancelled)return;const hasLocal=sessionsContext.sessions.length+calendar.schedules.length+calendar.events.length>0;if(saved==='upload'||!hasLocal){choice.current='upload';setStatus('syncing');void syncNow();}else if(saved==='localOnly'){choice.current='localOnly';setStatus('localOnly');}else setStatus('needsChoice');});return()=>{cancelled=true;};},[session,sessionsContext.sessions.length,calendar.schedules.length,calendar.events.length,syncNow]);
 useEffect(()=>subscribeToLocalChanges(()=>{if(choice.current!=='upload')return;if(timer.current)clearTimeout(timer.current);timer.current=setTimeout(()=>void syncNow(),1200);}),[syncNow]);
 useEffect(()=>{if(Platform.OS==='web'){const online=()=>void syncNow();window.addEventListener('online',online);return()=>window.removeEventListener('online',online);}const subscription=AppState.addEventListener('change',state=>{if(state==='active')void syncNow();});return()=>subscription.remove();},[syncNow]);
 const chooseExistingData=useCallback(async(upload:boolean)=>{if(!session)return;choice.current=upload?'upload':'localOnly';await AsyncStorage.setItem(`karate-sync-choice:${session.user.id}`,choice.current);setStatus(upload?'syncing':'localOnly');if(upload)await syncNow();},[session,syncNow]);
 const value=useMemo<Value>(()=>({status,lastResult,error,syncNow,chooseExistingData}),[status,lastResult,error,syncNow,chooseExistingData]);return <Context.Provider value={value}>{children}</Context.Provider>}
export function useSync(){const value=useContext(Context);if(!value)throw new Error('useSync must be used inside SyncProvider.');return value;}
