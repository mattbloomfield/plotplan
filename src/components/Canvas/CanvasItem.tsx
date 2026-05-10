import { useRef } from 'react';
import { Circle, Rect, Group, Text, Line } from 'react-konva';
import type Konva from 'konva';
import type { LayoutItem } from '../../types';
import { feetToPixels } from '../../utils/scale';
import { useDesignerStore } from '../../store/useDesignerStore';

interface Props {
  item: LayoutItem;
}

export function CanvasItem({ item }: Props) {
  const nodeRef = useRef<Konva.Group>(null);
  const lineRef = useRef<Konva.Line>(null);
  const { pixelsPerFoot, selectedId, setSelectedId, updateItem, mode, pushHistory } =
    useDesignerStore();

  if (!pixelsPerFoot) return null;

  const widthPx = feetToPixels(item.widthFt, pixelsPerFoot);
  const heightPx = feetToPixels(item.heightFt, pixelsPerFoot);
  const isSelected = selectedId === item.id;
  const isCircle = item.shape === 'circle';
  const isPolygon = item.shape === 'polygon';
  const radiusPx = widthPx / 2;

  // Auto-size text to fit within the shape
  let availW: number;
  let availH: number;
  if (isPolygon && item.points) {
    // Use 60% of polygon bounding box for label
    const xs = item.points.map((p) => p.x);
    const ys = item.points.map((p) => p.y);
    const bboxW = Math.max(...xs) - Math.min(...xs);
    const bboxH = Math.max(...ys) - Math.min(...ys);
    availW = bboxW * 0.6;
    availH = bboxH * 0.6;
  } else if (isCircle) {
    availW = widthPx * 0.7;
    availH = heightPx * 0.7;
  } else {
    const padding = 0.2;
    availW = widthPx * (1 - padding);
    availH = heightPx * (1 - padding);
  }
  const charWidthRatio = 0.6;
  const maxByWidth = availW / (item.label.length * charWidthRatio);
  const maxByHeight = availH;
  const fontSize = Math.max(6, Math.min(maxByWidth, maxByHeight, 48));

  return (
    <Group
      ref={nodeRef}
      id={item.id}
      x={item.x}
      y={item.y}
      rotation={item.rotation}
      draggable={mode === 'select'}
      onClick={(e) => {
        e.cancelBubble = true;
        setSelectedId(item.id);
      }}
      onTap={(e) => {
        e.cancelBubble = true;
        setSelectedId(item.id);
      }}
      onDragStart={() => pushHistory()}
      onDragEnd={(e) => {
        updateItem(item.id, {
          x: e.target.x(),
          y: e.target.y(),
        });
      }}
    >
      {isPolygon && item.points ? (
        <Line
          ref={lineRef}
          points={item.points.flatMap((p) => [p.x, p.y])}
          closed
          fill={item.color}
          opacity={0.8}
          stroke={isSelected ? '#3b82f6' : '#000'}
          strokeWidth={isSelected ? 2 : 1}
        />
      ) : isCircle ? (
        <Circle
          radius={radiusPx}
          fill={item.color}
          opacity={0.8}
          stroke={isSelected ? '#3b82f6' : '#000'}
          strokeWidth={isSelected ? 2 : 1}
        />
      ) : (
        <Rect
          x={-widthPx / 2}
          y={-heightPx / 2}
          width={widthPx}
          height={heightPx}
          fill={item.color}
          opacity={0.8}
          stroke={isSelected ? '#3b82f6' : '#000'}
          strokeWidth={isSelected ? 2 : 1}
        />
      )}
      {item.showLabel !== false && (
        <Text
          text={item.label}
          fontSize={fontSize}
          fill="#fff"
          fontStyle="bold"
          align="center"
          verticalAlign="middle"
          x={-availW / 2}
          y={-fontSize / 2}
          width={availW}
          listening={false}
          shadowColor="#000"
          shadowBlur={2}
          shadowOpacity={0.6}
        />
      )}
      {/* Draggable vertex handles for selected polygons */}
      {isPolygon && isSelected && item.points && item.points.map((p, i) => (
        <Circle
          key={`handle-${i}`}
          x={p.x}
          y={p.y}
          radius={5}
          fill="#3b82f6"
          stroke="#fff"
          strokeWidth={1.5}
          draggable
          onMouseEnter={(e) => {
            const stage = e.target.getStage();
            if (stage) stage.container().style.cursor = 'move';
          }}
          onMouseLeave={(e) => {
            const stage = e.target.getStage();
            if (stage) stage.container().style.cursor = '';
          }}
          onDragStart={(e) => {
            e.cancelBubble = true;
          }}
          onDragMove={(e) => {
            e.cancelBubble = true;
            // Update the Line visually during drag
            if (lineRef.current && item.points) {
              const updated = item.points.flatMap((pt, idx) =>
                idx === i ? [e.target.x(), e.target.y()] : [pt.x, pt.y]
              );
              lineRef.current.points(updated);
            }
          }}
          onDragEnd={(e) => {
            e.cancelBubble = true;
            const newPoints = item.points!.map((pt, idx) =>
              idx === i ? { x: e.target.x(), y: e.target.y() } : pt
            );
            const xs = newPoints.map((pt) => pt.x);
            const ys = newPoints.map((pt) => pt.y);
            const bboxW = Math.max(...xs) - Math.min(...xs);
            const bboxH = Math.max(...ys) - Math.min(...ys);
            const ppf = pixelsPerFoot || 1;
            updateItem(item.id, {
              points: newPoints,
              widthFt: Math.max(Math.round((bboxW / ppf) * 10) / 10, 0.5),
              heightFt: Math.max(Math.round((bboxH / ppf) * 10) / 10, 0.5),
            });
          }}
        />
      ))}
    </Group>
  );
}
