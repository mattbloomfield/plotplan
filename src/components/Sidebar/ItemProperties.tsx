import { useDesignerStore } from '../../store/useDesignerStore';

export function ItemProperties() {
  const { items, selectedId, updateItem, deleteItem } = useDesignerStore();
  const item = items.find((i) => i.id === selectedId);

  if (!item) return null;

  const update = (changes: Record<string, unknown>) => updateItem(item.id, changes);

  return (
    <div className="p-3 border-b border-gray-200">
      <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Properties</h3>
      <div className="space-y-2 text-sm">
        <label className="block">
          <span className="text-gray-600 text-xs">Label</span>
          <input
            type="text"
            value={item.label}
            onChange={(e) => update({ label: e.target.value })}
            className="w-full px-2 py-1 border rounded text-sm mt-0.5"
          />
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={item.showLabel !== false}
            onChange={(e) => update({ showLabel: e.target.checked })}
            className="rounded"
          />
          <span className="text-gray-600 text-xs">Show label</span>
        </label>

        {item.shape !== 'polygon' && (
          <div className="flex gap-2">
            <label className="flex-1 block">
              <span className="text-gray-600 text-xs">Width (ft)</span>
              <input
                type="number"
                value={item.widthFt}
                min={0.5}
                step={0.5}
                onChange={(e) => update({ widthFt: parseFloat(e.target.value) || 1 })}
                className="w-full px-2 py-1 border rounded text-sm mt-0.5"
              />
            </label>
            <label className="flex-1 block">
              <span className="text-gray-600 text-xs">
                {item.shape === 'circle' ? 'Diameter (ft)' : 'Height (ft)'}
              </span>
              <input
                type="number"
                value={item.heightFt}
                min={0.5}
                step={0.5}
                onChange={(e) => update({ heightFt: parseFloat(e.target.value) || 1 })}
                className="w-full px-2 py-1 border rounded text-sm mt-0.5"
              />
            </label>
          </div>
        )}

        <label className="block">
          <span className="text-gray-600 text-xs">Color</span>
          <input
            type="color"
            value={item.color}
            onChange={(e) => update({ color: e.target.value })}
            className="w-full h-8 mt-0.5 cursor-pointer"
          />
        </label>

        <label className="block">
          <span className="text-gray-600 text-xs">Rotation ({item.rotation.toFixed(0)}°)</span>
          <input
            type="range"
            min={0}
            max={360}
            value={item.rotation}
            onChange={(e) => update({ rotation: parseFloat(e.target.value) })}
            className="w-full mt-0.5"
          />
        </label>

        <button
          onClick={() => deleteItem(item.id)}
          className="w-full px-2 py-1 bg-red-50 text-red-600 text-xs rounded border border-red-200 hover:bg-red-100"
        >
          Delete Item
        </button>
      </div>
    </div>
  );
}
