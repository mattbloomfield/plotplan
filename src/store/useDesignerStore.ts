import { create } from 'zustand';
import type { InteractionMode, LayoutItem, CalibrationState, ItemType, ProjectData } from '../types';
import { getDefinition } from '../utils/itemDefaults';
import { computePixelsPerFoot } from '../utils/scale';
import { saveProject, loadProject } from '../utils/storage';

interface DesignerState {
  // Image
  imageDataUrl: string | null;
  imageWidth: number;
  imageHeight: number;
  setImage: (dataUrl: string, width: number, height: number) => void;

  // Calibration & scale
  pixelsPerFoot: number | null;
  calibration: CalibrationState;
  setCalibrationPoint: (point: { x: number; y: number }) => void;
  setCalibrationDistance: (ft: number) => void;
  resetCalibration: () => void;

  // Items
  items: LayoutItem[];
  addItem: (type: ItemType, x: number, y: number) => void;
  updateItem: (id: string, changes: Partial<LayoutItem>) => void;
  deleteItem: (id: string) => void;

  // Selection & clipboard
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  clipboard: LayoutItem | null;
  copySelected: () => void;
  pasteClipboard: () => void;
  duplicateSelected: () => void;

  // Mode
  mode: InteractionMode;
  setMode: (mode: InteractionMode) => void;
  placingType: ItemType | null;
  setPlacingType: (type: ItemType | null) => void;

  // Polygon drawing
  drawingPolygonPoints: Array<{ x: number; y: number }>;
  addPolygonPoint: (point: { x: number; y: number }) => void;
  finishPolygon: () => void;
  cancelPolygon: () => void;

  // Undo / redo
  history: LayoutItem[][];
  historyIndex: number;
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;

  // Persistence
  save: () => Promise<void>;
  load: () => Promise<void>;
  getProjectData: () => ProjectData;
  loadProjectData: (data: ProjectData) => void;
}

const MAX_HISTORY = 50;

let idCounter = 0;
function nextId(): string {
  return `item-${Date.now()}-${idCounter++}`;
}

const initialCalibration: CalibrationState = {
  point1: null,
  point2: null,
  distanceFt: null,
};

export const useDesignerStore = create<DesignerState>((set, get) => ({
  imageDataUrl: null,
  imageWidth: 0,
  imageHeight: 0,
  setImage: (dataUrl, width, height) =>
    set({ imageDataUrl: dataUrl, imageWidth: width, imageHeight: height }),

  pixelsPerFoot: null,
  calibration: { ...initialCalibration },

  setCalibrationPoint: (point) => {
    const { calibration } = get();
    if (!calibration.point1) {
      set({ calibration: { ...calibration, point1: point } });
    } else if (!calibration.point2) {
      const updated = { ...calibration, point2: point };
      set({ calibration: updated });
      // Auto-compute if distance already entered
      if (updated.distanceFt && updated.point1) {
        const ppf = computePixelsPerFoot(updated.point1, point, updated.distanceFt);
        set({ pixelsPerFoot: ppf });
      }
    }
  },

  setCalibrationDistance: (ft) => {
    const { calibration } = get();
    const updated = { ...calibration, distanceFt: ft };
    set({ calibration: updated });
    if (updated.point1 && updated.point2) {
      const ppf = computePixelsPerFoot(updated.point1, updated.point2, ft);
      set({ pixelsPerFoot: ppf });
    }
  },

  resetCalibration: () =>
    set({ calibration: { ...initialCalibration }, pixelsPerFoot: null }),

  items: [],
  addItem: (type, x, y) => {
    const def = getDefinition(type);
    const item: LayoutItem = {
      id: nextId(),
      type,
      label: def.label,
      shape: def.shape,
      x,
      y,
      widthFt: def.widthFt,
      heightFt: def.heightFt,
      rotation: 0,
      color: def.color,
      showLabel: true,
    };
    const s = get();
    s.pushHistory();
    set({ items: [...s.items, item], selectedId: item.id });
  },

  updateItem: (id, changes) => {
    const s = get();
    s.pushHistory();
    set({ items: s.items.map((i) => (i.id === id ? { ...i, ...changes } : i)) });
  },

  deleteItem: (id) => {
    const s = get();
    s.pushHistory();
    set({
      items: s.items.filter((i) => i.id !== id),
      selectedId: s.selectedId === id ? null : s.selectedId,
    });
  },

  selectedId: null,
  setSelectedId: (id) => set({ selectedId: id }),

  clipboard: null,
  copySelected: () => {
    const { items, selectedId } = get();
    const item = items.find((i) => i.id === selectedId);
    if (item) set({ clipboard: { ...item } });
  },
  pasteClipboard: () => {
    const { clipboard } = get();
    if (!clipboard) return;
    const s = get();
    s.pushHistory();
    const newItem: LayoutItem = {
      ...clipboard,
      id: nextId(),
      x: clipboard.x + 20,
      y: clipboard.y + 20,
    };
    set({ items: [...s.items, newItem], selectedId: newItem.id, clipboard: { ...newItem } });
  },
  duplicateSelected: () => {
    const { items, selectedId } = get();
    const item = items.find((i) => i.id === selectedId);
    if (!item) return;
    const s = get();
    s.pushHistory();
    const newItem: LayoutItem = {
      ...item,
      id: nextId(),
      x: item.x + 20,
      y: item.y + 20,
    };
    set({ items: [...s.items, newItem], selectedId: newItem.id });
  },

  mode: 'select',
  setMode: (mode) => set({
    mode,
    placingType: mode === 'place' ? get().placingType : null,
    drawingPolygonPoints: mode === 'draw-polygon' ? get().drawingPolygonPoints : [],
  }),
  placingType: null,
  setPlacingType: (type) => set({ placingType: type, mode: type ? 'place' : 'select' }),

  drawingPolygonPoints: [],
  addPolygonPoint: (point) => {
    set({ drawingPolygonPoints: [...get().drawingPolygonPoints, point] });
  },
  finishPolygon: () => {
    const { drawingPolygonPoints, pixelsPerFoot, pushHistory, items } = get();
    // Need at least 3 points
    let pts = [...drawingPolygonPoints];
    if (pts.length < 3) return;

    // Deduplicate trailing point from double-click (within 5px)
    const last = pts[pts.length - 1];
    const secondLast = pts[pts.length - 2];
    if (last && secondLast) {
      const dist = Math.hypot(last.x - secondLast.x, last.y - secondLast.y);
      if (dist < 5) pts = pts.slice(0, -1);
    }
    if (pts.length < 3) return;

    // Compute centroid
    const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
    const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;

    // Convert to relative coords
    const relPoints = pts.map((p) => ({ x: p.x - cx, y: p.y - cy }));

    // Compute bounding box for widthFt/heightFt
    const xs = relPoints.map((p) => p.x);
    const ys = relPoints.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const bboxW = maxX - minX;
    const bboxH = maxY - minY;

    const ppf = pixelsPerFoot || 1;
    const widthFt = Math.round((bboxW / ppf) * 10) / 10;
    const heightFt = Math.round((bboxH / ppf) * 10) / 10;

    const item: LayoutItem = {
      id: nextId(),
      type: 'custom',
      label: 'Custom',
      shape: 'polygon',
      x: cx,
      y: cy,
      widthFt: Math.max(widthFt, 0.5),
      heightFt: Math.max(heightFt, 0.5),
      rotation: 0,
      color: '#808080',
      showLabel: true,
      points: relPoints,
    };

    pushHistory();
    set({
      items: [...items, item],
      selectedId: item.id,
      drawingPolygonPoints: [],
      mode: 'select',
    });
  },
  cancelPolygon: () => {
    set({ drawingPolygonPoints: [], mode: 'select' });
  },

  history: [],
  historyIndex: -1,

  pushHistory: () => {
    const { items, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(items.map((i) => ({ ...i })));
    if (newHistory.length > MAX_HISTORY) newHistory.shift();
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  },

  undo: () => {
    const { history, historyIndex, items } = get();
    if (historyIndex < 0) return;
    // If at latest, save current state so redo can restore it
    const newHistory = [...history];
    if (historyIndex === newHistory.length - 1) {
      newHistory.push(items.map((i) => ({ ...i })));
    }
    set({
      items: history[historyIndex].map((i) => ({ ...i })),
      history: newHistory,
      historyIndex: historyIndex - 1,
      selectedId: null,
    });
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex + 2 >= history.length) return;
    set({
      items: history[historyIndex + 2].map((i) => ({ ...i })),
      historyIndex: historyIndex + 1,
      selectedId: null,
    });
  },

  save: async () => {
    const data = get().getProjectData();
    await saveProject(data);
  },

  load: async () => {
    const data = await loadProject();
    if (data) get().loadProjectData(data);
  },

  getProjectData: () => {
    const s = get();
    return {
      imageDataUrl: s.imageDataUrl,
      imageWidth: s.imageWidth,
      imageHeight: s.imageHeight,
      pixelsPerFoot: s.pixelsPerFoot,
      calibration: s.calibration,
      items: s.items,
    };
  },

  loadProjectData: (data) =>
    set({
      imageDataUrl: data.imageDataUrl,
      imageWidth: data.imageWidth,
      imageHeight: data.imageHeight,
      pixelsPerFoot: data.pixelsPerFoot,
      calibration: data.calibration,
      items: data.items,
      selectedId: null,
      history: [],
      historyIndex: -1,
    }),
}));
