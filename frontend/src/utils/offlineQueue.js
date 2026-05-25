import { openDB } from 'idb';

const DB_NAME = 'disasterlink-offline';
const STORE_NAME = 'sos-queue';

export const getDB = () => openDB(DB_NAME, 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
    }
  }
});

export const queueSOS = async (sosData) => {
  const db = await getDB();
  await db.add(STORE_NAME, { ...sosData, queued: true, timestamp: Date.now() });
};

export const getQueuedSOS = async () => {
  const db = await getDB();
  return db.getAll(STORE_NAME);
};

export const removeQueuedSOS = async (id) => {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
};