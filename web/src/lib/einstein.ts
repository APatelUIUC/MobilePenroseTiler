import { add, subtract, Vector2 } from "./geometry";

export type Matrix = [number, number, number, number, number, number];

const SQRT3 = Math.sqrt(3);
const HALF_SQRT3 = SQRT3 / 2;
const IDENTITY: Matrix = [1, 0, 0, 0, 1, 0];

const point = (x: number, y: number): Vector2 => ({ x, y });

const hexPoint = (x: number, y: number): Vector2 =>
  point(x + 0.5 * y, HALF_SQRT3 * y);

const matrixMultiply = (a: Matrix, b: Matrix): Matrix => [
  a[0] * b[0] + a[1] * b[3],
  a[0] * b[1] + a[1] * b[4],
  a[0] * b[2] + a[1] * b[5] + a[2],
  a[3] * b[0] + a[4] * b[3],
  a[3] * b[1] + a[4] * b[4],
  a[3] * b[2] + a[4] * b[5] + a[5],
];

const matrixInverse = (m: Matrix): Matrix => {
  const det = m[0] * m[4] - m[1] * m[3];
  return [
    m[4] / det,
    -m[1] / det,
    (m[1] * m[5] - m[2] * m[4]) / det,
    -m[3] / det,
    m[0] / det,
    (m[2] * m[3] - m[0] * m[5]) / det,
  ];
};

const applyMatrix = (m: Matrix, p: Vector2): Vector2 => ({
  x: m[0] * p.x + m[1] * p.y + m[2],
  y: m[3] * p.x + m[4] * p.y + m[5],
});

const translation = (tx: number, ty: number): Matrix => [1, 0, tx, 0, 1, ty];

const rotation = (angleRadians: number): Matrix => {
  const c = Math.cos(angleRadians);
  const s = Math.sin(angleRadians);
  return [c, -s, 0, s, c, 0];
};

const rotateAbout = (origin: Vector2, angle: number): Matrix =>
  matrixMultiply(
    translation(origin.x, origin.y),
    matrixMultiply(rotation(angle), translation(-origin.x, -origin.y)),
  );

const matchSegment = (p: Vector2, q: Vector2): Matrix => [
  q.x - p.x,
  p.y - q.y,
  p.x,
  q.y - p.y,
  q.x - p.x,
  p.y,
];

const matchTwoSegments = (
  sourceA: Vector2,
  sourceB: Vector2,
  targetA: Vector2,
  targetB: Vector2,
): Matrix =>
  matrixMultiply(
    matchSegment(targetA, targetB),
    matrixInverse(matchSegment(sourceA, sourceB)),
  );

const lineIntersection = (
  p1: Vector2,
  q1: Vector2,
  p2: Vector2,
  q2: Vector2,
): Vector2 => {
  const denominator = (q2.y - p2.y) * (q1.x - p1.x) - (q2.x - p2.x) * (q1.y - p1.y);

  const uA =
    ((q2.x - p2.x) * (p1.y - p2.y) - (q2.y - p2.y) * (p1.x - p2.x)) / denominator;
  return {
    x: p1.x + uA * (q1.x - p1.x),
    y: p1.y + uA * (q1.y - p1.y),
  };
};

const transformShape = (shape: Vector2[], transform: Matrix): Vector2[] =>
  shape.map((vertex) => applyMatrix(transform, vertex));

export interface EinsteinPolygon {
  role: string;
  points: Vector2[];
}

type Child = { transform: Matrix; geom: Geom };

class Geom {
  shape: Vector2[];
  role: string | null;
  superRole: string | null;
  children: Child[];
  outlineWidth: number;

  constructor(params: {
    shape: Vector2[];
    role?: string | null;
    superRole?: string | null;
    outlineWidth?: number;
  }) {
    this.shape = params.shape;
    this.role = params.role ?? null;
    this.superRole = params.superRole ?? null;
    this.children = [];
    this.outlineWidth = params.outlineWidth ?? 1;
  }

  addChild(transform: Matrix, geom: Geom) {
    this.children.push({ transform, geom });
  }

  recenter() {
    if (this.shape.length === 0) return;
    const centroid = this.shape.reduce(
      (acc, vertex) => ({ x: acc.x + vertex.x, y: acc.y + vertex.y }),
      { x: 0, y: 0 },
    );
    const factor = 1 / this.shape.length;
    const centre = point(centroid.x * factor, centroid.y * factor);
    this.shape = this.shape.map((vertex) => subtract(vertex, centre));
    const translationMatrix = translation(-centre.x, -centre.y);
    this.children = this.children.map((child) => ({
      transform: matrixMultiply(translationMatrix, child.transform),
      geom: child.geom,
    }));
  }

  collect(level: number, transform: Matrix, polygons: EinsteinPolygon[]) {
    if (level <= 0) {
      if (this.role) {
        polygons.push({
          role: this.role,
          points: transformShape(this.shape, transform),
        });
      }
      return;
    }

    for (const child of this.children) {
      child.geom.collect(level - 1, matrixMultiply(transform, child.transform), polygons);
    }
  }

  collectSupertiles(
    desiredLevel: number,
    transform: Matrix,
    currentLevel: number,
    polygons: EinsteinPolygon[],
  ) {
    if (currentLevel === desiredLevel) {
      if (this.superRole) {
        polygons.push({
          role: this.superRole,
          points: transformShape(this.shape, transform),
        });
      }
      return;
    }

    for (const child of this.children) {
      child.geom.collectSupertiles(
        desiredLevel,
        matrixMultiply(transform, child.transform),
        currentLevel + 1,
        polygons,
      );
    }
  }
}

const HAT_OUTLINE: Vector2[] = [
  hexPoint(0, 0),
  hexPoint(-1, -1),
  hexPoint(0, -2),
  hexPoint(2, -2),
  hexPoint(2, -1),
  hexPoint(4, -2),
  hexPoint(5, -1),
  hexPoint(4, 0),
  hexPoint(3, 0),
  hexPoint(2, 2),
  hexPoint(0, 3),
  hexPoint(0, 2),
  hexPoint(-1, 2),
];

const createHatGeom = (role: string): Geom =>
  new Geom({
    shape: [...HAT_OUTLINE],
    role,
    superRole: null,
  });

const H1_HAT = createHatGeom("hat-h");
const H_HAT = createHatGeom("hat-h");
const T_HAT = createHatGeom("hat-t");
const P_HAT = createHatGeom("hat-p");
const F_HAT = createHatGeom("hat-f");

const buildInitialMetatiles = () => {
  const createMetatile = (shape: Vector2[], superRole: string): Geom =>
    new Geom({ shape, role: null, superRole, outlineWidth: 2 });

  const H_outline: Vector2[] = [
    point(0, 0),
    point(4, 0),
    point(4.5, HALF_SQRT3),
    point(2.5, 5 * HALF_SQRT3),
    point(1.5, 5 * HALF_SQRT3),
    point(-0.5, HALF_SQRT3),
  ];
  const H = createMetatile(H_outline, "supertile-h");
  H.addChild(matchTwoSegments(HAT_OUTLINE[5], HAT_OUTLINE[7], H_outline[5], H_outline[0]), H_HAT);
  H.addChild(matchTwoSegments(HAT_OUTLINE[9], HAT_OUTLINE[11], H_outline[1], H_outline[2]), H_HAT);
  H.addChild(matchTwoSegments(HAT_OUTLINE[5], HAT_OUTLINE[7], H_outline[3], H_outline[4]), H_HAT);
  H.addChild(
    matrixMultiply(
      translation(2.5, HALF_SQRT3),
      matrixMultiply(
        [-0.5, -HALF_SQRT3, 0, HALF_SQRT3, -0.5, 0],
        [0.5, 0, 0, 0, -0.5, 0],
      ),
    ),
    H1_HAT,
  );

  const T_outline: Vector2[] = [point(0, 0), point(3, 0), point(1.5, 3 * HALF_SQRT3)];
  const T = createMetatile(T_outline, "supertile-t");
  T.addChild([0.5, 0, 0.5, 0, 0.5, HALF_SQRT3], T_HAT);

  const P_outline: Vector2[] = [
    point(0, 0),
    point(4, 0),
    point(3, 2 * HALF_SQRT3),
    point(-1, 2 * HALF_SQRT3),
  ];
  const P = createMetatile(P_outline, "supertile-p");
  P.addChild([0.5, 0, 1.5, 0, 0.5, HALF_SQRT3], P_HAT);
  P.addChild(
    matrixMultiply(
      translation(0, 2 * HALF_SQRT3),
      matrixMultiply([0.5, HALF_SQRT3, 0, -HALF_SQRT3, 0.5, 0], [0.5, 0, 0, 0, 0.5, 0]),
    ),
    P_HAT,
  );

  const F_outline: Vector2[] = [
    point(0, 0),
    point(3, 0),
    point(3.5, HALF_SQRT3),
    point(3, 2 * HALF_SQRT3),
    point(-1, 2 * HALF_SQRT3),
  ];
  const F = createMetatile(F_outline, "supertile-f");
  F.addChild([0.5, 0, 1.5, 0, 0.5, HALF_SQRT3], F_HAT);
  F.addChild(
    matrixMultiply(
      translation(0, 2 * HALF_SQRT3),
      matrixMultiply([0.5, HALF_SQRT3, 0, -HALF_SQRT3, 0.5, 0], [0.5, 0, 0, 0, 0.5, 0]),
    ),
    F_HAT,
  );

  H.recenter();
  T.recenter();
  P.recenter();
  F.recenter();

  return { H, T, P, F };
};

const constructPatch = (H: Geom, T: Geom, P: Geom, F: Geom): Geom => {
  const rules: Array<
    | [string]
    | [number, number, string, number]
    | [number, number, number, number, string, number]
  > = [
    ["H"],
    [0, 0, "P", 2],
    [1, 0, "H", 2],
    [2, 0, "P", 2],
    [3, 0, "H", 2],
    [4, 4, "P", 2],
    [0, 4, "F", 3],
    [2, 4, "F", 3],
    [4, 1, 3, 2, "F", 0],
    [8, 3, "H", 0],
    [9, 2, "P", 0],
    [10, 2, "H", 0],
    [11, 4, "P", 2],
    [12, 0, "H", 2],
    [13, 0, "F", 3],
    [14, 2, "F", 1],
    [15, 3, "H", 4],
    [8, 2, "F", 1],
    [17, 3, "H", 0],
    [18, 2, "P", 0],
    [19, 2, "H", 2],
    [20, 4, "F", 3],
    [20, 0, "P", 2],
    [22, 0, "H", 2],
    [23, 4, "F", 3],
    [23, 0, "F", 3],
    [16, 0, "P", 2],
    [9, 4, 0, 2, "T", 2],
    [4, 0, "F", 3],
  ];

  const result = new Geom({ shape: [], role: null, superRole: null });
  const shapes: Record<string, Geom> = { H, T, P, F };

  for (const rule of rules) {
    if (rule.length === 1) {
      result.addChild(IDENTITY, shapes[rule[0]]);
      continue;
    }

    if (rule.length === 4) {
      const [refChildIndex, edgeIndex, shapeId, shapeEdge] = rule;
      const reference = result.children[refChildIndex];
      const poly = reference.geom.shape;
      const transform = reference.transform;
      const targetStart = applyMatrix(transform, poly[(edgeIndex + 1) % poly.length]);
      const targetEnd = applyMatrix(transform, poly[edgeIndex]);
      const shape = shapes[shapeId];
      const shapePoly = shape.shape;
      result.addChild(
        matchTwoSegments(shapePoly[shapeEdge], shapePoly[(shapeEdge + 1) % shapePoly.length], targetStart, targetEnd),
        shape,
      );
      continue;
    }

    const [childIndexA, vertexIndexA, childIndexB, vertexIndexB, shapeId, shapeEdge] = rule;
    const childA = result.children[childIndexA];
    const childB = result.children[childIndexB];
    const pointA = applyMatrix(childA.transform, childA.geom.shape[vertexIndexA]);
    const pointB = applyMatrix(childB.transform, childB.geom.shape[vertexIndexB]);
    const shape = shapes[shapeId];
    const shapePoly = shape.shape;

    result.addChild(
      matchTwoSegments(shapePoly[shapeEdge], shapePoly[(shapeEdge + 1) % shapePoly.length], pointA, pointB),
      shape,
    );
  }

  return result;
};

const evaluateChildVertex = (geom: Geom, childIndex: number, vertexIndex: number): Vector2 => {
  const child = geom.children[childIndex];
  return applyMatrix(child.transform, child.geom.shape[vertexIndex]);
};

const constructMetatiles = (patch: Geom): { H: Geom; T: Geom; P: Geom; F: Geom } => {
  const bps1 = evaluateChildVertex(patch, 8, 2);
  const bps2 = evaluateChildVertex(patch, 21, 2);
  const rbps = applyMatrix(rotateAbout(bps1, -2.0 * Math.PI / 3.0), bps2);

  const p72 = evaluateChildVertex(patch, 7, 2);
  const p252 = evaluateChildVertex(patch, 25, 2);

  const llc = lineIntersection(
    bps1,
    rbps,
    evaluateChildVertex(patch, 6, 2),
    p72,
  );
  let w = subtract(evaluateChildVertex(patch, 6, 2), llc);

  const newHOutline: Vector2[] = [llc, bps1];
  w = applyMatrix(rotation(-Math.PI / 3), w);
  newHOutline.push(add(newHOutline[1], w));
  newHOutline.push(evaluateChildVertex(patch, 14, 2));
  w = applyMatrix(rotation(-Math.PI / 3), w);
  newHOutline.push(subtract(newHOutline[3], w));
  newHOutline.push(evaluateChildVertex(patch, 6, 2));

  const newH = new Geom({
    shape: newHOutline,
    role: null,
    superRole: "supertile-h",
    outlineWidth: patch.outlineWidth * 2,
  });
  for (const index of [0, 9, 16, 27, 26, 6, 1, 8, 10, 15]) {
    newH.addChild(patch.children[index].transform, patch.children[index].geom);
  }

  const newPOutline: Vector2[] = [
    p72,
    add(p72, subtract(bps1, llc)),
    bps1,
    llc,
  ];
  const newP = new Geom({
    shape: newPOutline,
    role: null,
    superRole: "supertile-p",
    outlineWidth: patch.outlineWidth * 2,
  });
  for (const index of [7, 2, 3, 4, 28]) {
    newP.addChild(patch.children[index].transform, patch.children[index].geom);
  }

  const newFOutline: Vector2[] = [
    bps2,
    evaluateChildVertex(patch, 24, 2),
    evaluateChildVertex(patch, 25, 0),
    p252,
    add(p252, subtract(llc, bps1)),
  ];
  const newF = new Geom({
    shape: newFOutline,
    role: null,
    superRole: "supertile-f",
    outlineWidth: patch.outlineWidth * 2,
  });
  for (const index of [21, 20, 22, 23, 24, 25]) {
    newF.addChild(patch.children[index].transform, patch.children[index].geom);
  }

  const AAA = newHOutline[2];
  const BBB = add(newHOutline[1], subtract(newHOutline[4], newHOutline[5]));
  const CCC = applyMatrix(rotateAbout(BBB, -Math.PI / 3), AAA);
  const newTOutline: Vector2[] = [BBB, CCC, AAA];
  const newT = new Geom({
    shape: newTOutline,
    role: null,
    superRole: "supertile-t",
    outlineWidth: patch.outlineWidth * 2,
  });
  newT.addChild(patch.children[11].transform, patch.children[11].geom);

  newH.recenter();
  newP.recenter();
  newF.recenter();
  newT.recenter();

  return { H: newH, T: newT, P: newP, F: newF };
};

export interface EinsteinBuildOptions {
  substitutions: number;
  includeSupertiles: boolean;
}

export const generateEinsteinPolygons = ({
  substitutions,
  includeSupertiles,
}: EinsteinBuildOptions): EinsteinPolygon[] => {
  const iterations = Math.max(1, Math.round(substitutions));

  let tiles = buildInitialMetatiles();
  let patch = constructPatch(tiles.H, tiles.T, tiles.P, tiles.F);

  for (let i = 1; i < iterations; i += 1) {
    tiles = constructMetatiles(patch);
    patch = constructPatch(tiles.H, tiles.T, tiles.P, tiles.F);
  }

  patch.recenter();

  const depth = iterations + 1;
  const supertilePolygons: EinsteinPolygon[] = [];

  if (includeSupertiles) {
    for (let d = 1; d <= iterations; d += 1) {
      patch.collectSupertiles(d, IDENTITY, 0, supertilePolygons);
    }
  }

  const hatPolygons: EinsteinPolygon[] = [];
  patch.collect(depth, IDENTITY, hatPolygons);

  return [...supertilePolygons, ...hatPolygons];
};
