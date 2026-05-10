import { useState } from 'react';
import { useDesignerStore } from '../../store/useDesignerStore';

export function ScaleCalibration() {
  const { calibration, pixelsPerFoot, setCalibrationDistance, resetCalibration, setMode, mode, imageDataUrl } =
    useDesignerStore();
  const [inputVal, setInputVal] = useState('');

  if (!imageDataUrl) return null;

  const isCalibrating = mode === 'calibrate';
  const hasPoint1 = !!calibration.point1;
  const hasPoint2 = !!calibration.point2;

  const handleSetDistance = () => {
    const ft = parseFloat(inputVal);
    if (ft > 0) {
      setCalibrationDistance(ft);
      setMode('select');
    }
  };

  return (
    <div className="p-3 border-b border-gray-200">
      <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Scale Calibration</h3>

      {pixelsPerFoot ? (
        <div className="space-y-2">
          <p className="text-sm text-green-700">
            Scale: {pixelsPerFoot.toFixed(1)} px/ft
          </p>
          <button
            onClick={resetCalibration}
            className="text-xs text-red-600 hover:underline"
          >
            Recalibrate
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {!isCalibrating ? (
            <button
              onClick={() => setMode('calibrate')}
              className="w-full px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Start Calibration
            </button>
          ) : (
            <>
              <p className="text-xs text-gray-600">
                {!hasPoint1
                  ? 'Click the first point on the image'
                  : !hasPoint2
                    ? 'Click the second point'
                    : 'Enter the real-world distance'}
              </p>
              {hasPoint1 && hasPoint2 && (
                <div className="flex gap-1">
                  <input
                    type="number"
                    placeholder="Distance (ft)"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSetDistance()}
                    className="flex-1 px-2 py-1 border rounded text-sm"
                    autoFocus
                  />
                  <button
                    onClick={handleSetDistance}
                    className="px-2 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Set
                  </button>
                </div>
              )}
              <button
                onClick={() => {
                  resetCalibration();
                  setMode('select');
                }}
                className="text-xs text-gray-500 hover:underline"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
