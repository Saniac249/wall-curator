export type RectBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function rectsOverlap(a: RectBounds, b: RectBounds) {
  return !(
    a.x + a.width <= b.x ||
    b.x + b.width <= a.x ||
    a.y + a.height <= b.y ||
    b.y + b.height <= a.y
  );
}

export function getRectCenter(rect: RectBounds) {
  return {
    x: rect.x + rect.width / 2,

    y: rect.y + rect.height / 2,
  };
}
