/**
 * What stands on the gallery floor between the visitor and the wall: brass
 * rope stands, a leather bench, and potted plants - a fiddle-leaf fig and a
 * snake plant, each built leaf by leaf.
 */

import * as THREE from "three";

import { canvasTexture, paintFigLeaf, paintSnakeLeaf, seeded } from "./museum-textures";

/** The shared materials and the box-maker the props are built with. */
export type PropKit = {
  scene: THREE.Scene;
  brass: THREE.Material;
  velvet: THREE.Material;
  leather: THREE.Material;
  black: THREE.Material;
  box: (
    w: number,
    h: number,
    d: number,
    mat: THREE.Material,
    x?: number,
    y?: number,
    z?: number,
    parent?: THREE.Object3D,
  ) => THREE.Mesh;
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Two brass posts with a red velvet rope slung between them. */
export function ropeStands(kit: PropKit, x: number, z: number) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  kit.scene.add(g);
  for (const px of [-0.9, 0.9]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.95, 12), kit.brass);
    post.position.set(px, 0.475, 0);
    g.add(post);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.04, 24), kit.brass);
    base.position.set(px, 0.02, 0);
    g.add(base);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 12), kit.brass);
    ball.position.set(px, 0.98, 0);
    g.add(ball);
  }
  const curve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(-0.9, 0.92, 0),
    new THREE.Vector3(0, 0.55, 0),
    new THREE.Vector3(0.9, 0.92, 0),
  );
  g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 30, 0.028, 10), kit.velvet));
}

/** A gallery bench: a leather seat on a dark frame. */
export function bench(kit: PropKit, x: number, z: number) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  kit.scene.add(g);
  kit.box(1.9, 0.12, 0.5, kit.leather, 0, 0.46, 0, g);
  kit.box(1.95, 0.05, 0.54, kit.black, 0, 0.39, 0, g);
  for (const [lx, lz] of [
    [-0.8, -0.18],
    [0.8, -0.18],
    [-0.8, 0.18],
    [0.8, 0.18],
  ]) {
    kit.box(0.06, 0.38, 0.06, kit.black, lx, 0.19, lz, g);
  }
}

/** A leaf mesh from a flat shape, bent back and folded on its midrib. */
function leafGeometry(flat: THREE.Shape, curl: number, fold: number, segs = 14) {
  const geo = new THREE.ShapeGeometry(flat, segs);
  geo.computeBoundingBox();
  const bb = geo.boundingBox!;
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  const H = bb.max.y - bb.min.y;
  const W = bb.max.x - bb.min.x;
  for (let k = 0; k < pos.count; k++) {
    const x = pos.getX(k);
    const y = pos.getY(k);
    const t = (y - bb.min.y) / H;
    uv.setXY(k, (x - bb.min.x) / W, t);
    pos.setZ(k, curl * t * t * H + fold * Math.abs(x));
  }
  geo.computeVertexNormals();
  return geo;
}

/** Everything the two plants share, built once per room. */
export function plantKit(anisotropy: number) {
  const figShape = new THREE.Shape();
  figShape.moveTo(0, 0);
  figShape.bezierCurveTo(0.05, 0.02, 0.04, 0.09, 0.075, 0.15);
  figShape.bezierCurveTo(0.11, 0.21, 0.1, 0.27, 0.03, 0.3);
  figShape.quadraticCurveTo(0, 0.315, -0.03, 0.3);
  figShape.bezierCurveTo(-0.1, 0.27, -0.11, 0.21, -0.075, 0.15);
  figShape.bezierCurveTo(-0.04, 0.09, -0.05, 0.02, 0, 0);

  const swordShape = new THREE.Shape();
  swordShape.moveTo(-0.03, 0);
  swordShape.bezierCurveTo(-0.045, 0.25, -0.04, 0.5, -0.005, 0.72);
  swordShape.lineTo(0, 0.75);
  swordShape.lineTo(0.005, 0.72);
  swordShape.bezierCurveTo(0.04, 0.5, 0.045, 0.25, 0.03, 0);
  swordShape.lineTo(-0.03, 0);

  return {
    figLeafGeos: [
      leafGeometry(figShape, -0.18, 0.35),
      leafGeometry(figShape, -0.32, 0.5),
      leafGeometry(figShape, -0.08, 0.25),
    ],
    swordGeos: [leafGeometry(swordShape, 0.06, 0.5, 18), leafGeometry(swordShape, 0.12, 0.6, 18)],
    figLeaf: new THREE.MeshStandardMaterial({
      map: canvasTexture(256, 512, paintFigLeaf, anisotropy),
      roughness: 0.4,
      side: THREE.DoubleSide,
    }),
    snakeLeaf: new THREE.MeshStandardMaterial({
      map: canvasTexture(128, 512, paintSnakeLeaf, anisotropy),
      roughness: 0.5,
      side: THREE.DoubleSide,
    }),
    bark: new THREE.MeshStandardMaterial({ color: 0x5b4330, roughness: 0.9 }),
    potDark: new THREE.MeshStandardMaterial({ color: 0x3a3631, roughness: 0.3, metalness: 0.1 }),
    potLight: new THREE.MeshStandardMaterial({ color: 0xe9e3d7, roughness: 0.32 }),
    soil: new THREE.MeshStandardMaterial({ color: 0x2a1c12, roughness: 1 }),
    pebble: new THREE.MeshStandardMaterial({ color: 0x9a948a, roughness: 0.8 }),
  };
}

export type PlantKit = ReturnType<typeof plantKit>;

/**
 * A glazed pot, turned like on a potter's wheel from a side profile, with a
 * brass band at the neck, a brass foot, soil and a few pebbles.
 *
 * @returns The height of the soil, where the plant goes in.
 */
function makePot(kit: PropKit, pk: PlantKit, parent: THREE.Object3D, h: number, r: number, mat: THREE.Material) {
  const profile = [
    [0, 0],
    [r * 0.56, 0],
    [r * 0.6, h * 0.03],
    [r * 0.84, h * 0.18],
    [r * 0.98, h * 0.42],
    [r, h * 0.58],
    [r * 0.95, h * 0.78],
    [r * 0.86, h * 0.9],
    [r * 0.88, h * 0.96],
    [r * 0.9, h],
    [r * 0.83, h],
    [r * 0.8, h * 0.95],
  ].map(([px, py]) => new THREE.Vector2(px, py));
  parent.add(new THREE.Mesh(new THREE.LatheGeometry(profile, 48), mat));
  const band = new THREE.Mesh(new THREE.TorusGeometry(r * 0.88, 0.007, 8, 48), kit.brass);
  band.rotation.x = Math.PI / 2;
  band.position.y = h * 0.9;
  parent.add(band);
  const saucer = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.72, r * 0.66, 0.025, 40), kit.brass);
  saucer.position.y = 0.0125;
  parent.add(saucer);
  const soil = new THREE.Mesh(new THREE.CircleGeometry(r * 0.82, 32), pk.soil);
  soil.rotation.x = -Math.PI / 2;
  soil.position.y = h * 0.93;
  parent.add(soil);
  const rr = seeded(Math.round(r * 1000));
  for (let k = 0; k < 9; k++) {
    const pb = new THREE.Mesh(new THREE.SphereGeometry(0.018 + rr() * 0.012, 8, 6), pk.pebble);
    const a = rr() * Math.PI * 2;
    const d = rr() * r * 0.7;
    pb.position.set(Math.cos(a) * d, h * 0.9 + 0.006, Math.sin(a) * d);
    pb.scale.y = 0.55;
    parent.add(pb);
  }
  return h * 0.93;
}

/**
 * A potted plant.
 *
 * `fig` is a tall fiddle-leaf fig, a trunk and four branches with big leaves
 * spiralling up each; `snake` is a snake plant, upright sword leaves.
 */
export function plant(kit: PropKit, pk: PlantKit, x: number, z: number, s: number, type: "fig" | "snake") {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.scale.setScalar(s);
  kit.scene.add(g);
  const r = seeded(5 + Math.round(Math.abs(x) * 10));

  if (type === "snake") {
    const soilY = makePot(kit, pk, g, 0.42, 0.2, pk.potLight);
    for (let k = 0; k < 11; k++) {
      const leaf = new THREE.Mesh(pk.swordGeos[k % 2], pk.snakeLeaf);
      const a = (k / 11) * Math.PI * 2 + r() * 0.5;
      const d = 0.03 + r() * 0.08;
      leaf.position.set(Math.cos(a) * d, soilY - 0.02, Math.sin(a) * d);
      leaf.rotation.order = "YXZ";
      leaf.rotation.y = -a + Math.PI / 2 + (r() - 0.5) * 0.8;
      leaf.rotation.x = 0.05 + r() * 0.22;
      leaf.scale.setScalar(0.75 + r() * 0.5);
      g.add(leaf);
    }
    return;
  }

  const soilY = makePot(kit, pk, g, 0.5, 0.26, pk.potDark);
  const trunk = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, soilY - 0.02, 0),
    new THREE.Vector3(0.02, soilY + 0.25, 0.01),
    new THREE.Vector3(-0.01, soilY + 0.5, 0.02),
    new THREE.Vector3(0.01, soilY + 0.62, 0),
  ]);
  g.add(new THREE.Mesh(new THREE.TubeGeometry(trunk, 20, 0.024, 8), pk.bark));

  const stems: THREE.Curve<THREE.Vector3>[] = [trunk];
  for (let b = 0; b < 4; b++) {
    const a = b * (Math.PI / 2) + r() * 0.6;
    const reach = 0.2 + r() * 0.14;
    const rise = 0.45 + r() * 0.35;
    const start = trunk.getPoint(0.82 + r() * 0.18);
    const curve = new THREE.CatmullRomCurve3([
      start,
      new THREE.Vector3(start.x + Math.cos(a) * reach * 0.5, start.y + rise * 0.45, start.z + Math.sin(a) * reach * 0.5),
      new THREE.Vector3(start.x + Math.cos(a) * reach, start.y + rise, start.z + Math.sin(a) * reach),
    ]);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 16, 0.014, 6), pk.bark));
    stems.push(curve);
  }
  stems.forEach((curve, si) => {
    const count = si === 0 ? 4 : 9;
    for (let k = 0; k < count; k++) {
      const t = si === 0 ? 0.55 + k * 0.1 : 0.15 + (k / count) * 0.85;
      const leaf = new THREE.Mesh(pk.figLeafGeos[(k + si) % 3], pk.figLeaf);
      leaf.position.copy(curve.getPoint(t));
      leaf.rotation.order = "YXZ";
      leaf.rotation.y = k * 2.4 + si * 1.3 + r() * 0.5;
      leaf.rotation.x = lerp(1.15, 0.45, t) + (r() - 0.5) * 0.35;
      leaf.rotation.z = (r() - 0.5) * 0.7;
      leaf.scale.setScalar(lerp(1.55, 1.05, t) * (0.85 + r() * 0.3));
      g.add(leaf);
    }
  });
}
