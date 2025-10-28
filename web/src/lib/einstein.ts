import type { Vector2 } from "./geometry";

export interface EinsteinPolygon {
  role: string;
  points: Vector2[];
}

export type Matrix = [number, number, number, number, number, number];

const multiplyMatrices = (a: Matrix, b: Matrix): Matrix => [
  a[0] * b[0] + a[1] * b[3],
  a[0] * b[1] + a[1] * b[4],
  a[0] * b[2] + a[1] * b[5] + a[2],
  a[3] * b[0] + a[4] * b[3],
  a[3] * b[1] + a[4] * b[4],
  a[3] * b[2] + a[4] * b[5] + a[5],
];

const applyMatrix = (matrix: Matrix, point: Vector2): Vector2 => ({
  x: matrix[0] * point.x + matrix[1] * point.y + matrix[2],
  y: matrix[3] * point.x + matrix[4] * point.y + matrix[5],
});

const transformOutline = (outline: readonly Vector2[], transform: Matrix): Vector2[] =>
  outline.map((point) => applyMatrix(transform, point));

const HAT_OUTLINE: Vector2[] = [
  { x: 0.0, y: 0.0 },
  { x: -0.5, y: -0.866025403784 },
  { x: 0.0, y: -1.732050807569 },
  { x: 1.0, y: -1.732050807569 },
  { x: 1.0, y: -0.866025403784 },
  { x: 2.0, y: -1.732050807569 },
  { x: 2.5, y: -0.866025403784 },
  { x: 2.0, y: 0.0 },
  { x: 1.5, y: 0.0 },
  { x: 1.0, y: 1.732050807569 },
  { x: 0.0, y: 2.598076211353 },
  { x: 0.0, y: 1.732050807569 },
  { x: -0.5, y: 1.732050807569 },
];


export const SEED_HATS = [
  { role: "hat-h", transform: [-0.25, 0.433012701892, -1, -0.433012701892, -0.25, 0] as Matrix },
  { role: "hat-h", transform: [-0.25, 0.433012701892, 2, -0.433012701892, -0.25, 0] as Matrix },
  { role: "hat-h", transform: [-0.25, -0.433012701892, 0.5, 0.433012701892, -0.25, 0.866025403784] as Matrix },
  { role: "hat-h", transform: [-0.25, 0.433012701892, 0.5, 0.433012701892, 0.25, -0.866025403784] as Matrix },
  { role: "hat-p", transform: [0.5, 0, 0.5, 0, 0.5, -2.598076211353] as Matrix },
  { role: "hat-p", transform: [0.25, 0.433012701892, -1, -0.433012701892, 0.25, -1.732050807569] as Matrix },
  { role: "hat-h", transform: [0.25, 0.433012701892, 0.5, -0.433012701892, 0.25, -6.062177826491] as Matrix },
  { role: "hat-h", transform: [0.25, 0.433012701892, 2, -0.433012701892, 0.25, -3.464101615138] as Matrix },
  { role: "hat-h", transform: [-0.5, 0, 0.5, 0, -0.5, -4.330127018922] as Matrix },
  { role: "hat-h", transform: [-0.5, 0, 2, 0, 0.5, -5.196152422707] as Matrix },
  { role: "hat-p", transform: [0.25, -0.433012701892, 3.5, 0.433012701892, 0.25, -6.062177826491] as Matrix },
  { role: "hat-p", transform: [0.5, 0, 2, 0, 0.5, -6.928203230276] as Matrix },
  { role: "hat-h", transform: [0.5, 0, 6.5, 0, 0.5, -7.79422863406] as Matrix },
  { role: "hat-h", transform: [0.5, 0, 5, 0, 0.5, -5.196152422707] as Matrix },
  { role: "hat-h", transform: [-0.25, 0.433012701892, 5, -0.433012701892, -0.25, -6.928203230276] as Matrix },
  { role: "hat-h", transform: [-0.25, -0.433012701892, 6.5, -0.433012701892, 0.25, -6.062177826491] as Matrix },
  { role: "hat-p", transform: [0.5, 0, 6.5, 0, 0.5, -9.526279441629] as Matrix },
  { role: "hat-p", transform: [0.25, 0.433012701892, 5, -0.433012701892, 0.25, -8.660254037844] as Matrix },
  { role: "hat-f", transform: [-0.25, 0.433012701892, -2.5, -0.433012701892, -0.25, 0.866025403784] as Matrix },
  { role: "hat-f", transform: [-0.5, 0, -1, 0, -0.5, 1.732050807569] as Matrix },
  { role: "hat-f", transform: [0.25, 0.433012701892, -1, -0.433012701892, 0.25, -6.928203230276] as Matrix },
  { role: "hat-f", transform: [-0.25, 0.433012701892, -1, -0.433012701892, -0.25, -5.196152422707] as Matrix },
  { role: "hat-f", transform: [-0.5, 0, 5, 0, -0.5, -5.196152422707] as Matrix },
  { role: "hat-f", transform: [-0.25, -0.433012701892, 6.5, 0.433012701892, -0.25, -6.062177826491] as Matrix },
  { role: "hat-h", transform: [0.25, -0.433012701892, 6.5, 0.433012701892, 0.25, -7.79422863406] as Matrix },
  { role: "hat-h", transform: [0.25, -0.433012701892, 3.5, 0.433012701892, 0.25, -7.79422863406] as Matrix },
  { role: "hat-h", transform: [0.25, -0.433012701892, 5, -0.433012701892, -0.25, -6.928203230276] as Matrix },
  { role: "hat-p", transform: [-0.25, -0.433012701892, 3.5, 0.433012701892, -0.25, -9.526279441629] as Matrix },
  { role: "hat-p", transform: [0.25, -0.433012701892, 3.5, 0.433012701892, 0.25, -11.258330249198] as Matrix },
  { role: "hat-h", transform: [0.5, 0, 2, 0, 0.5, -12.124355652982] as Matrix },
  { role: "hat-h", transform: [0.5, 0, 0.5, 0, 0.5, -9.526279441629] as Matrix },
  { role: "hat-h", transform: [-0.25, 0.433012701892, 0.5, -0.433012701892, -0.25, -11.258330249198] as Matrix },
  { role: "hat-h", transform: [-0.25, -0.433012701892, 2, -0.433012701892, 0.25, -10.392304845413] as Matrix },
  { role: "hat-p", transform: [0.5, 0, 2, 0, 0.5, -13.856406460551] as Matrix },
  { role: "hat-p", transform: [0.25, 0.433012701892, 0.5, -0.433012701892, 0.25, -12.990381056767] as Matrix },
  { role: "hat-h", transform: [0.25, 0.433012701892, 2, -0.433012701892, 0.25, -17.320508075689] as Matrix },
  { role: "hat-h", transform: [0.25, 0.433012701892, 3.5, -0.433012701892, 0.25, -14.722431864335] as Matrix },
  { role: "hat-h", transform: [-0.5, 0, 2, 0, -0.5, -15.58845726812] as Matrix },
  { role: "hat-h", transform: [-0.5, 0, 3.5, 0, 0.5, -16.454482671904] as Matrix },
  { role: "hat-f", transform: [0.25, -0.433012701892, 5, 0.433012701892, 0.25, -17.320508075689] as Matrix },
  { role: "hat-f", transform: [0.5, 0, 3.5, 0, 0.5, -18.186533479473] as Matrix },
  { role: "hat-f", transform: [0.25, 0.433012701892, 5, -0.433012701892, 0.25, -13.856406460551] as Matrix },
  { role: "hat-f", transform: [-0.25, 0.433012701892, 5, -0.433012701892, -0.25, -12.124355652982] as Matrix },
  { role: "hat-h", transform: [0.25, 0.433012701892, 6.5, -0.433012701892, 0.25, -12.990381056767] as Matrix },
  { role: "hat-h", transform: [0.25, 0.433012701892, 8, -0.433012701892, 0.25, -10.392304845413] as Matrix },
  { role: "hat-h", transform: [-0.5, 0, 6.5, 0, -0.5, -11.258330249198] as Matrix },
  { role: "hat-h", transform: [-0.5, 0, 8, 0, 0.5, -12.124355652982] as Matrix },
  { role: "hat-f", transform: [0.25, -0.433012701892, 2, 0.433012701892, 0.25, -6.928203230276] as Matrix },
  { role: "hat-f", transform: [0.5, 0, 0.5, 0, 0.5, -7.79422863406] as Matrix },
  { role: "hat-h", transform: [0.25, 0.433012701892, 0.5, -0.433012701892, 0.25, -4.330127018922] as Matrix },
  { role: "hat-h", transform: [-0.5, 0, -1, 0, -0.5, -5.196152422707] as Matrix },
  { role: "hat-h", transform: [-0.5, 0, 0.5, 0, 0.5, -6.062177826491] as Matrix },
  { role: "hat-p", transform: [0.5, 0, -1, 0, 0.5, -3.464101615138] as Matrix },
  { role: "hat-p", transform: [0.25, 0.433012701892, -2.5, -0.433012701892, 0.25, -2.598076211353] as Matrix },
  { role: "hat-h", transform: [-0.25, -0.433012701892, -1, 0.433012701892, -0.25, 0] as Matrix },
  { role: "hat-h", transform: [-0.25, -0.433012701892, -2.5, 0.433012701892, -0.25, -2.598076211353] as Matrix },
  { role: "hat-h", transform: [0.5, 0, -1, 0, 0.5, -1.732050807569] as Matrix },
  { role: "hat-h", transform: [0.5, 0, -2.5, 0, -0.5, -0.866025403784] as Matrix },
  { role: "hat-f", transform: [0.25, -0.433012701892, 0.5, 0.433012701892, 0.25, -0.866025403784] as Matrix },
  { role: "hat-p", transform: [-0.25, 0.433012701892, -4, -0.433012701892, -0.25, 0] as Matrix },
  { role: "hat-p", transform: [-0.5, 0, -2.5, 0, -0.5, 0.866025403784] as Matrix },
  { role: "hat-h", transform: [-0.5, 0, -7, 0, -0.5, 1.732050807569] as Matrix },
  { role: "hat-h", transform: [-0.5, 0, -5.5, 0, -0.5, -0.866025403784] as Matrix },
  { role: "hat-h", transform: [0.25, -0.433012701892, -5.5, 0.433012701892, 0.25, 0.866025403784] as Matrix },
  { role: "hat-h", transform: [0.25, 0.433012701892, -7, 0.433012701892, -0.25, 0] as Matrix },
  { role: "hat-f", transform: [-0.5, 0, -7, 0, -0.5, 3.464101615138] as Matrix },
  { role: "hat-f", transform: [-0.25, -0.433012701892, -5.5, 0.433012701892, -0.25, 2.598076211353] as Matrix },
  { role: "hat-f", transform: [0.25, 0.433012701892, -8.5, -0.433012701892, 0.25, -0.866025403784] as Matrix },
  { role: "hat-f", transform: [-0.25, 0.433012701892, -8.5, -0.433012701892, -0.25, 0.866025403784] as Matrix },
  { role: "hat-p", transform: [0.25, -0.433012701892, 9.5, 0.433012701892, 0.25, -12.990381056767] as Matrix },
  { role: "hat-p", transform: [0.5, 0, 8, 0, 0.5, -13.856406460551] as Matrix },
  { role: "hat-t", transform: [-1.083333333333, 1.299038105677, 3.666666666667, -1.299038105677, -1.083333333333, -4.041451884327] as Matrix },
  { role: "hat-f", transform: [-0.25, -0.433012701892, 8, 0.433012701892, -0.25, -5.196152422707] as Matrix },
  { role: "hat-f", transform: [0.25, -0.433012701892, 8, 0.433012701892, 0.25, -6.928203230276] as Matrix },
] as const;

export const INITIAL_PATCH = [
  { role: "supertile-h", transform: [1, 0, 0, 0, 1, 0] as Matrix },
  { role: "supertile-p", transform: [1, 0, 0.5, 0, 1, -2.598076211353] as Matrix },
  { role: "supertile-h", transform: [0.5, -0.866025403784, 1, 0.866025403784, 0.5, -5.196152422707] as Matrix },
  { role: "supertile-p", transform: [0.5, -0.866025403784, 3.5, 0.866025403784, 0.5, -6.062177826491] as Matrix },
  { role: "supertile-h", transform: [-0.5, -0.866025403784, 6, 0.866025403784, -0.5, -6.928203230276] as Matrix },
  { role: "supertile-p", transform: [1, 0, 6.5, 0, 1, -9.526279441629] as Matrix },
  { role: "supertile-f", transform: [-0.5, 0.866025403784, -2.6, -0.866025403784, -0.5, 0.692820323028] as Matrix },
  { role: "supertile-f", transform: [0.5, 0.866025403784, -0.9, -0.866025403784, 0.5, -7.101408311032] as Matrix },
  { role: "supertile-f", transform: [-1, 0, 4.8, 0, -1, -5.196152422707] as Matrix },
  { role: "supertile-h", transform: [-1, 0, 5.5, 0, -1, -7.79422863406] as Matrix },
  { role: "supertile-p", transform: [-0.5, -0.866025403784, 3.5, 0.866025403784, -0.5, -9.526279441629] as Matrix },
  { role: "supertile-h", transform: [-0.5, -0.866025403784, 1.5, 0.866025403784, -0.5, -11.258330249198] as Matrix },
  { role: "supertile-p", transform: [1, 0, 2, 0, 1, -13.856406460551] as Matrix },
  { role: "supertile-h", transform: [0.5, -0.866025403784, 2.5, 0.866025403784, 0.5, -16.454482671904] as Matrix },
  { role: "supertile-f", transform: [0.5, -0.866025403784, 5.1, 0.866025403784, 0.5, -17.147302994932] as Matrix },
  { role: "supertile-f", transform: [0.5, 0.866025403784, 5.1, -0.866025403784, 0.5, -14.029611541308] as Matrix },
  { role: "supertile-h", transform: [0.5, -0.866025403784, 7, 0.866025403784, 0.5, -12.124355652982] as Matrix },
  { role: "supertile-f", transform: [0.5, -0.866025403784, 2.1, 0.866025403784, 0.5, -6.754998149519] as Matrix },
  { role: "supertile-h", transform: [0.5, -0.866025403784, -0.5, 0.866025403784, 0.5, -6.062177826491] as Matrix },
  { role: "supertile-p", transform: [1, 0, -1, 0, 1, -3.464101615138] as Matrix },
  { role: "supertile-h", transform: [-0.5, 0.866025403784, -1.5, -0.866025403784, -0.5, -0.866025403784] as Matrix },
  { role: "supertile-f", transform: [-0.5, -0.866025403784, 0.4, 0.866025403784, -0.5, 1.039230484541] as Matrix },
  { role: "supertile-p", transform: [-0.5, 0.866025403784, -4, -0.866025403784, -0.5, 0] as Matrix },
  { role: "supertile-h", transform: [0.5, 0.866025403784, -6.5, -0.866025403784, 0.5, 0.866025403784] as Matrix },
  { role: "supertile-f", transform: [-1, 0, -7.2, 0, -1, 3.464101615138] as Matrix },
  { role: "supertile-f", transform: [0.5, 0.866025403784, -8.4, -0.866025403784, 0.5, -1.039230484541] as Matrix },
  { role: "supertile-p", transform: [0.5, -0.866025403784, 9.5, 0.866025403784, 0.5, -12.990381056767] as Matrix },
  { role: "supertile-t", transform: [-2.166666666667, 2.598076211353, 1.5, -2.598076211353, -2.166666666667, -6.639528095681] as Matrix },
  { role: "supertile-f", transform: [-0.5, -0.866025403784, 7.9, 0.866025403784, -0.5, -5.02294734195] as Matrix },
] as const;

export const ROOT_PATCH = [
  { type: "H", transform: [1, 0, 0, 0, 1, 0] as Matrix },
  { type: "P", transform: [1, 0, -0.333333333333, 0, 1, 0.288675134595] as Matrix },
  { type: "H", transform: [-0.048525930708, 0.343838362381, 1.247328025249, -0.343838362381, -0.048525930708, -0.416954487497] as Matrix },
  { type: "P", transform: [-0.048525930708, 0.343838362381, 1.362760921024, -0.343838362381, -0.048525930708, -0.316349929616] as Matrix },
  { type: "H", transform: [-0.115870053493, -0.033370153095, 1.043435323758, 0.033370153095, -0.115870053493, -0.825600608482] as Matrix },
  { type: "P", transform: [0.067344122785, 0.377208515476, 0.695119508763, -0.377208515476, 0.067344122785, -1.290279099695] as Matrix },
  { type: "F", transform: [-1.40243902439, -2.851547061241, -13.015591936741, 2.851547061241, -1.40243902439, 1.316157997555] as Matrix },
  { type: "F", transform: [1.048525930708, -0.343838362381, 2.331467348208, 0.343838362381, 1.048525930708, 3.994437537655] as Matrix },
  { type: "F", transform: [-0.120401127931, 0.024579290705, 1.669136666889, -0.024579290705, -0.120401127931, -0.559790103871] as Matrix },
  { type: "H", transform: [-0.120401127931, 0.024579290705, 1.646711787416, -0.024579290705, -0.120401127931, 0.048840783142] as Matrix },
  { type: "P", transform: [0.118543116637, 0.333437816749, 1.694618864245, -0.333437816749, 0.118543116637, 0.659540590162] as Matrix },
  { type: "H", transform: [0.118543116637, 0.333437816749, 1.637878029828, -0.333437816749, 0.118543116637, 0.514174201095] as Matrix },
  { type: "P", transform: [0.784564133613, -0.805657482294, 3.341856112682, 0.805657482294, 0.784564133613, 0.477967962415] as Matrix },
  { type: "H", transform: [0.238944244568, 0.308858526044, 5.150482106781, -0.308858526044, 0.238944244568, 1.197827919822] as Matrix },
  { type: "F", transform: [0.238944244568, 0.308858526044, 6.854572197932, -0.308858526044, 0.238944244568, 2.11534122638] as Matrix },
  { type: "F", transform: [-0.386951452014, 0.052502522862, 5.442556957119, -0.052502522862, -0.386951452014, 2.495982352761] as Matrix },
  { type: "H", transform: [0.038914273808, -0.116560080785, 6.102460748036, 0.116560080785, 0.038914273808, 3.961863467678] as Matrix },
  { type: "F", transform: [0.038914273808, -0.116560080785, 1.972724906632, 0.116560080785, 0.038914273808, -0.213924780637] as Matrix },
  { type: "H", transform: [0.038914273808, -0.116560080785, 2.51102715605, 0.116560080785, 0.038914273808, -0.498819708843] as Matrix },
  { type: "P", transform: [-0.348037178206, -0.064057557923, 3.015955164601, 0.064057557923, -0.348037178206, -0.845658357908] as Matrix },
  { type: "H", transform: [-0.038914273808, 0.116560080785, 3.520883173152, -0.116560080785, -0.038914273808, -1.192497006974] as Matrix },
  { type: "F", transform: [0.386951452014, -0.052502522862, 4.180786964069, 0.052502522862, 0.386951452014, 0.273384107944] as Matrix },
  { type: "P", transform: [-0.038914273808, 0.116560080785, 3.567502594764, -0.116560080785, -0.038914273808, -1.164877229941] as Matrix },
  { type: "H", transform: [-0.038189475942, -0.019036406583, 3.423744060103, 0.019036406583, -0.038189475942, -1.32166018127] as Matrix },
  { type: "F", transform: [-0.000724797866, 0.135596487368, 3.895747776469, -0.135596487368, -0.000724797866, -1.619693665476] as Matrix },
  { type: "F", transform: [-0.038189475942, -0.019036406583, 3.299664636884, 0.019036406583, -0.038189475942, -1.49292435363] as Matrix },
  { type: "P", transform: [0.038914273808, -0.116560080785, 6.055841326424, 0.116560080785, 0.038914273808, 3.934243690646] as Matrix },
  { type: "T", transform: [-0.224671338081, -0.159020742755, 1.264210794209, 0.159020742755, -0.224671338081, 3.850400696777] as Matrix },
  { type: "F", transform: [-0.115870053493, -0.033370153095, 0.786207405708, 0.033370153095, -0.115870053493, -1.365030233753] as Matrix },
] as const;


export const SUPERTILES = {
  H: {
    outline: [
      { x: -3.607305936073, y: 2.507123771686 },
      { x: 1.166666666667, y: 2.020725942164 },
      { x: 3.632420091324, y: 5.437374110519 },
      { x: 4.166666666667, y: -8.37157890325 },
      { x: -0.025114155251, y: -7.944497882205 },
      { x: -5.333333333333, y: 6.350852961086 },
    ] as const,
    hats: [
      { role: "hat-h", transform: [-0.25, 0.433012701892, -2.833333333333, -0.433012701892, -0.25, 7.21687836487] as Matrix },
      { role: "hat-h", transform: [-0.25, 0.433012701892, 0.166666666667, -0.433012701892, -0.25, 7.21687836487] as Matrix },
      { role: "hat-h", transform: [-0.25, -0.433012701892, -1.333333333333, 0.433012701892, -0.25, 8.082903768655] as Matrix },
      { role: "hat-h", transform: [-0.25, 0.433012701892, -1.333333333333, 0.433012701892, 0.25, 6.350852961086] as Matrix },
      { role: "hat-h", transform: [0.25, -0.433012701892, 4.666666666667, 0.433012701892, 0.25, -0.57735026919] as Matrix },
      { role: "hat-h", transform: [0.25, -0.433012701892, 1.666666666667, 0.433012701892, 0.25, -0.57735026919] as Matrix },
      { role: "hat-h", transform: [0.25, 0.433012701892, 3.166666666667, -0.433012701892, 0.25, -1.443375672974] as Matrix },
      { role: "hat-h", transform: [0.25, -0.433012701892, 3.166666666667, -0.433012701892, -0.25, 0.288675134595] as Matrix },
      { role: "hat-h", transform: [0.25, 0.433012701892, 4.666666666667, -0.433012701892, 0.25, -5.773502691896] as Matrix },
      { role: "hat-h", transform: [0.25, 0.433012701892, 6.166666666667, -0.433012701892, 0.25, -3.175426480543] as Matrix },
      { role: "hat-h", transform: [-0.5, -0.0, 4.666666666667, 0.0, -0.5, -4.041451884327] as Matrix },
      { role: "hat-h", transform: [-0.5, 0.0, 6.166666666667, 0.0, 0.5, -4.907477288112] as Matrix },
      { role: "hat-t", transform: [-1.083333333333, 1.299038105677, 1.833333333333, -1.299038105677, -1.083333333333, 3.175426480543] as Matrix },
      { role: "hat-p", transform: [0.25, -0.433012701892, 7.666666666667, 0.433012701892, 0.25, -5.773502691896] as Matrix },
      { role: "hat-p", transform: [0.5, 0.0, 6.166666666667, -0.0, 0.5, -6.639528095681] as Matrix },
      { role: "hat-f", transform: [-0.25, 0.433012701892, -4.333333333333, -0.433012701892, -0.25, 8.082903768655] as Matrix },
      { role: "hat-f", transform: [-0.5, 0.0, -2.833333333333, 0.0, -0.5, 8.948929172439] as Matrix },
      { role: "hat-p", transform: [0.5, 0.0, -1.333333333333, 0.0, 0.5, 4.618802153517] as Matrix },
      { role: "hat-p", transform: [0.25, 0.433012701892, -2.833333333333, -0.433012701892, 0.25, 5.484827557301] as Matrix },
      { role: "hat-f", transform: [-0.5, 0.0, 3.166666666667, 0.0, -0.5, 2.020725942164] as Matrix },
      { role: "hat-f", transform: [-0.25, -0.433012701892, 4.666666666667, 0.433012701892, -0.25, 1.154700538379] as Matrix },
      { role: "hat-p", transform: [-0.25, -0.433012701892, 1.666666666667, 0.433012701892, -0.25, -2.309401076759] as Matrix },
      { role: "hat-p", transform: [0.25, -0.433012701892, 1.666666666667, 0.433012701892, 0.25, -4.041451884327] as Matrix },
      { role: "hat-f", transform: [0.25, 0.433012701892, 3.166666666667, -0.433012701892, 0.25, -6.639528095681] as Matrix },
      { role: "hat-f", transform: [-0.25, 0.433012701892, 3.166666666667, -0.433012701892, -0.25, -4.907477288112] as Matrix },
    ] as const,
    children: [
      { type: "H", transform: [1.0, 0.0, -1.833333333333, 0.0, 1.0, 7.21687836487] as Matrix },
      { type: "H", transform: [-1.0, 0.0, 3.666666666667, 0.0, -1.0, -0.57735026919] as Matrix },
      { type: "H", transform: [0.5, -0.866025403784, 5.166666666667, 0.866025403784, 0.5, -4.907477288112] as Matrix },
      { type: "T", transform: [-2.166666666667, 2.598076211353, -0.333333333333, -2.598076211353, -2.166666666667, 0.57735026919] as Matrix },
      { type: "P", transform: [0.5, -0.866025403784, 7.666666666667, 0.866025403784, 0.5, -5.773502691896] as Matrix },
      { type: "F", transform: [-0.5, 0.866025403784, -4.433333333333, -0.866025403784, -0.5, 7.909698687898] as Matrix },
      { type: "P", transform: [1.0, 0.0, -1.333333333333, 0.0, 1.0, 4.618802153517] as Matrix },
      { type: "F", transform: [-1.0, 0.0, 2.966666666667, 0.0, -1.0, 2.020725942164] as Matrix },
      { type: "P", transform: [-0.5, -0.866025403784, 1.666666666667, 0.866025403784, -0.5, -2.309401076759] as Matrix },
      { type: "F", transform: [0.5, 0.866025403784, 3.266666666667, -0.866025403784, 0.5, -6.812733176438] as Matrix },
    ] as const,
  },
  T: {
    outline: [
      { x: -3.691780821918, y: -9.676548689774 },
      { x: 10.22602739726, y: 1.641098367902 },
      { x: -6.534246575342, y: 8.035450321872 },
    ] as const,
    hats: [
      { role: "hat-h", transform: [0.5, -0.0, -10.0, 0.0, 0.5, -2.309401076759] as Matrix },
      { role: "hat-h", transform: [0.5, 0.0, -11.5, -0.0, 0.5, 0.288675134595] as Matrix },
      { role: "hat-h", transform: [-0.25, 0.433012701892, -11.5, -0.433012701892, -0.25, -1.443375672974] as Matrix },
      { role: "hat-h", transform: [-0.25, -0.433012701892, -10.0, -0.433012701892, 0.25, -0.57735026919] as Matrix },
    ] as const,
    children: [
      { type: "H", transform: [-0.5, -0.866025403784, -10.5, 0.866025403784, -0.5, -1.443375672974] as Matrix },
    ] as const,
  },
  P: {
    outline: [
      { x: -1.5, y: -1.732050807569 },
      { x: 3.27397260274, y: -2.218448637092 },
      { x: 1.5, y: 1.732050807569 },
      { x: -3.27397260274, y: 2.218448637092 },
    ] as const,
    hats: [
      { role: "hat-f", transform: [0.25, 0.433012701892, -2.5, -0.433012701892, 0.25, 0.0] as Matrix },
      { role: "hat-f", transform: [-0.25, 0.433012701892, -2.5, -0.433012701892, -0.25, 1.732050807569] as Matrix },
      { role: "hat-h", transform: [0.25, 0.433012701892, -1.0, -0.433012701892, 0.25, 0.866025403784] as Matrix },
      { role: "hat-h", transform: [0.25, 0.433012701892, 0.5, -0.433012701892, 0.25, 3.464101615138] as Matrix },
      { role: "hat-h", transform: [-0.5, 0.0, -1.0, 0.0, -0.5, 2.598076211353] as Matrix },
      { role: "hat-h", transform: [-0.5, 0.0, 0.5, 0.0, 0.5, 1.732050807569] as Matrix },
      { role: "hat-p", transform: [0.25, -0.433012701892, 2.0, 0.433012701892, 0.25, 0.866025403784] as Matrix },
      { role: "hat-p", transform: [0.5, 0.0, 0.5, 0.0, 0.5, -0.0] as Matrix },
      { role: "hat-h", transform: [0.5, 0.0, 5.0, -0.0, 0.5, -0.866025403784] as Matrix },
      { role: "hat-h", transform: [0.5, 0.0, 3.5, -0.0, 0.5, 1.732050807569] as Matrix },
      { role: "hat-h", transform: [-0.25, 0.433012701892, 3.5, -0.433012701892, -0.25, -0.0] as Matrix },
      { role: "hat-h", transform: [-0.25, -0.433012701892, 5.0, -0.433012701892, 0.25, 0.866025403784] as Matrix },
      { role: "hat-f", transform: [-0.25, -0.433012701892, 6.5, 0.433012701892, -0.25, 1.732050807569] as Matrix },
      { role: "hat-f", transform: [0.25, -0.433012701892, 6.5, 0.433012701892, 0.25, -0.0] as Matrix },
    ] as const,
    children: [
      { type: "F", transform: [0.5, 0.866025403784, -2.4, -0.866025403784, 0.5, -0.173205080757] as Matrix },
      { type: "H", transform: [0.5, -0.866025403784, -0.5, 0.866025403784, 0.5, 1.732050807569] as Matrix },
      { type: "P", transform: [0.5, -0.866025403784, 2.0, 0.866025403784, 0.5, 0.866025403784] as Matrix },
      { type: "H", transform: [-0.5, -0.866025403784, 4.5, 0.866025403784, -0.5, -0.0] as Matrix },
      { type: "F", transform: [-0.5, -0.866025403784, 6.4, 0.866025403784, -0.5, 1.905255888326] as Matrix },
    ] as const,
  },
  F: {
    outline: [
      { x: 7.354794520548, y: 2.327591564692 },
      { x: -1.145205479452, y: 3.193616968476 },
      { x: -2.145205479452, y: -0.270484646661 },
      { x: 0.354794520548, y: -2.868560858015 },
      { x: -4.419178082192, y: -2.382163028492 },
    ] as const,
    hats: [
      { role: "hat-f", transform: [-0.25, -0.433012701892, 8.354794520548, 0.433012701892, -0.25, 0.595540757123] as Matrix },
      { role: "hat-f", transform: [0.25, -0.433012701892, 8.354794520548, 0.433012701892, 0.25, -1.136510050446] as Matrix },
      { role: "hat-h", transform: [-0.25, -0.433012701892, 6.854794520548, 0.433012701892, -0.25, -0.270484646661] as Matrix },
      { role: "hat-h", transform: [-0.25, -0.433012701892, 5.354794520548, 0.433012701892, -0.25, -2.868560858015] as Matrix },
      { role: "hat-h", transform: [0.5, -0.0, 6.854794520548, 0.0, 0.5, -2.00253545423] as Matrix },
      { role: "hat-h", transform: [0.5, 0.0, 5.354794520548, 0.0, -0.5, -1.136510050446] as Matrix },
      { role: "hat-p", transform: [-0.25, 0.433012701892, 3.854794520548, -0.433012701892, -0.25, -0.270484646661] as Matrix },
      { role: "hat-p", transform: [-0.5, 0.0, 5.354794520548, -0.0, -0.5, 0.595540757123] as Matrix },
      { role: "hat-h", transform: [-0.5, 0.0, 0.854794520548, -0.0, -0.5, 1.461566160907] as Matrix },
      { role: "hat-h", transform: [-0.5, 0.0, 2.354794520548, 0.0, -0.5, -1.136510050446] as Matrix },
      { role: "hat-h", transform: [0.25, -0.433012701892, 2.354794520548, 0.433012701892, 0.25, 0.595540757123] as Matrix },
      { role: "hat-h", transform: [0.25, 0.433012701892, 0.854794520548, 0.433012701892, -0.25, -0.270484646661] as Matrix },
      { role: "hat-f", transform: [-0.5, 0.0, 0.854794520548, 0.0, -0.5, 3.193616968476] as Matrix },
      { role: "hat-f", transform: [-0.25, -0.433012701892, 2.354794520548, 0.433012701892, -0.25, 2.327591564692] as Matrix },
      { role: "hat-f", transform: [0.25, 0.433012701892, -0.645205479452, -0.433012701892, 0.25, -1.136510050446] as Matrix },
      { role: "hat-f", transform: [-0.25, 0.433012701892, -0.645205479452, -0.433012701892, -0.25, 0.595540757123] as Matrix },
    ] as const,
    children: [
      { type: "F", transform: [-0.5, -0.866025403784, 8.254794520548, 0.866025403784, -0.5, 0.76874583788] as Matrix },
      { type: "H", transform: [-0.5, 0.866025403784, 6.354794520548, -0.866025403784, -0.5, -1.136510050446] as Matrix },
      { type: "P", transform: [-0.5, 0.866025403784, 3.854794520548, -0.866025403784, -0.5, -0.270484646661] as Matrix },
      { type: "H", transform: [0.5, 0.866025403784, 1.354794520548, -0.866025403784, 0.5, 0.595540757123] as Matrix },
      { type: "F", transform: [-1.0, 0.0, 0.654794520548, 0.0, -1.0, 3.193616968476] as Matrix },
      { type: "F", transform: [0.5, 0.866025403784, -0.545205479452, -0.866025403784, 0.5, -1.309715131203] as Matrix },
    ] as const,
  },
} as const;

type SuperTileType = keyof typeof SUPERTILES;

const SUPERTILE_ROLE = {
  H: "supertile-h",
  T: "supertile-t",
  P: "supertile-p",
  F: "supertile-f",
} as const;

type SuperTileRole = (typeof SUPERTILE_ROLE)[SuperTileType];

const ROLE_TO_SUPERTILE: Record<SuperTileRole, SuperTileType> = {
  "supertile-h": "H",
  "supertile-t": "T",
  "supertile-p": "P",
  "supertile-f": "F",
};

const toRole = (type: SuperTileType): SuperTileRole => SUPERTILE_ROLE[type];

interface ActiveSuperTile {
  type: SuperTileType;
  transform: Matrix;
}

const expandLayer = (layer: readonly ActiveSuperTile[]): ActiveSuperTile[] => {
  const result: ActiveSuperTile[] = [];
  for (const tile of layer) {
    const def = SUPERTILES[tile.type];
    for (const child of def.children) {
      result.push({
        type: child.type as SuperTileType,
        transform: multiplyMatrices(tile.transform, child.transform),
      });
    }
  }
  return result;
};

const projectHats = (tile: ActiveSuperTile): EinsteinPolygon[] => {
  const def = SUPERTILES[tile.type];
  return def.hats.map((hat) => {
    const transform = multiplyMatrices(tile.transform, hat.transform);
    return {
      role: hat.role,
      points: transformOutline(HAT_OUTLINE, transform),
    };
  });
};

const projectSuperTileOutline = (tile: ActiveSuperTile): EinsteinPolygon => {
  const def = SUPERTILES[tile.type];
  return {
    role: toRole(tile.type),
    points: transformOutline(def.outline, tile.transform),
  };
};

const projectSuperTileOutlineByRole = (
  role: SuperTileRole,
  transform: Matrix,
): EinsteinPolygon => {
  const type = ROLE_TO_SUPERTILE[role];
  const def = SUPERTILES[type];
  return {
    role,
    points: transformOutline(def.outline, transform),
  };
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

  const polygons: EinsteinPolygon[] = [];

  if (iterations === 1) {
    if (includeSupertiles) {
      for (const tile of INITIAL_PATCH) {
        polygons.push(projectSuperTileOutlineByRole(tile.role, tile.transform));
      }
    }

    for (const hat of SEED_HATS) {
      polygons.push({
        role: hat.role,
        points: transformOutline(HAT_OUTLINE, hat.transform),
      });
    }

    return polygons;
  }

  const layers: ActiveSuperTile[][] = [ROOT_PATCH.map((tile) => ({ ...tile }))];

  const targetDepth = iterations - 1;
  for (let depth = 1; depth < targetDepth; depth += 1) {
    const previous = layers[layers.length - 1];
    const next = expandLayer(previous);
    layers.push(next);
  }

  if (includeSupertiles) {
    for (const tile of INITIAL_PATCH) {
      polygons.push(projectSuperTileOutlineByRole(tile.role, tile.transform));
    }
    layers.forEach((layer) => {
      for (const tile of layer) {
        polygons.push(projectSuperTileOutline(tile));
      }
    });
  }

  const finalLayer = layers[layers.length - 1];
  for (const tile of finalLayer) {
    polygons.push(...projectHats(tile));
  }

  return polygons;
};
