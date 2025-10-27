import { Vector2, centerPolygons, computeBounds, rotate } from "./geometry";
import {
  generatePenrosePolygons,
  penroseOutlineFactor,
  PenrosePolygon,
} from "./penrose";

export interface TilingPolygon {
  role: string;
  points: Vector2[];
}

export type ColorRoleCategory = "fill" | "outline" | "background";

export interface ColorRole {
  id: string;
  label: string;
  default: string;
  category: ColorRoleCategory;
}

export interface SliderControl {
  type: "slider";
  key: string;
  label: string;
  min: number;
  max: number;
  step?: number;
  description?: string;
}

export interface SelectControl {
  type: "select";
  key: string;
  label: string;
  options: Array<{ value: string; label: string }>;
  description?: string;
}

export interface NumberControl {
  type: "number";
  key: string;
  label: string;
  min?: number;
  max?: number;
  step?: number;
  description?: string;
}

export type TilingControl = SliderControl | SelectControl | NumberControl;

export type TilingOptionValue = number | string;
export type TilingOptionsRecord = Record<string, TilingOptionValue>;

export interface TilingDefinition {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  options: {
    defaults: TilingOptionsRecord;
    controls: TilingControl[];
  };
  colorRoles: ColorRole[];
  /**
   * Generate polygons describing the tiling in a local coordinate system.
   */
  generate: (options: TilingOptionsRecord) => TilingPolygon[];
  /**
   * Optional multiplier applied after fit-to-canvas scaling.
   */
  scaleMultiplier?: (options: TilingOptionsRecord) => number;
  /**
   * Compute an outline width (in px) from the projected scale.
   */
  outlineWidth?: (scale: number, options: TilingOptionsRecord) => number;
}

const asTilingPolygons = (triangles: PenrosePolygon[]): TilingPolygon[] =>
  triangles.map((triangle) => ({
    role: triangle.role,
    points: [...triangle.points],
  }));

const recenter = (polygons: TilingPolygon[]): TilingPolygon[] => {
  const centered = centerPolygons(polygons.map((polygon) => polygon.points));
  return polygons.map((polygon, index) => ({
    ...polygon,
    points: centered[index],
  }));
};

const applyTransform = (
  polygons: TilingPolygon[],
  transform: (point: Vector2) => Vector2,
): TilingPolygon[] =>
  polygons.map((polygon) => ({
    ...polygon,
    points: polygon.points.map(transform),
  }));

const projectSquareToTriangle = (size: number): TilingPolygon[] => {
  const sqrtThreeOverTwo = Math.sqrt(3) / 2;
  const polygons: TilingPolygon[] = [];

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const p0 = { x, y };
      const p1 = { x: x + 1, y };
      const p2 = { x, y: y + 1 };
      const p3 = { x: x + 1, y: y + 1 };

      polygons.push({
        role: "up",
        points: [p0, p1, p2],
      });
      polygons.push({
        role: "down",
        points: [p1, p3, p2],
      });
    }
  }

  const sheared = applyTransform(polygons, (point) => ({
    x: point.x + 0.5 * point.y,
    y: point.y * sqrtThreeOverTwo,
  }));

  return sheared;
};

const generateTriangleTiling = (options: TriangularOptions): TilingPolygon[] => {
  const { density, rotation } = options;
  const polygons = projectSquareToTriangle(density);

  const centered = recenter(polygons);
  const rotated =
    rotation === 0
      ? centered
      : applyTransform(centered, (point) =>
          rotate(point, (rotation * Math.PI) / 180),
        );

  return rotated;
};

const generateSquareTiling = (options: SquareOptions): TilingPolygon[] => {
  const { density, rotation } = options;
  const polygons: TilingPolygon[] = [];

  for (let y = 0; y < density; y += 1) {
    for (let x = 0; x < density; x += 1) {
      const role = (x + y) % 2 === 0 ? "primary" : "secondary";
      polygons.push({
        role,
        points: [
          { x, y },
          { x: x + 1, y },
          { x: x + 1, y: y + 1 },
          { x, y: y + 1 },
        ],
      });
    }
  }

  const centered = recenter(polygons);
  const rotated =
    rotation === 0
      ? centered
      : applyTransform(centered, (point) =>
          rotate(point, (rotation * Math.PI) / 180),
        );

  return rotated;
};

const hexToCartesianPointy = (q: number, r: number): Vector2 => {
  const size = 1;
  const x = size * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r);
  const y = size * ((3 / 2) * r);
  return { x, y };
};

const hexToCartesianFlat = (q: number, r: number): Vector2 => {
  const size = 1;
  const x = size * ((3 / 2) * q);
  const y = size * (Math.sqrt(3) * r + (Math.sqrt(3) / 2) * q);
  return { x, y };
};

const generateHexagon = (
  center: Vector2,
  orientation: HexOrientation,
): Vector2[] => {
  const radius = 1;
  const points: Vector2[] = [];
  const offset = orientation === "pointy" ? -30 : 0;
  for (let i = 0; i < 6; i += 1) {
    const angle = ((60 * i + offset) * Math.PI) / 180;
    points.push({
      x: center.x + radius * Math.cos(angle),
      y: center.y + radius * Math.sin(angle),
    });
  }
  return points;
};

const generateHexTiling = (options: HexOptions): TilingPolygon[] => {
  const { rings, orientation, parity } = options;
  const polygons: TilingPolygon[] = [];

  for (let q = -rings; q <= rings; q += 1) {
    const rMin = Math.max(-rings, -q - rings);
    const rMax = Math.min(rings, -q + rings);
    for (let r = rMin; r <= rMax; r += 1) {
      const center =
        orientation === "pointy"
          ? hexToCartesianPointy(q, r)
          : hexToCartesianFlat(q, r);

      const roleIndex = (q + r) % 2 === 0 ? 0 : 1;
      const role = parity === "alternate" ? (roleIndex === 0 ? "primary" : "secondary") : "primary";
      polygons.push({
        role,
        points: generateHexagon(center, orientation),
      });
    }
  }

  return recenter(polygons);
};

export interface PenroseOptions {
  divisions: number;
  zoom: "in" | "out";
}

export interface TriangularOptions {
  density: number;
  rotation: number;
}

export interface SquareOptions {
  density: number;
  rotation: number;
}

export type HexOrientation = "pointy" | "flat";
export type HexParityMode = "solid" | "alternate";

export interface HexOptions {
  rings: number;
  orientation: HexOrientation;
  parity: HexParityMode;
}

export const TILINGS: ReadonlyArray<TilingDefinition> = [
  {
    id: "penrose",
    icon: "⭐️",
    name: "Penrose",
    tagline: "Aperiodic golden rhombi with infinite non-repetition.",
    options: {
      defaults: {
        divisions: 7,
        zoom: "in" as const,
      },
      controls: [
        {
          type: "slider",
          key: "divisions",
          label: "Subdivisions",
          min: 1,
          max: 10,
          step: 1,
          description: "Higher counts add depth, but take longer to draw.",
        },
        {
          type: "select",
          key: "zoom",
          label: "Framing",
          options: [
            { value: "in", label: "Fill Canvas" },
            { value: "out", label: "Show Decagon" },
          ],
          description:
            "Fill crops to the edges, show decagon leaves breathing room.",
        },
      ],
    },
    colorRoles: [
      { id: "thin", label: "Thin tiles", default: "#cc4c4c", category: "fill" },
      { id: "thick", label: "Thick tiles", default: "#3a70b8", category: "fill" },
      { id: "outline", label: "Outline", default: "#111827", category: "outline" },
      {
        id: "background",
        label: "Background",
        default: "#f8fafc",
        category: "background",
      },
    ],
    generate: (options) => {
      const penroseOptions = options as unknown as PenroseOptions;
      return asTilingPolygons(
        generatePenrosePolygons(penroseOptions.divisions),
      );
    },
    scaleMultiplier: (options) => {
      const penroseOptions = options as unknown as PenroseOptions;
      return penroseOptions.zoom === "in" ? 1 : 0.5;
    },
    outlineWidth: (scale, options) => {
      const penroseOptions = options as unknown as PenroseOptions;
      return Math.max(
        penroseOutlineFactor(penroseOptions.divisions) * scale,
        0.25,
      );
    },
  },
  {
    id: "triangular",
    icon: "🔺",
    name: "Triangular",
    tagline: "Regular tessellation of equilateral triangles.",
    options: {
      defaults: {
        density: 14,
        rotation: 0,
      },
      controls: [
        {
          type: "slider",
          key: "density",
          label: "Grid density",
          min: 6,
          max: 36,
          step: 1,
          description: "How many triangle pairs span the canvas.",
        },
        {
          type: "slider",
          key: "rotation",
          label: "Rotation",
          min: 0,
          max: 60,
          step: 1,
          description: "Rotate the lattice in degrees.",
        },
      ],
    },
    colorRoles: [
      { id: "up", label: "Up triangles", default: "#f97316", category: "fill" },
      { id: "down", label: "Down triangles", default: "#0ea5e9", category: "fill" },
      { id: "outline", label: "Outline", default: "#020617", category: "outline" },
      {
        id: "background",
        label: "Background",
        default: "#f8fafc",
        category: "background",
      },
    ],
    generate: (options) =>
      generateTriangleTiling(options as unknown as TriangularOptions),
    outlineWidth: (scale) => Math.max(scale * 0.015, 0.4),
  },
  {
    id: "square",
    icon: "🟥",
    name: "Checkerboard",
    tagline: "Axis-aligned square tiling with alternating colors.",
    options: {
      defaults: {
        density: 12,
        rotation: 0,
      },
      controls: [
        {
          type: "slider",
          key: "density",
          label: "Grid density",
          min: 4,
          max: 40,
          step: 1,
          description: "Number of squares along each axis.",
        },
        {
          type: "slider",
          key: "rotation",
          label: "Rotation",
          min: 0,
          max: 45,
          step: 1,
          description: "Tilt the tiling to create diamond patterns.",
        },
      ],
    },
    colorRoles: [
      { id: "primary", label: "Primary squares", default: "#10b981", category: "fill" },
      {
        id: "secondary",
        label: "Alternate squares",
        default: "#047857",
        category: "fill",
      },
      { id: "outline", label: "Outline", default: "#0f172a", category: "outline" },
      {
        id: "background",
        label: "Background",
        default: "#f8fafc",
        category: "background",
      },
    ],
    generate: (options) =>
      generateSquareTiling(options as unknown as SquareOptions),
    outlineWidth: (scale) => Math.max(scale * 0.02, 0.5),
  },
  {
    id: "hexagonal",
    icon: "🔷",
    name: "Hexagonal",
    tagline: "Honeycomb tessellation with optional alternate coloring.",
    options: {
      defaults: {
        rings: 4,
        orientation: "pointy" as HexOrientation,
        parity: "alternate" as HexParityMode,
      },
      controls: [
        {
          type: "slider",
          key: "rings",
          label: "Radius rings",
          min: 2,
          max: 8,
          step: 1,
          description: "Number of hexagon rings around the center.",
        },
        {
          type: "select",
          key: "orientation",
          label: "Orientation",
          options: [
            { value: "pointy", label: "Pointy top" },
            { value: "flat", label: "Flat top" },
          ],
        },
        {
          type: "select",
          key: "parity",
          label: "Coloring",
          options: [
            { value: "alternate", label: "Alternate parity" },
            { value: "solid", label: "Single color" },
          ],
        },
      ],
    },
    colorRoles: [
      { id: "primary", label: "Primary hexes", default: "#6366f1", category: "fill" },
      {
        id: "secondary",
        label: "Alternate hexes",
        default: "#a855f7",
        category: "fill",
      },
      { id: "outline", label: "Outline", default: "#1e1b4b", category: "outline" },
      {
        id: "background",
        label: "Background",
        default: "#f8fafc",
        category: "background",
      },
    ],
    generate: (options) =>
      generateHexTiling(options as unknown as HexOptions),
    outlineWidth: (scale) => Math.max(scale * 0.02, 0.45),
  },
];

export const getTilingById = (id: string) =>
  TILINGS.find((tiling) => tiling.id === id);

export const projectPolygons = (
  polygons: TilingPolygon[],
  width: number,
  height: number,
  options?: { scaleMultiplier?: number; padding?: number },
): { polygons: TilingPolygon[]; scale: number } => {
  if (width <= 0 || height <= 0) {
    return { polygons: [], scale: 1 };
  }

  const rawPoints = polygons.map((polygon) => polygon.points);
  const bounds = computeBounds(rawPoints);
  const worldWidth = bounds.maxX - bounds.minX || 1;
  const worldHeight = bounds.maxY - bounds.minY || 1;

  const padding = options?.padding ?? 48;
  const innerWidth = Math.max(width - padding * 2, 1);
  const innerHeight = Math.max(height - padding * 2, 1);
  const baseScale = Math.min(innerWidth / worldWidth, innerHeight / worldHeight);
  const scale = baseScale * (options?.scaleMultiplier ?? 1);

  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerY = (bounds.minY + bounds.maxY) / 2;
  const offsetX = width / 2 - centerX * scale;
  const offsetY = height / 2 - centerY * scale;

  const projected = polygons.map((polygon) => ({
    ...polygon,
    points: polygon.points.map((point) => ({
      x: point.x * scale + offsetX,
      y: point.y * scale + offsetY,
    })),
  }));

  return { polygons: projected, scale };
};

export interface RenderConfig {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  polygons: TilingPolygon[];
  palette: Record<string, string>;
  outlineColor: string;
  outlineWidth: number;
  backgroundColor?: string;
}

export const renderToCanvas = ({
  canvas,
  width,
  height,
  polygons,
  palette,
  outlineColor,
  outlineWidth,
  backgroundColor,
}: RenderConfig): void => {
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) return;

  context.save();
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, width, height);
  context.restore();

  if (backgroundColor) {
    context.save();
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, width, height);
    context.restore();
  }

  for (const polygon of polygons) {
    const fill = palette[polygon.role];
    if (!fill) continue;
    context.beginPath();
    polygon.points.forEach((point, index) => {
      if (index === 0) {
        context.moveTo(point.x, point.y);
      } else {
        context.lineTo(point.x, point.y);
      }
    });
    context.closePath();
    context.fillStyle = fill;
    context.fill();
  }

  context.lineCap = "round";
  context.lineJoin = "round";
  context.strokeStyle = outlineColor;
  context.lineWidth = Math.max(outlineWidth, 0.01);

  for (const polygon of polygons) {
    context.beginPath();
    polygon.points.forEach((point, index) => {
      if (index === 0) {
        context.moveTo(point.x, point.y);
      } else {
        context.lineTo(point.x, point.y);
      }
    });
    context.closePath();
    context.stroke();
  }
};
