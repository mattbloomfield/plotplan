import { useEffect } from 'react';
import { Toolbar } from './components/Toolbar/Toolbar';
import { ImageUpload } from './components/Sidebar/ImageUpload';
import { ScaleCalibration } from './components/Sidebar/ScaleCalibration';
import { ItemPalette } from './components/Sidebar/ItemPalette';
import { ItemProperties } from './components/Sidebar/ItemProperties';
import { DesignerCanvas } from './components/Canvas/DesignerCanvas';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useDesignerStore } from './store/useDesignerStore';

export default function App() {
  useKeyboardShortcuts();

  useEffect(() => {
    useDesignerStore.getState().load();
  }, []);

  return (
    <div className="h-full flex flex-col">
      <Toolbar />
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <div className="w-56 flex-shrink-0 bg-white border-r border-gray-200 overflow-y-auto">
          <ImageUpload />
          <ScaleCalibration />
          <ItemPalette />
          <ItemProperties />
        </div>
        {/* Canvas */}
        <div className="flex-1 relative min-h-0">
          <DesignerCanvas />
        </div>
      </div>
    </div>
  );
}
