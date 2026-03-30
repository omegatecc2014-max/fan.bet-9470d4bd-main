import type { HintCard, Influencer } from '@/data/mockData';

const DB_NAME = 'FanBetLocalDB';
const STORE_NAME = 'local_posts';
const DB_VERSION = 1;

interface LocalPost extends HintCard {
  location?: {
    latitude: number;
    longitude: number;
  };
}

class StorageUtil {
  private async getDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          // Create the object store with the keyPath as 'id'
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }

  async savePost(post: LocalPost): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(post);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getPosts(): Promise<LocalPost[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        // Sort posts by date, descending
        const res = request.result || [];
        res.sort((a, b) => new Date(b.bettingClosesAt).getTime() - new Date(a.bettingClosesAt).getTime());
        resolve(res);
      };
    });
  }
}

export const localDB = new StorageUtil();
export type { LocalPost };
