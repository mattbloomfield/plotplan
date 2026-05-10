import type { ItemDefinition } from '../types';

export const ITEM_DEFINITIONS: ItemDefinition[] = [
  { type: 'tree', label: 'Tree', shape: 'circle', widthFt: 8, heightFt: 8, color: '#228B22' },
  { type: 'shrub', label: 'Shrub', shape: 'circle', widthFt: 3, heightFt: 3, color: '#32CD32' },
  { type: 'fire-pit', label: 'Fire Pit', shape: 'circle', widthFt: 4, heightFt: 4, color: '#8B4513' },
  { type: 'trampoline', label: 'Trampoline', shape: 'circle', widthFt: 14, heightFt: 14, color: '#4169E1' },
  { type: 'garden-bed', label: 'Garden Bed', shape: 'rect', widthFt: 10, heightFt: 4, color: '#8B6914' },
  { type: 'shed', label: 'Shed', shape: 'rect', widthFt: 10, heightFt: 12, color: '#A0522D' },
  { type: 'fence', label: 'Fence', shape: 'rect', widthFt: 20, heightFt: 0.5, color: '#DEB887' },
  { type: 'playset', label: 'Playset', shape: 'rect', widthFt: 12, heightFt: 12, color: '#DAA520' },
  { type: 'custom', label: 'Custom', shape: 'rect', widthFt: 5, heightFt: 5, color: '#808080' },
];

export function getDefinition(type: string): ItemDefinition {
  return ITEM_DEFINITIONS.find((d) => d.type === type) ?? ITEM_DEFINITIONS[ITEM_DEFINITIONS.length - 1];
}
