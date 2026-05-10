import { useCallback } from 'react';
import { useDesignerStore } from '../../store/useDesignerStore';

export function ImageUpload() {
  const { imageDataUrl, setImage } = useDesignerStore();

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => setImage(reader.result as string, img.width, img.height);
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    },
    [setImage],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  return (
    <div className="p-3 border-b border-gray-200">
      <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Property Image</h3>
      {imageDataUrl ? (
        <div className="space-y-2">
          <img src={imageDataUrl} alt="Property" className="w-full rounded border border-gray-200" />
          <label className="block text-center text-xs text-blue-600 cursor-pointer hover:underline">
            Change image
            <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
          </label>
        </div>
      ) : (
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
        >
          <p className="text-sm text-gray-500 mb-2">Drop an image here</p>
          <label className="text-sm text-blue-600 cursor-pointer hover:underline">
            or browse files
            <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
          </label>
        </div>
      )}
    </div>
  );
}
