import type { ProjectData } from '../types';

const STORAGE_KEY = 'property-layout-designer';
const DB_NAME = 'property-layout-db';
const DB_STORE = 'images';
const DB_VERSION = 1;

// --- IndexedDB helpers for large image blobs ---

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(DB_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function storeImage(dataUrl: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, 'readwrite');
    tx.objectStore(DB_STORE).put(dataUrl, STORAGE_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function retrieveImage(): Promise<string | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, 'readonly');
    const req = tx.objectStore(DB_STORE).get(STORAGE_KEY);
    req.onsuccess = () => resolve((req.result as string) ?? null);
    req.onerror = () => reject(req.error);
  });
}

// --- Save / Load ---

type StoredProject = Omit<ProjectData, 'imageDataUrl'> & { hasImage: boolean };

export async function saveProject(data: ProjectData): Promise<void> {
  // Store image separately in IndexedDB (no size limit)
  if (data.imageDataUrl) {
    await storeImage(data.imageDataUrl);
  }
  const toStore: StoredProject = {
    imageWidth: data.imageWidth,
    imageHeight: data.imageHeight,
    pixelsPerFoot: data.pixelsPerFoot,
    calibration: data.calibration,
    items: data.items,
    hasImage: !!data.imageDataUrl,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
}

export async function loadProject(): Promise<ProjectData | null> {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const stored = JSON.parse(raw) as StoredProject;
    let imageDataUrl: string | null = null;
    if (stored.hasImage) {
      imageDataUrl = await retrieveImage();
    }
    return {
      imageDataUrl,
      imageWidth: stored.imageWidth,
      imageHeight: stored.imageHeight,
      pixelsPerFoot: stored.pixelsPerFoot,
      calibration: stored.calibration,
      items: stored.items,
    };
  } catch {
    return null;
  }
}

// --- Export / Import (JSON file, image included inline) ---

export function exportProject(data: ProjectData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'property-layout.json';
  a.click();
  URL.revokeObjectURL(url);
}

export function importProject(file: File): Promise<ProjectData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string) as ProjectData;
        resolve(data);
      } catch {
        reject(new Error('Invalid project file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
