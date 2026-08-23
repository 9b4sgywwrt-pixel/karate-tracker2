export type SyncResolution = 'push-local' | 'pull-remote' | 'delete-local' | 'delete-remote' | 'unchanged';

export function isNewerSyncTimestamp(candidate: string | null | undefined, current: string | null | undefined) {
  return Boolean(candidate && (!current || candidate > current));
}

export function resolveSyncVersion(input: {
  localUpdatedAt?: string | null;
  remoteUpdatedAt?: string | null;
  remoteDeletedAt?: string | null;
  localDeletedAt?: string | null;
}): SyncResolution {
  const { localUpdatedAt, remoteUpdatedAt, remoteDeletedAt, localDeletedAt } = input;
  const remoteStamp = remoteDeletedAt ?? remoteUpdatedAt;
  if (localDeletedAt && isNewerSyncTimestamp(localDeletedAt, remoteStamp)) return 'delete-remote';
  if (remoteDeletedAt && !isNewerSyncTimestamp(localUpdatedAt, remoteDeletedAt)) return 'delete-local';
  if (isNewerSyncTimestamp(remoteUpdatedAt, localUpdatedAt)) return 'pull-remote';
  if (isNewerSyncTimestamp(localUpdatedAt, remoteStamp)) return 'push-local';
  return 'unchanged';
}
