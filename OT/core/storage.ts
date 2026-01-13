
import { DercEntry } from '../types';

const DB_NAME = 'OceanTrackDB';
const STORE_NAME = 'production_data';
const DB_VERSION = 1;
const EMERGENCY_KEY = 'oceantrack_emergency_snapshot';

export class StorageService {
  private static db: IDBDatabase | null = null;

  static async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onerror = () => reject('Error opening IndexedDB');
    });
  }

  static async save(data: DercEntry[]): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(data, 'current_state');

      request.onsuccess = () => resolve();
      request.onerror = () => reject('Error saving to IndexedDB');
    });
  }

  static async load(): Promise<DercEntry[] | null> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get('current_state');

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject('Error loading from IndexedDB');
    });
  }

  /**
   * PROTOCOLO LÁZARO: Crea un snapshot en la memoria volátil de la sesión.
   */
  static createEmergencySnapshot(data: DercEntry[]) {
    const snapshot = {
      timestamp: new Date().toISOString(),
      data: data,
      count: data.length
    };
    sessionStorage.setItem(EMERGENCY_KEY, JSON.stringify(snapshot));
    return snapshot.timestamp;
  }

  static getEmergencySnapshot(): { timestamp: string, data: DercEntry[], count: number } | null {
    const raw = sessionStorage.getItem(EMERGENCY_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  static clearEmergencySnapshot() {
    sessionStorage.removeItem(EMERGENCY_KEY);
  }

  /**
   * Genera un archivo de respaldo (Snapshot) descargable.
   */
  static exportData(data: DercEntry[]) {
    const backup = {
      version: '1.2.0',
      timestamp: new Date().toISOString(),
      data: data
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OCEANTRACK_BACKUP_${new Date().toISOString().slice(0,10)}.otrk`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Valida e importa un archivo de respaldo externo.
   */
  static async importData(file: File): Promise<DercEntry[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = JSON.parse(e.target?.result as string);
          if (content && content.data && Array.isArray(content.data)) {
            resolve(content.data);
          } else {
            reject('Formato de respaldo no válido');
          }
        } catch (err) {
          reject('Error al leer el archivo de respaldo');
        }
      };
      reader.readAsText(file);
    });
  }
}
