import { Circle, Line } from 'react-konva';
import { useDesignerStore } from '../../store/useDesignerStore';

const DOT_RADIUS = 6;

export function CalibrationLine() {
  const { calibration, mode } = useDesignerStore();
  const { point1, point2 } = calibration;

  if (mode !== 'calibrate' && !point1) return null;

  return (
    <>
      {point1 && (
        <Circle x={point1.x} y={point1.y} radius={DOT_RADIUS} fill="#ef4444" />
      )}
      {point2 && (
        <Circle x={point2.x} y={point2.y} radius={DOT_RADIUS} fill="#ef4444" />
      )}
      {point1 && point2 && (
        <Line
          points={[point1.x, point1.y, point2.x, point2.y]}
          stroke="#ef4444"
          strokeWidth={2}
          dash={[6, 4]}
        />
      )}
    </>
  );
}
