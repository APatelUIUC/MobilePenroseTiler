import { Vector2, add, polarToCartesian, scale, subtract } from "./geometry";

export type PenroseShape = "thin" | "thick";

export interface PenroseTriangle {
  kind: PenroseShape;
  vertices: [Vector2, Vector2, Vector2];
}

const PHI = (Math.sqrt(5) + 1) / 2;

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

  for (let iteration = 0; iteration < divisions; iteration += 1) {
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

export interface PenrosePolygon {
  role: PenroseShape;
  points: [Vector2, Vector2, Vector2];
}

export const generatePenrosePolygons = (divisions: number): PenrosePolygon[] =>
  generatePenroseTriangles(Math.max(divisions, 0)).map(({ kind, vertices }) => ({
    role: kind,
    points: vertices,
  }));

export const penroseOutlineFactor = (divisions: number): number => {
  const normalized = Math.max(divisions, 1);
  return normalized > 3 ? normalized ** -3 : normalized ** -5;
};
