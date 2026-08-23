import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveSyncVersion } from './sync-resolution';

const oldStamp = '2026-08-23T01:00:00.000Z';
const newStamp = '2026-08-23T02:00:00.000Z';

test('newer local edits are uploaded', () => {
  assert.equal(resolveSyncVersion({ localUpdatedAt: newStamp, remoteUpdatedAt: oldStamp }), 'push-local');
});

test('newer cloud edits are downloaded without overwriting them', () => {
  assert.equal(resolveSyncVersion({ localUpdatedAt: oldStamp, remoteUpdatedAt: newStamp }), 'pull-remote');
});

test('newer local tombstones safely delete the cloud record', () => {
  assert.equal(resolveSyncVersion({ localDeletedAt: newStamp, remoteUpdatedAt: oldStamp }), 'delete-remote');
});

test('newer cloud tombstones delete the local record', () => {
  assert.equal(resolveSyncVersion({ localUpdatedAt: oldStamp, remoteDeletedAt: newStamp }), 'delete-local');
});

test('matching timestamps do not create duplicate work', () => {
  assert.equal(resolveSyncVersion({ localUpdatedAt: oldStamp, remoteUpdatedAt: oldStamp }), 'unchanged');
});
