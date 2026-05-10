import { useEffect, useState } from 'react';
import { Image as KonvaImage } from 'react-konva';
import { useDesignerStore } from '../../store/useDesignerStore';

export function BackgroundImage() {
  const { imageDataUrl, imageWidth, imageHeight } = useDesignerStore();
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!imageDataUrl) {
      setImage(null);
      return;
    }
    const img = new window.Image();
    img.src = imageDataUrl;
    img.onload = () => setImage(img);
  }, [imageDataUrl]);

  if (!image) return null;

  return (
    <KonvaImage
      image={image}
      width={imageWidth}
      height={imageHeight}
      listening={false}
    />
  );
}
