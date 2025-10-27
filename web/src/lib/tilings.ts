import {
  Vector2,
  add,
  centerPolygons,
  computeBounds,
  rotate,
  scale,
} from "./geometry";
import {
  generatePenrosePolygons,
  penroseOutlineFactor,
  PenrosePolygon,
} from "./penrose";
import {
  EinsteinPolygon,
  generateEinsteinPolygons,
} from "./einstein";

export interface TilingPolygon {
  role: string;
  points: Vector2[];
}

export type ColorRoleCategory = "fill" | "outline";

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

const RAD = Math.PI / 180;

const ensurePositiveInteger = (value: number, fallback = 1): number =>
  Math.max(fallback, Math.round(value));

const generateTriangleTiling = (options: TriangularOptions): TilingPolygon[] => {
  const { density, baseAngle, edgeRatio, diagonal, rotation } = options;
  const cells = ensurePositiveInteger(density);
  const margin = Math.max(4, Math.ceil(cells * 0.2));

  const angleRad = baseAngle * RAD;
  const vectorA: Vector2 = { x: 1, y: 0 };
  const vectorB: Vector2 = {
    x: edgeRatio * Math.cos(angleRad),
    y: edgeRatio * Math.sin(angleRad),
  };

  const polygons: TilingPolygon[] = [];

  for (let j = -margin; j < cells + margin; j += 1) {
    for (let i = -margin; i < cells + margin; i += 1) {
      const origin = add(scale(vectorA, i), scale(vectorB, j));
      const p0 = origin;
      const p1 = add(origin, vectorA);
      const p2 = add(origin, vectorB);
      const p3 = add(p1, vectorB);

      if (diagonal === "backward") {
        polygons.push({ role: "up", points: [p0, p2, p3] });
        polygons.push({ role: "down", points: [p0, p1, p2] });
      } else {
        polygons.push({ role: "up", points: [p0, p1, p3] });
        polygons.push({ role: "down", points: [p0, p3, p2] });
      }
    }
  }

  const centered = recenter(polygons);
  if (rotation === 0) {
    return centered;
  }

  const rotationRad = rotation * RAD;
  return applyTransform(centered, (point) => rotate(point, rotationRad));
};

const generateParallelogramTiling = (
  options: ParallelogramOptions,
): TilingPolygon[] => {
  const { density, angle, edgeRatio, rotation } = options;
  const cells = ensurePositiveInteger(density);
  const margin = Math.max(4, Math.ceil(cells * 0.2));
  const angleRad = angle * RAD;
  const vectorA: Vector2 = { x: 1, y: 0 };
  const vectorB: Vector2 = {
    x: edgeRatio * Math.cos(angleRad),
    y: edgeRatio * Math.sin(angleRad),
  };

  const polygons: TilingPolygon[] = [];

  for (let j = -margin; j < cells + margin; j += 1) {
    for (let i = -margin; i < cells + margin; i += 1) {
      const origin = add(scale(vectorA, i), scale(vectorB, j));
      const p0 = origin;
      const p1 = add(origin, vectorA);
      const p2 = add(p1, vectorB);
      const p3 = add(origin, vectorB);
      const role = (i + j) % 2 === 0 ? "primary" : "secondary";

      polygons.push({
        role,
        points: [p0, p1, p2, p3],
      });
    }
  }

  const centered = recenter(polygons);
  if (rotation === 0) {
    return centered;
  }

  const rotationRad = rotation * RAD;
  return applyTransform(centered, (point) => rotate(point, rotationRad));
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
  const radius = ensurePositiveInteger(rings);
  const margin = Math.max(2, Math.ceil(radius * 0.3));
  const extent = radius + margin;
  const polygons: TilingPolygon[] = [];

  for (let q = -extent; q <= extent; q += 1) {
    const rMin = Math.max(-extent, -q - extent);
    const rMax = Math.min(extent, -q + extent);
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

export type TriangleDiagonal = "forward" | "backward";

export interface TriangularOptions {
  density: number;
  baseAngle: number;
  edgeRatio: number;
  diagonal: TriangleDiagonal;
  rotation: number;
}

export interface ParallelogramOptions {
  density: number;
  angle: number;
  edgeRatio: number;
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
    ],
    generate: (options) => {
      const penroseOptions = options as unknown as PenroseOptions;
      return asTilingPolygons(
        generatePenrosePolygons(penroseOptions.divisions),
      );
    },
    scaleMultiplier: (options) => {
      const penroseOptions = options as unknown as PenroseOptions;
      return penroseOptions.zoom === "in" ? 1.2 : 0.6;
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
    tagline: "Custom triangle lattices with adjustable angles and diagonals.",
    options: {
      defaults: {
        density: 14,
        baseAngle: 60,
        edgeRatio: 1,
        diagonal: "forward" as TriangleDiagonal,
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
          key: "baseAngle",
          label: "Base angle (°)",
          min: 20,
          max: 160,
          step: 1,
          description: "Controls the angle between the lattice edges.",
        },
        {
          type: "slider",
          key: "edgeRatio",
          label: "Edge ratio",
          min: 0.4,
          max: 2,
          step: 0.05,
          description: "Scales the second lattice edge relative to the first.",
        },
        {
          type: "select",
          key: "diagonal",
          label: "Diagonal",
          options: [
            { value: "forward", label: "Forward slash" },
            { value: "backward", label: "Back slash" },
          ],
          description: "Choose which diagonal divides each parallelogram.",
        },
        {
          type: "slider",
          key: "rotation",
          label: "Rotation (°)",
          min: 0,
          max: 180,
          step: 1,
          description: "Rotate the entire tiling after generation.",
        },
      ],
    },
    colorRoles: [
      { id: "up", label: "Up triangles", default: "#f97316", category: "fill" },
      { id: "down", label: "Down triangles", default: "#0ea5e9", category: "fill" },
      { id: "outline", label: "Outline", default: "#020617", category: "outline" },
    ],
    generate: (options) => {
      const triangleOptions = options as unknown as TriangularOptions;
      return generateTriangleTiling(triangleOptions);
    },
    scaleMultiplier: () => 1.15,
    outlineWidth: (scale) => Math.max(scale * 0.015, 0.4),
  },
  {
    id: "parallelogram",
    icon: "🟪",
    name: "Parallelogram",
    tagline: "Alternating parallelograms with tunable skew and edge ratios.",
    options: {
      defaults: {
        density: 12,
        angle: 90,
        edgeRatio: 1,
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
          description: "Number of tiles along each axis.",
        },
        {
          type: "slider",
          key: "angle",
          label: "Interior angle (°)",
          min: 20,
          max: 160,
          step: 1,
          description: "Angle between the two lattice directions.",
        },
        {
          type: "slider",
          key: "edgeRatio",
          label: "Edge ratio",
          min: 0.4,
          max: 2,
          step: 0.05,
          description: "Length of the second edge relative to the first.",
        },
        {
          type: "slider",
          key: "rotation",
          label: "Rotation (°)",
          min: 0,
          max: 180,
          step: 1,
          description: "Rotate the tiling after construction.",
        },
      ],
    },
    colorRoles: [
      { id: "primary", label: "Primary tiles", default: "#10b981", category: "fill" },
      {
        id: "secondary",
        label: "Alternate tiles",
        default: "#047857",
        category: "fill",
      },
      { id: "outline", label: "Outline", default: "#0f172a", category: "outline" },
    ],
    generate: (options) =>
      generateParallelogramTiling(options as unknown as ParallelogramOptions),
    scaleMultiplier: () => 1.15,
    outlineWidth: (scale) => Math.max(scale * 0.02, 0.5),
  },
  {
    id: "hexagonal",
    icon: "⬢",
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
    ],
    generate: (options) =>
      generateHexTiling(options as unknown as HexOptions),
    scaleMultiplier: () => 1.18,
    outlineWidth: (scale) => Math.max(scale * 0.02, 0.45),
  },
  {
    id: "einstein",
    icon: "🧠",
    name: "Einstein",
    tagline: "The 2023 \"hat\" monotile with aperiodic substitution structure.",
    options: {
      defaults: {
        iterations: 3,
        supertiles: "none",
      },
      controls: [
        {
          type: "slider",
          key: "iterations",
          label: "Inflation steps",
          min: 1,
          max: 5,
          step: 1,
          description: "How many substitution inflations to apply to the hat tiling.",
        },
        {
          type: "select",
          key: "supertiles",
          label: "Supertile shading",
          options: [
            { value: "none", label: "Hidden" },
            { value: "outline", label: "Show guides" },
          ],
          description: "Toggle pastel guides for the hierarchical metatile boundaries.",
        },
      ],
    },
    colorRoles: [
      { id: "hat-h", label: "H hats", default: "#4f46e5", category: "fill" },
      { id: "hat-t", label: "T hats", default: "#ec4899", category: "fill" },
      { id: "hat-p", label: "P hats", default: "#f59e0b", category: "fill" },
      { id: "hat-f", label: "F hats", default: "#10b981", category: "fill" },
      { id: "supertile-h", label: "H supertiles", default: "#dbeafe", category: "fill" },
      { id: "supertile-t", label: "T supertiles", default: "#fce7f3", category: "fill" },
      { id: "supertile-p", label: "P supertiles", default: "#fef3c7", category: "fill" },
      { id: "supertile-f", label: "F supertiles", default: "#dcfce7", category: "fill" },
      { id: "outline", label: "Shared outline", default: "#0f172a", category: "outline" },
    ],
    generate: (options) => {
      const data = options as TilingOptionsRecord;
      const iterations = Math.max(1, Math.round(Number(data.iterations ?? 3)));
      const includeSupertiles = data.supertiles === "outline";

      const einsteinPolys: EinsteinPolygon[] = generateEinsteinPolygons({
        substitutions: iterations,
        includeSupertiles,
      });

      return einsteinPolys.map((poly) => ({
        role: poly.role,
        points: poly.points,
      }));
    },
    outlineWidth: (scale) => Math.max(scale * 0.018, 0.5),
  },
];

export const getTilingById = (id: string) =>
  TILINGS.find((tiling) => tiling.id === id);

export const projectPolygons = (
  polygons: TilingPolygon[],
  width: number,
  height: number,
  options?: { scaleMultiplier?: number; padding?: number; overscan?: number },
): { polygons: TilingPolygon[]; scale: number } => {
  if (width <= 0 || height <= 0) {
    return { polygons: [], scale: 1 };
  }

  const rawPoints = polygons.map((polygon) => polygon.points);
  const bounds = computeBounds(rawPoints);
  const worldWidth = bounds.maxX - bounds.minX || 1;
  const worldHeight = bounds.maxY - bounds.minY || 1;

  const padding = options?.padding ?? 0;
  const innerWidth = Math.max(width - padding * 2, 1);
  const innerHeight = Math.max(height - padding * 2, 1);
  const baseScale = Math.min(innerWidth / worldWidth, innerHeight / worldHeight);
  const overscan = options?.overscan ?? 1.08;
  const scale = baseScale * (options?.scaleMultiplier ?? 1) * overscan;

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
}

export const renderToCanvas = ({
  canvas,
  width,
  height,
  polygons,
  palette,
  outlineColor,
  outlineWidth,
}: RenderConfig): void => {
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) return;

  context.save();
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, width, height);
  context.restore();

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
