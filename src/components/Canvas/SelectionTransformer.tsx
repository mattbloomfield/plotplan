import { useEffect, useRef } from 'react';
import { Transformer } from 'react-konva';
import type Konva from 'konva';
import { useDesignerStore } from '../../store/useDesignerStore';
import { pixelsToFeet } from '../../utils/scale';

interface Props {
  stageRef: React.RefObject<Konva.Stage | null>;
}

export function SelectionTransformer({ stageRef }: Props) {
  const trRef = useRef<Konva.Transformer>(null);
  const { selectedId, pixelsPerFoot, updateItem, pushHistory, items } = useDesignerStore();
  const selectedItem = items.find((i) => i.id === selectedId);
  const isPolygon = selectedItem?.shape === 'polygon';

  useEffect(() => {
    const tr = trRef.current;
    const stage = stageRef.current;
    if (!tr || !stage) return;

    if (selectedId) {
      const node = stage.findOne(`#${selectedId}`);
      if (node) {
        tr.nodes([node]);
        tr.getLayer()?.batchDraw();
        return;
      }
    }
    tr.nodes([]);
    tr.getLayer()?.batchDraw();
  }, [selectedId, stageRef]);

  if (!pixelsPerFoot) return null;

  return (
    <Transformer
      ref={trRef}
      rotateEnabled
      resizeEnabled={!isPolygon}
      enabledAnchors={isPolygon ? [] : [
        'top-left',
        'top-right',
        'bottom-left',
        'bottom-right',
        'middle-left',
        'middle-right',
        'top-center',
        'bottom-center',
      ]}
      boundBoxFunc={(_, newBox) => {
        if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
          return _;
        }
        return newBox;
      }}
      onTransformStart={() => pushHistory()}
      onTransformEnd={() => {
        const tr = trRef.current;
        if (!tr) return;
        const node = tr.nodes()[0];
        if (!node || !pixelsPerFoot) return;

        const group = node as Konva.Group;
        const scaleX = group.scaleX();
        const scaleY = group.scaleY();

        // Find the item to get its current pixel dimensions
        const item = useDesignerStore.getState().items.find((i) => i.id === selectedId);
        if (!item) return;

        const currentWidthPx = item.widthFt * pixelsPerFoot;
        const currentHeightPx = item.heightFt * pixelsPerFoot;

        const newWidthPx = currentWidthPx * Math.abs(scaleX);
        const newHeightPx = currentHeightPx * Math.abs(scaleY);

        group.scaleX(1);
        group.scaleY(1);

        updateItem(item.id, {
          x: group.x(),
          y: group.y(),
          widthFt: Math.round(pixelsToFeet(newWidthPx, pixelsPerFoot) * 10) / 10,
          heightFt: Math.round(pixelsToFeet(newHeightPx, pixelsPerFoot) * 10) / 10,
          rotation: group.rotation(),
        });
      }}
    />
  );
}
