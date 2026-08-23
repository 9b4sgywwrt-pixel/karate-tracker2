import { initializeDatabase } from '@/data/database';
export type SyncEntity='session'|'schedule'|'occurrence'|'event';
export type SyncTombstone={entityType:SyncEntity;recordId:string;deletedAt:string};
export async function recordTombstone(entityType:SyncEntity,recordId:string){const now=new Date().toISOString();await(await initializeDatabase()).runAsync('INSERT OR REPLACE INTO sync_tombstones VALUES (?,?,?)',entityType,recordId,now);}
export async function listTombstones(){const rows=await(await initializeDatabase()).getAllAsync<{entity_type:SyncEntity;record_id:string;deleted_at:string}>('SELECT * FROM sync_tombstones');return rows.map(row=>({entityType:row.entity_type,recordId:row.record_id,deletedAt:row.deleted_at}));}
export async function clearTombstones(items:SyncTombstone[]){const db=await initializeDatabase();for(const item of items)await db.runAsync('DELETE FROM sync_tombstones WHERE entity_type=? AND record_id=?',item.entityType,item.recordId);}
