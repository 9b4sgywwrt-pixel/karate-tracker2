import type { SyncEntity, SyncTombstone } from './sync-metadata';
const KEY='karate-tracker-v2.sync-tombstones.v1';
function read():SyncTombstone[]{if(typeof window==='undefined')return[];try{return JSON.parse(window.localStorage.getItem(KEY)??'[]');}catch{return[];}}
function write(items:SyncTombstone[]){if(typeof window!=='undefined')window.localStorage.setItem(KEY,JSON.stringify(items));}
export async function recordTombstone(entityType:SyncEntity,recordId:string){const items=read().filter(item=>item.entityType!==entityType||item.recordId!==recordId);items.push({entityType,recordId,deletedAt:new Date().toISOString()});write(items);}
export async function listTombstones(){return read();}
export async function clearTombstones(done:SyncTombstone[]){const keys=new Set(done.map(item=>`${item.entityType}:${item.recordId}`));write(read().filter(item=>!keys.has(`${item.entityType}:${item.recordId}`)));}
