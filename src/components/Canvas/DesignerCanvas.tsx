import { useRef, useCallback, useState, useEffect } from 'react';
import { Stage, Layer, Line, Circle as KonvaCircle } from 'react-konva';
import type Konva from 'konva';
import { useDesignerStore } from '../../store/useDesignerStore';
import { BackgroundImage } from './BackgroundImage';
import { CalibrationLine } from './CalibrationLine';
import { CanvasItem } from './CanvasItem';
import { SelectionTransformer } from './SelectionTransformer';

const MIN_SCALE = 0.05;
const MAX_SCALE = 10;

export function DesignerCanvas() {
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  const {
    mode,
    items,
    imageDataUrl,
    setSelectedId,
    setCalibrationPoint,
    addItem,
    placingType,
    drawingPolygonPoints,
    addPolygonPoint,
    finishPolygon,
  } = useDesignerStore();

  // Resize observer
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Convert pointer to stage coords
  const getStagePointer = useCallback((): { x: number; y: number } | null => {
    const stage = stageRef.current;
    if (!stage) return null;
    const pointer = stage.getPointerPosition();
    if (!pointer) return null;
    const transform = stage.getAbsoluteTransform().copy().invert();
    return transform.point(pointer);
  }, []);

  // Zoom
  const onWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const direction = e.evt.deltaY < 0 ? 1 : -1;
    const factor = 1.08;
    const newScale = direction > 0 ? oldScale * factor : oldScale / factor;
    const clampedScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    stage.scale({ x: clampedScale, y: clampedScale });
    stage.position({
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    });
  }, []);

  // Check if a screen-space point is near the first polygon point (15px threshold)
  const isNearFirstPoint = useCallback(
    (stagePos: { x: number; y: number }): boolean => {
      if (drawingPolygonPoints.length === 0) return false;
      const stage = stageRef.current;
      if (!stage) return false;
      const scale = stage.scaleX();
      const first = drawingPolygonPoints[0];
      const dist = Math.hypot(
        (stagePos.x - first.x) * scale,
        (stagePos.y - first.y) * scale,
      );
      return dist < 15;
    },
    [drawingPolygonPoints],
  );

  // Stage click
  const onStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      const pos = getStagePointer();
      if (!pos) return;

      if (mode === 'calibrate') {
        setCalibrationPoint(pos);
        return;
      }

      if (mode === 'place' && placingType) {
        addItem(placingType, pos.x, pos.y);
        return;
      }

      if (mode === 'draw-polygon') {
        // Close polygon if clicking near first point (and have >= 3 points)
        if (drawingPolygonPoints.length >= 3 && isNearFirstPoint(pos)) {
          finishPolygon();
        } else {
          addPolygonPoint(pos);
        }
        return;
      }

      // Select mode - clicking empty space deselects
      if (e.target === stageRef.current) {
        setSelectedId(null);
      }
    },
    [mode, placingType, drawingPolygonPoints, getStagePointer, setCalibrationPoint, addItem, setSelectedId, addPolygonPoint, finishPolygon, isNearFirstPoint],
  );

  // Double-click to close polygon
  const onStageDblClick = useCallback(
    (_e: Konva.KonvaEventObject<MouseEvent>) => {
      if (mode !== 'draw-polygon') return;
      const pos = getStagePointer();
      if (!pos) return;
      // Add the point from the double-click, then finish
      addPolygonPoint(pos);
      // Use setTimeout to ensure state updates, then finish
      setTimeout(() => useDesignerStore.getState().finishPolygon(), 0);
    },
    [mode, getStagePointer, addPolygonPoint],
  );

  const cursorStyle =
    mode === 'calibrate' || mode === 'draw-polygon'
      ? 'crosshair'
      : mode === 'place'
        ? 'copy'
        : 'default';

  return (
    <div
      ref={containerRef}
      className="h-full w-full bg-gray-100 overflow-hidden"
      style={{ cursor: cursorStyle }}
    >
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        draggable={mode === 'select'}
        onWheel={onWheel}
        onClick={onStageClick}
        onTap={onStageClick}
        onDblClick={onStageDblClick}
      >
        <Layer>
          <BackgroundImage />
          <CalibrationLine />
          {items.map((item) => (
            <CanvasItem key={item.id} item={item} />
          ))}
          <SelectionTransformer stageRef={stageRef} />
          {/* In-progress polygon preview */}
          {mode === 'draw-polygon' && drawingPolygonPoints.length > 0 && (
            <>
              <Line
                points={drawingPolygonPoints.flatMap((p) => [p.x, p.y])}
                stroke="#3b82f6"
                strokeWidth={2}
                dash={[6, 4]}
                listening={false}
              />
              {drawingPolygonPoints.map((p, i) => (
                <KonvaCircle
                  key={i}
                  x={p.x}
                  y={p.y}
                  radius={4}
                  fill={i === 0 ? '#ef4444' : '#3b82f6'}
                  stroke="#fff"
                  strokeWidth={1}
                  listening={false}
                />
              ))}
            </>
          )}
        </Layer>
      </Stage>

      {!imageDataUrl && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-gray-400 text-lg">Upload a property image to get started</p>
        </div>
      )}
    </div>
  );
}
