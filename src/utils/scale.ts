export function feetToPixels(ft: number, pixelsPerFoot: number): number {
  return ft * pixelsPerFoot;
}

export function pixelsToFeet(px: number, pixelsPerFoot: number): number {
  return px / pixelsPerFoot;
}

export function computePixelsPerFoot(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  distanceFt: number,
): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const pixelDistance = Math.sqrt(dx * dx + dy * dy);
  return pixelDistance / distanceFt;
}
