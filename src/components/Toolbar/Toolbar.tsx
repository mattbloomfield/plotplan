import { useRef } from 'react';
import { useDesignerStore } from '../../store/useDesignerStore';
import { exportProject, importProject } from '../../utils/storage';

export function Toolbar() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { undo, redo, save, load, getProjectData, loadProjectData, history, historyIndex } =
    useDesignerStore();

  const canUndo = historyIndex >= 0;
  const canRedo = historyIndex + 2 < history.length;

  const handleExport = () => exportProject(getProjectData());

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await importProject(file);
      loadProjectData(data);
    } catch (err) {
      alert('Failed to import: invalid file');
    }
    e.target.value = '';
  };

  const btnClass =
    'px-3 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors';

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-gray-200">
      <h1 className="text-sm font-bold text-gray-800 mr-4">Property Layout Designer</h1>

      <button onClick={undo} disabled={!canUndo} className={btnClass} title="Undo (Ctrl+Z)">
        Undo
      </button>
      <button onClick={redo} disabled={!canRedo} className={btnClass} title="Redo (Ctrl+Shift+Z)">
        Redo
      </button>

      <div className="w-px h-6 bg-gray-200 mx-1" />

      <button onClick={save} className={btnClass}>
        Save
      </button>
      <button onClick={load} className={btnClass}>
        Load
      </button>

      <div className="w-px h-6 bg-gray-200 mx-1" />

      <button onClick={handleExport} className={btnClass}>
        Export JSON
      </button>
      <button onClick={() => fileInputRef.current?.click()} className={btnClass}>
        Import JSON
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleImport}
      />
    </div>
  );
}
