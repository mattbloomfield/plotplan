import { useDesignerStore } from '../../store/useDesignerStore';
import { ITEM_DEFINITIONS } from '../../utils/itemDefaults';

export function ItemPalette() {
  const { pixelsPerFoot, placingType, setPlacingType, mode, setMode } = useDesignerStore();

  if (!pixelsPerFoot) return null;

  const isDrawingPolygon = mode === 'draw-polygon';

  return (
    <div className="p-3 border-b border-gray-200">
      <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Place Items</h3>
      <div className="grid grid-cols-3 gap-1.5">
        {ITEM_DEFINITIONS.map((def) => {
          if (def.type === 'custom') {
            // Custom uses draw-polygon mode instead of place mode
            return (
              <button
                key={def.type}
                onClick={() => {
                  if (isDrawingPolygon) {
                    setMode('select');
                  } else {
                    setPlacingType(null);
                    setMode('draw-polygon');
                  }
                }}
                className={`flex flex-col items-center p-1.5 rounded text-xs border transition-colors ${
                  isDrawingPolygon
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <span
                  className="w-5 h-5 mb-0.5 rounded-sm"
                  style={{ backgroundColor: def.color }}
                />
                <span className="leading-tight">{def.label}</span>
              </button>
            );
          }
          return (
            <button
              key={def.type}
              onClick={() => setPlacingType(placingType === def.type ? null : def.type)}
              className={`flex flex-col items-center p-1.5 rounded text-xs border transition-colors ${
                placingType === def.type
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <span
                className={`w-5 h-5 mb-0.5 ${def.shape === 'circle' ? 'rounded-full' : 'rounded-sm'}`}
                style={{ backgroundColor: def.color }}
              />
              <span className="leading-tight">{def.label}</span>
            </button>
          );
        })}
      </div>
      {placingType && (
        <p className="text-xs text-blue-600 mt-2">Click on the canvas to place</p>
      )}
      {isDrawingPolygon && (
        <p className="text-xs text-blue-600 mt-2">
          Click to add points. Double-click or click near the first point to close.
        </p>
      )}
    </div>
  );
}
