export type PenroseShape = "thin" | "thick";

export interface Vector2 {
  x: number;
  y: number;
}

export interface PenroseTriangle {
  kind: PenroseShape;
  vertices: [Vector2, Vector2, Vector2];
}

const PHI = (Math.sqrt(5) + 1) / 2;

const polarToCartesian = (radius: number, angle: number): Vector2 => ({
  x: radius * Math.cos(angle),
  y: radius * Math.sin(angle),
});

const add = (a: Vector2, b: Vector2): Vector2 => ({ x: a.x + b.x, y: a.y + b.y });
const subtract = (a: Vector2, b: Vector2): Vector2 => ({ x: a.x - b.x, y: a.y - b.y });
const scale = (vector: Vector2, scalar: number): Vector2 => ({
  x: vector.x * scalar,
  y: vector.y * scalar,
});

export const generatePenroseTriangles = (divisions: number, base = 5): PenroseTriangle[] => {
  let triangles: PenroseTriangle[] = [];

  for (let i = 0; i < base * 2; i += 1) {
    let v2 = polarToCartesian(1, ((2 * i - 1) * Math.PI) / (base * 2));
    let v3 = polarToCartesian(1, ((2 * i + 1) * Math.PI) / (base * 2));

    if (i % 2 === 0) {
      [v2, v3] = [v3, v2];
    }

    triangles.push({
      kind: "thin",
      vertices: [
        { x: 0, y: 0 },
        v2,
        v3,
      ],
    });
  }

  for (let i = 0; i < divisions; i += 1) {
    const next: PenroseTriangle[] = [];

    for (const triangle of triangles) {
      const [v1, v2, v3] = triangle.vertices;

      if (triangle.kind === "thin") {
        const p1 = add(v1, scale(subtract(v2, v1), 1 / PHI));
        next.push(
          { kind: "thin", vertices: [v3, p1, v2] },
          { kind: "thick", vertices: [p1, v3, v1] },
        );
      } else {
        const p2 = add(v2, scale(subtract(v1, v2), 1 / PHI));
        const p3 = add(v2, scale(subtract(v3, v2), 1 / PHI));
        next.push(
          { kind: "thick", vertices: [p3, v3, v1] },
          { kind: "thick", vertices: [p2, p3, v2] },
          { kind: "thin", vertices: [p3, p2, v1] },
        );
      }
    }

    triangles = next;
  }

  return triangles;
};

export interface PenroseBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export const computeBounds = (triangles: PenroseTriangle[]): PenroseBounds => {
  if (triangles.length === 0) {
    return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
  }

  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const triangle of triangles) {
    for (const vertex of triangle.vertices) {
      minX = Math.min(minX, vertex.x);
      minY = Math.min(minY, vertex.y);
      maxX = Math.max(maxX, vertex.x);
      maxY = Math.max(maxY, vertex.y);
    }
  }

  return { minX, minY, maxX, maxY };
};

export interface ProjectionOptions {
  width: number;
  height: number;
  zoom: "in" | "out";
}

export interface ProjectedTriangle {
  kind: PenroseShape;
  points: [Vector2, Vector2, Vector2];
}

export interface ProjectionResult {
  triangles: ProjectedTriangle[];
  scale: number;
}

export const projectTriangles = (
  triangles: PenroseTriangle[],
  { width, height, zoom }: ProjectionOptions,
): ProjectionResult => {
  if (width <= 0 || height <= 0) {
    return { triangles: [], scale: 1 };
  }

  const bounds = computeBounds(triangles);
  const worldWidth = bounds.maxX - bounds.minX || 1;
  const worldHeight = bounds.maxY - bounds.minY || 1;
  const zoomFactor = zoom === "in" ? 1 : 2;

  const baseScale = Math.min(width / worldWidth, height / worldHeight);
  const scaleFactor = baseScale / zoomFactor;

  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerY = (bounds.minY + bounds.maxY) / 2;
  const offsetX = width / 2 - centerX * scaleFactor;
  const offsetY = height / 2 - centerY * scaleFactor;

  const projectPoint = (vector: Vector2): Vector2 => ({
    x: vector.x * scaleFactor + offsetX,
    y: vector.y * scaleFactor + offsetY,
  });

  return {
    triangles: triangles.map(({ kind, vertices }) => ({
      kind,
      points: [projectPoint(vertices[0]), projectPoint(vertices[1]), projectPoint(vertices[2])],
    })),
    scale: scaleFactor,
  };
};

export interface RenderPenroseOptions {
  divisions: number;
  width: number;
  height: number;
  zoom: "in" | "out";
  colors: {
    thin: string;
    thick: string;
    outline: string;
    background?: string;
  };
}

export const renderPenrose = (
  canvas: HTMLCanvasElement,
  options: RenderPenroseOptions,
): void => {
  const { divisions, width, height, zoom, colors } = options;

  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }

  context.save();
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, width, height);
  context.restore();

  if (colors.background) {
    context.save();
    context.fillStyle = colors.background;
    context.fillRect(0, 0, width, height);
    context.restore();
  }

  const triangles = generatePenroseTriangles(Math.max(divisions, 0));
  const { triangles: projected, scale } = projectTriangles(triangles, { width, height, zoom });

  const drawSet = (kind: PenroseShape, fillStyle: string) => {
    context.fillStyle = fillStyle;
    for (const triangle of projected) {
      if (triangle.kind !== kind) continue;
      const [p1, p2, p3] = triangle.points;
      context.beginPath();
      context.moveTo(p1.x, p1.y);
      context.lineTo(p2.x, p2.y);
      context.lineTo(p3.x, p3.y);
      context.closePath();
      context.fill();
    }
  };

  drawSet("thin", colors.thin);
  drawSet("thick", colors.thick);

  const normalizedDivisions = Math.max(divisions, 1);
  const baseOutline =
    normalizedDivisions > 3
      ? normalizedDivisions ** -3
      : normalizedDivisions ** -5;
  const outlineWidth = Math.max(baseOutline * scale, 0.25);

  context.lineJoin = "round";
  context.strokeStyle = colors.outline;
  context.lineWidth = outlineWidth;

  for (const triangle of projected) {
    const [p1, p2, p3] = triangle.points;
    context.beginPath();
    context.moveTo(p2.x, p2.y);
    context.lineTo(p1.x, p1.y);
    context.lineTo(p3.x, p3.y);
    context.closePath();
    context.stroke();
  }
};
