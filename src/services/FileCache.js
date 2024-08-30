import { openDB } from 'idb';

const dbPromise = openDB('FileCache', 1, {
  upgrade(db) {
    db.createObjectStore('files');
  },
});

export const FileCache = {
  async set(key, workbook) {
    const db = await dbPromise;
    await db.put('files', workbook, key);
  },

  async get(key) {
    const db = await dbPromise;
    return await db.get('files', key);
  },

  async delete(key) {
    const db = await dbPromise;
    await db.delete('files', key);
  },
};