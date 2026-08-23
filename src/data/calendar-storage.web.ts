import { CalendarRepository } from './calendar-repository';
import { createCalendarId, localDateKey, occurrenceId, OccurrenceException, OneOffEvent, OneOffEventDraft, WeeklySchedule, WeeklyScheduleDraft } from './calendar-types';
import { recordTombstone } from '@/cloud/sync-metadata';
import { notifyLocalChange } from '@/cloud/sync-trigger';
type Store={schedules:WeeklySchedule[];events:OneOffEvent[];exceptions:OccurrenceException[]};
const KEY='karate-tracker-v2.calendar.v1'; let memory:Store={schedules:[],events:[],exceptions:[]};
function read():Store{if(typeof window==='undefined')return memory;try{return JSON.parse(window.localStorage.getItem(KEY)??'null')??{schedules:[],events:[],exceptions:[]};}catch{return{schedules:[],events:[],exceptions:[]};}}
function write(v:Store){if(typeof window==='undefined')memory=v;else window.localStorage.setItem(KEY,JSON.stringify(v));}
class WebCalendarRepository implements CalendarRepository{
 async initialize(){} async listSchedules(){return read().schedules.sort((a,b)=>a.dayOfWeek-b.dayOfWeek||a.startTime.localeCompare(b.startTime));}
 async createSchedule(d:WeeklyScheduleDraft){const store=read(),now=new Date().toISOString();const item:WeeklySchedule={...d,endTime:d.endTime?.trim()||null,location:d.location?.trim()||null,notes:d.notes?.trim()||null,id:createCalendarId(),startsOn:localDateKey(new Date()),createdAt:now,updatedAt:now};store.schedules.push(item);write(store);notifyLocalChange();return item;}
 async updateSchedule(id:string,d:WeeklyScheduleDraft){const store=read(),i=store.schedules.findIndex(x=>x.id===id);if(i<0)throw new Error('That weekly schedule could not be found.');store.schedules[i]={...store.schedules[i],...d,endTime:d.endTime?.trim()||null,location:d.location?.trim()||null,notes:d.notes?.trim()||null,updatedAt:new Date().toISOString()};write(store);notifyLocalChange();return store.schedules[i];}
 async deleteSchedule(id:string){const s=read();s.schedules=s.schedules.filter(x=>x.id!==id);s.exceptions=s.exceptions.filter(x=>x.scheduleId!==id);write(s);await recordTombstone('schedule',id);notifyLocalChange();}
 async listEvents(){return read().events.sort((a,b)=>a.date.localeCompare(b.date));}
 async createEvent(d:OneOffEventDraft){const s=read(),now=new Date().toISOString();const item:OneOffEvent={...d,title:d.title.trim(),startTime:d.startTime?.trim()||null,endTime:d.endTime?.trim()||null,location:d.location?.trim()||null,notes:d.notes?.trim()||null,id:createCalendarId(),createdAt:now,updatedAt:now};s.events.push(item);write(s);notifyLocalChange();return item;}
 async updateEvent(id:string,d:OneOffEventDraft){const s=read(),i=s.events.findIndex(x=>x.id===id);if(i<0)throw new Error('That event could not be found.');s.events[i]={...s.events[i],...d,title:d.title.trim(),updatedAt:new Date().toISOString()};write(s);notifyLocalChange();return s.events[i];}
 async deleteEvent(id:string){const s=read();s.events=s.events.filter(x=>x.id!==id);write(s);await recordTombstone('event',id);notifyLocalChange();}
 async listExceptions(){return read().exceptions;}
 async skipOccurrence(scheduleId:string,date:string){const s=read(),id=occurrenceId(scheduleId,date),old=s.exceptions.find(x=>x.occurrenceId===id);if(old?.status==='completed')throw new Error('Completed training cannot be skipped.');s.exceptions=s.exceptions.filter(x=>x.occurrenceId!==id);s.exceptions.push({occurrenceId:id,scheduleId,date,status:'skipped',completedSessionId:null,updatedAt:new Date().toISOString()});write(s);notifyLocalChange();}
 async restoreOccurrence(scheduleId:string,date:string){const s=read(),id=occurrenceId(scheduleId,date);s.exceptions=s.exceptions.filter(x=>x.occurrenceId!==id||x.status!=='skipped');write(s);await recordTombstone('occurrence',id);notifyLocalChange();}
 async completeOccurrence(scheduleId:string,date:string,sessionId:string){const s=read(),id=occurrenceId(scheduleId,date),old=s.exceptions.find(x=>x.occurrenceId===id);if(old?.status==='completed')throw new Error('This scheduled training has already been completed.');s.exceptions=s.exceptions.filter(x=>x.occurrenceId!==id);s.exceptions.push({occurrenceId:id,scheduleId,date,status:'completed',completedSessionId:sessionId,updatedAt:new Date().toISOString()});write(s);notifyLocalChange();}
 async unlinkSession(sessionId:string){const s=read(),removed=s.exceptions.filter(x=>x.completedSessionId===sessionId);s.exceptions=s.exceptions.filter(x=>x.completedSessionId!==sessionId);write(s);for(const item of removed)await recordTombstone('occurrence',item.occurrenceId);notifyLocalChange();}
 async upsertScheduleFromSync(i:WeeklySchedule){const s=read();s.schedules=[...s.schedules.filter(x=>x.id!==i.id),i];write(s);}
 async deleteScheduleFromSync(id:string){const s=read();s.schedules=s.schedules.filter(x=>x.id!==id);s.exceptions=s.exceptions.filter(x=>x.scheduleId!==id);write(s);}
 async upsertEventFromSync(i:OneOffEvent){const s=read();s.events=[...s.events.filter(x=>x.id!==i.id),i];write(s);}
 async deleteEventFromSync(id:string){const s=read();s.events=s.events.filter(x=>x.id!==id);write(s);}
 async upsertExceptionFromSync(i:OccurrenceException){const s=read();s.exceptions=[...s.exceptions.filter(x=>x.occurrenceId!==i.occurrenceId),i];write(s);}
 async deleteExceptionFromSync(id:string){const s=read();s.exceptions=s.exceptions.filter(x=>x.occurrenceId!==id);write(s);}
}
export const calendarRepository:CalendarRepository=new WebCalendarRepository();
