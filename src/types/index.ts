export type InteractionMode = 'select' | 'calibrate' | 'place' | 'draw-polygon';

export type ItemType =
  | 'tree'
  | 'shrub'
  | 'fire-pit'
  | 'trampoline'
  | 'garden-bed'
  | 'shed'
  | 'fence'
  | 'playset'
  | 'custom';

export type ItemShape = 'circle' | 'rect' | 'polygon';

export interface ItemDefinition {
  type: ItemType;
  label: string;
  shape: ItemShape;
  widthFt: number;
  heightFt: number;
  color: string;
}

export interface LayoutItem {
  id: string;
  type: ItemType;
  label: string;
  shape: ItemShape;
  x: number; // stage coords (pixels)
  y: number;
  widthFt: number;
  heightFt: number;
  rotation: number; // degrees
  color: string;
  showLabel: boolean;
  points?: Array<{ x: number; y: number }>; // polygon vertices relative to item center
}

export interface CalibrationState {
  point1: { x: number; y: number } | null;
  point2: { x: number; y: number } | null;
  distanceFt: number | null;
}

export interface ProjectData {
  imageDataUrl: string | null;
  imageWidth: number;
  imageHeight: number;
  pixelsPerFoot: number | null;
  calibration: CalibrationState;
  items: LayoutItem[];
}
