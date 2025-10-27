export interface Vector2 {
  x: number;
  y: number;
}

export const add = (a: Vector2, b: Vector2): Vector2 => ({
  x: a.x + b.x,
  y: a.y + b.y,
});

export const subtract = (a: Vector2, b: Vector2): Vector2 => ({
  x: a.x - b.x,
  y: a.y - b.y,
});

export const scale = (vector: Vector2, scalar: number): Vector2 => ({
  x: vector.x * scalar,
  y: vector.y * scalar,
});

export const translate = (vector: Vector2, delta: Vector2): Vector2 => ({
  x: vector.x + delta.x,
  y: vector.y + delta.y,
});

export const polarToCartesian = (radius: number, angle: number): Vector2 => ({
  x: radius * Math.cos(angle),
  y: radius * Math.sin(angle),
});

export const rotate = (vector: Vector2, radians: number): Vector2 => ({
  x: vector.x * Math.cos(radians) - vector.y * Math.sin(radians),
  y: vector.x * Math.sin(radians) + vector.y * Math.cos(radians),
});

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export const emptyBounds = (): Bounds => ({
  minX: Number.POSITIVE_INFINITY,
  minY: Number.POSITIVE_INFINITY,
  maxX: Number.NEGATIVE_INFINITY,
  maxY: Number.NEGATIVE_INFINITY,
});

export const expandBounds = (bounds: Bounds, point: Vector2): Bounds => ({
  minX: Math.min(bounds.minX, point.x),
  minY: Math.min(bounds.minY, point.y),
  maxX: Math.max(bounds.maxX, point.x),
  maxY: Math.max(bounds.maxY, point.y),
});

export const computeBounds = (polygons: Vector2[][]): Bounds => {
  if (polygons.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  }

  let bounds = emptyBounds();
  for (const polygon of polygons) {
    for (const vertex of polygon) {
      bounds = expandBounds(bounds, vertex);
    }
  }

  return bounds;
};

export const sizeOf = (bounds: Bounds): { width: number; height: number } => ({
  width: bounds.maxX - bounds.minX,
  height: bounds.maxY - bounds.minY,
});

export const centerPolygons = (polygons: Vector2[][]): Vector2[][] => {
  const bounds = computeBounds(polygons);
  const center = {
    x: (bounds.minX + bounds.maxX) / 2,
    y: (bounds.minY + bounds.maxY) / 2,
  };

  return polygons.map((polygon) => polygon.map((point) => translate(point, { x: -center.x, y: -center.y })));
};

export const transformPolygons = (
  polygons: Vector2[][],
  transform: (point: Vector2) => Vector2,
): Vector2[][] => polygons.map((polygon) => polygon.map((point) => transform(point)));
