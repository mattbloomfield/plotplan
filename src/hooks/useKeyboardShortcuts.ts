import { useEffect } from 'react';
import { useDesignerStore } from '../store/useDesignerStore';

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      const { undo, redo, selectedId, deleteItem, setSelectedId, setMode, copySelected, pasteClipboard, duplicateSelected, save, mode, cancelPolygon } =
        useDesignerStore.getState();
      const mod = e.metaKey || e.ctrlKey;

      if (mod && e.key === 's') {
        e.preventDefault();
        save();
      } else if (mod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (mod && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
      } else if (mod && e.key === 'c' && selectedId) {
        e.preventDefault();
        copySelected();
      } else if (mod && e.key === 'v') {
        e.preventDefault();
        pasteClipboard();
      } else if (mod && e.key === 'd' && selectedId) {
        e.preventDefault();
        duplicateSelected();
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault();
        deleteItem(selectedId);
      } else if (e.key === 'Escape') {
        if (mode === 'draw-polygon') {
          cancelPolygon();
        } else {
          setSelectedId(null);
          setMode('select');
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}
