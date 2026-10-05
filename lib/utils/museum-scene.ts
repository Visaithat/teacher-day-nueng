/**
 * The museum, in three.js: a stone front with a double door at dusk, and
 * behind it one long gallery wall with a portrait every few metres, each under
 * its own spotlight.
 *
 * This builds the room once and hands back three things - draw it for a given
 * state, fit it to a window, put it all away. It knows nothing about scrolling:
 * the state it is drawn from is written by the timeline in `use-museum.ts`.
 *
 * Loaded on demand. three.js is most of the weight of this scene, so nothing
 * imports this module statically - the hook asks for it when the credits open.
 */

import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

import {
  CREDITS_COLORS,
  CREDITS_FRAMES,
  CREDITS_LIGHT,
  CREDITS_PEOPLE,
  CREDITS_ROOM,
  CREDITS_SHINE_S,
  CREDITS_WORDS,
} from "@/lib/constants/credits";
import type { CreditPerson, MuseumFonts, MuseumRoom, MuseumState } from "@/types/credits";
import { bench, plant, plantKit, ropeStands, type PropKit } from "./museum-props";
import {
  canvasTexture,
  paintBeamFade,
  paintHalo,
  paintMote,
  paintParquet,
  paintPlate,
  paintShine,
  paintSign,
  paintSky,
  paintStandIn,
  paintStone,
  paintWallTitle,
  paintWoodGrain,
} from "./museum-textures";
import { photoLabel } from "./museum-stand-in";

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Crop a photo's texture the way `object-fit: cover` would. */
function coverFit(tex: THREE.Texture, imgW: number, imgH: number, planeW: number, planeH: number) {
  const ia = imgW / imgH;
  const pa = planeW / planeH;
  tex.repeat.set(1, 1);
  tex.offset.set(0, 0);
  if (ia > pa) {
    tex.repeat.x = pa / ia;
    tex.offset.x = (1 - tex.repeat.x) / 2;
  } else {
    tex.repeat.y = ia / pa;
    tex.offset.y = (1 - tex.repeat.y) / 2;
  }
}

type Exhibit = {
  group: THREE.Group;
  /** The height it hangs at, once it has risen into place. */
  y: number;
  mats: THREE.Material[];
  haloMat: THREE.MeshBasicMaterial;
  shineTex: THREE.Texture;
  beamMat: THREE.MeshBasicMaterial;
  focus: number;
  /** When the plate's shine started, in clock seconds, or null before. */
  shineAt: number | null;
};

type RoomLight = {
  light: THREE.Light;
  base: number;
  bulb: THREE.MeshStandardMaterial | null;
  x: number;
  order: number;
  exhibit?: Exhibit;
};

/**
 * Build the museum onto a canvas.
 *
 * Throws if WebGL is not there to be had, which is the caller's cue to show
 * the plain gallery instead.
 */
export function buildMuseum(canvas: HTMLCanvasElement, fonts: MuseumFonts, width: number, height: number): MuseumRoom {
  const people: readonly CreditPerson[] = CREDITS_PEOPLE;
  const N = people.length;
  const C = CREDITS_COLORS;
  const { frameSpacing: SPACING, wallZ: WALL_Z, height: ROOM_H, frameY: FRAME_Y } = CREDITS_ROOM;
  const { width: DOOR_W, height: DOOR_H } = CREDITS_ROOM.door;
  const fx = (i: number) => SPACING * (i + 1);
  const ROOM_X0 = -7;
  const ROOM_X1 = fx(N - 1) + 8;
  /* The chair rail along the gallery wall, and the gap a plate keeps above it. */
  const RAIL_Y = 0.7;
  const RAIL_CLEAR = 0.09;

  /* --- renderer, scene, camera ------------------------------------------- */

  const isSmall = Math.min(width, height) < 600;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isSmall ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = CREDITS_LIGHT.exposure;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(C.sky);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTarget = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = envTarget.texture;
  scene.environmentIntensity = CREDITS_LIGHT.outside;

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.05, 200);
  /* How far back from the wall the camera stands; phones stand further. */
  let viewDist = 4.6;

  const aniso = renderer.capabilities.getMaxAnisotropy();
  const tex = (w: number, h: number, paint: Parameters<typeof canvasTexture>[2], color = true) =>
    canvasTexture(w, h, paint, aniso, color);

  const shineTexture = tex(512, 128, paintShine);
  const haloTexture = tex(256, 256, paintHalo);
  const beamFade = tex(4, 256, paintBeamFade, false);
  const moteTexture = tex(64, 64, paintMote);

  /* --- materials ---------------------------------------------------------- */

  const M = {
    wall: new THREE.MeshStandardMaterial({ color: C.wall, roughness: 0.95 }),
    ceiling: new THREE.MeshStandardMaterial({ color: 0xf7f3ec, roughness: 1 }),
    baseboard: new THREE.MeshStandardMaterial({ color: 0x2e2219, roughness: 0.6 }),
    trim: new THREE.MeshStandardMaterial({ color: 0xe6dccb, roughness: 0.8 }),
    rail: new THREE.MeshStandardMaterial({ color: 0x2b2420, roughness: 0.5, metalness: 0.4 }),
    gold: new THREE.MeshStandardMaterial({ color: C.gold, metalness: 1, roughness: 0.32 }),
    goldDark: new THREE.MeshStandardMaterial({ color: 0xa8841f, metalness: 1, roughness: 0.45 }),
    brass: new THREE.MeshStandardMaterial({ color: 0xc9a23a, metalness: 1, roughness: 0.3 }),
    darkWood: new THREE.MeshStandardMaterial({ map: tex(256, 256, paintWoodGrain("#4a2f1e", "#1c1008")), roughness: 0.55 }),
    walnut: new THREE.MeshStandardMaterial({ map: tex(256, 256, paintWoodGrain("#80532f", "#3c2412")), roughness: 0.55 }),
    black: new THREE.MeshStandardMaterial({ color: 0x1c1916, roughness: 0.45 }),
    mat: new THREE.MeshStandardMaterial({ color: 0xf6f1e6, roughness: 0.95 }),
    door: new THREE.MeshStandardMaterial({ map: tex(256, 256, paintWoodGrain("#6b4329", "#3a2212")), roughness: 0.6 }),
    doorPanel: new THREE.MeshStandardMaterial({ color: 0x4a2c18, roughness: 0.6 }),
    stoneTrim: new THREE.MeshStandardMaterial({ color: 0xe3d7c3, roughness: 0.85 }),
    column: new THREE.MeshStandardMaterial({ color: 0xeee4d2, roughness: 0.8 }),
    pavement: new THREE.MeshStandardMaterial({ color: 0x8f8170, roughness: 0.95 }),
    step: new THREE.MeshStandardMaterial({ color: 0xd9cdb6, roughness: 0.9 }),
    velvet: new THREE.MeshStandardMaterial({ color: 0x8e1b24, roughness: 0.75 }),
    leather: new THREE.MeshStandardMaterial({ color: 0x4b2c1e, roughness: 0.55 }),
  };

  function box(
    w: number,
    h: number,
    d: number,
    mat: THREE.Material | THREE.Material[],
    x = 0,
    y = 0,
    z = 0,
    parent: THREE.Object3D = scene,
  ) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    parent.add(m);
    return m;
  }

  /* --- outside: the front, the steps, the columns, the sign, the doors ----- */

  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(90, 32, 16),
    new THREE.MeshBasicMaterial({ map: tex(16, 512, paintSky), side: THREE.BackSide, fog: false }),
  );
  sky.position.set(0, -20, 0);
  scene.add(sky);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(120, 60), M.pavement);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, -0.45, 30.3);
  scene.add(ground);

  /* The front wall, with the doorway cut out of it. */
  const stoneTex = tex(512, 512, paintStone);
  stoneTex.wrapS = stoneTex.wrapT = THREE.RepeatWrapping;
  stoneTex.repeat.set(0.5, 0.5);
  const frontShape = new THREE.Shape();
  frontShape.moveTo(-14, -0.45);
  frontShape.lineTo(14, -0.45);
  frontShape.lineTo(14, 8);
  frontShape.lineTo(-14, 8);
  frontShape.lineTo(-14, -0.45);
  const doorway = new THREE.Path();
  doorway.moveTo(-DOOR_W / 2, 0);
  doorway.lineTo(-DOOR_W / 2, DOOR_H);
  doorway.lineTo(DOOR_W / 2, DOOR_H);
  doorway.lineTo(DOOR_W / 2, 0);
  doorway.lineTo(-DOOR_W / 2, 0);
  frontShape.holes.push(doorway);
  const front = new THREE.Mesh(
    new THREE.ShapeGeometry(frontShape),
    new THREE.MeshStandardMaterial({ map: stoneTex, roughness: 0.9 }),
  );
  front.position.z = 0.3;
  scene.add(front);

  /* The stone around the door, and the depth of the wall it passes through. */
  box(DOOR_W + 0.5, 0.25, 0.2, M.stoneTrim, 0, DOOR_H + 0.125, 0.4);
  box(0.25, DOOR_H, 0.2, M.stoneTrim, -DOOR_W / 2 - 0.125, DOOR_H / 2, 0.4);
  box(0.25, DOOR_H, 0.2, M.stoneTrim, DOOR_W / 2 + 0.125, DOOR_H / 2, 0.4);
  box(0.05, DOOR_H, 0.7, M.trim, -DOOR_W / 2 - 0.02, DOOR_H / 2, -0.05);
  box(0.05, DOOR_H, 0.7, M.trim, DOOR_W / 2 + 0.02, DOOR_H / 2, -0.05);
  box(DOOR_W, 0.05, 0.7, M.trim, 0, DOOR_H + 0.02, -0.05);

  /* The cornice, and four columns. */
  box(28, 0.5, 0.6, M.stoneTrim, 0, 7.5, 0.5);
  box(28, 0.2, 0.8, M.stoneTrim, 0, 7.2, 0.5);
  for (const x of [-3.6, -2.5, 2.5, 3.6]) {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.3, 5.9, 24), M.column);
    col.position.set(x, 2.5, 0.75);
    scene.add(col);
    box(0.8, 0.22, 0.8, M.stoneTrim, x, 5.55, 0.75);
    box(0.8, 0.22, 0.8, M.stoneTrim, x, -0.34, 0.75);
  }

  /* Three steps down from the door. */
  for (let s = 0; s < 3; s++) {
    box(5 + s * 1.6, 0.15, 0.45, M.step, 0, -0.075 - s * 0.15, 0.55 + s * 0.45);
    box(5 + s * 1.6, 0.45 - s * 0.15, 0.45, M.step, 0, -0.45 + (0.45 - s * 0.15) / 2, 0.55 + s * 0.45);
  }

  const signFace = new THREE.MeshStandardMaterial({
    map: tex(1024, 220, paintSign(CREDITS_WORDS.museumName, fonts)),
    roughness: 0.5,
    metalness: 0.2,
  });
  box(3.4, 0.73, 0.08, [M.black, M.black, M.black, M.black, signFace, M.black], 0, DOOR_H + 1.0, 0.45);

  /* A lantern either side of the door. */
  for (const x of [-1.9, 1.9]) {
    box(0.05, 0.4, 0.05, M.black, x, 2.95, 0.42);
    box(
      0.26,
      0.42,
      0.26,
      new THREE.MeshStandardMaterial({ color: 0x2d241c, emissive: 0xffc46b, emissiveIntensity: 2.2 }),
      x,
      2.6,
      0.5,
    );
    const pl = new THREE.PointLight(0xffc27a, 3, 6, 2);
    pl.position.set(x, 2.6, 0.9);
    scene.add(pl);
  }

  const dusk = new THREE.DirectionalLight(0xffd7b0, 0.6);
  dusk.position.set(-6, 10, 14);
  scene.add(dusk);

  /** One leaf of the double door, turning on its hinge. `side` -1 left, 1 right. */
  function makeLeaf(side: number) {
    const pivot = new THREE.Group();
    pivot.position.set((side * DOOR_W) / 2, 0, 0.12);
    const w = DOOR_W / 2;
    const leaf = new THREE.Group();
    leaf.position.x = (-side * w) / 2;
    pivot.add(leaf);
    box(w - 0.02, DOOR_H - 0.02, 0.08, M.door, 0, DOOR_H / 2, 0, leaf);
    for (const [y, hh] of [
      [DOOR_H * 0.72, 1.0],
      [DOOR_H * 0.28, 1.2],
    ]) {
      box(w * 0.66, hh, 0.02, M.doorPanel, 0, y, 0.05, leaf);
      box(w * 0.66, hh, 0.02, M.doorPanel, 0, y, -0.05, leaf);
    }
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 12), M.brass);
    handle.position.set(-side * (w / 2 - 0.12), DOOR_H * 0.47, 0.08);
    leaf.add(handle);
    scene.add(pivot);
    return pivot;
  }
  const leafL = makeLeaf(-1);
  const leafR = makeLeaf(1);

  /* --- inside: the gallery ------------------------------------------------ */

  const roomW = ROOM_X1 - ROOM_X0;
  const roomCX = (ROOM_X0 + ROOM_X1) / 2;
  const parquet = tex(1024, 1024, paintParquet);
  parquet.wrapS = parquet.wrapT = THREE.RepeatWrapping;
  parquet.repeat.set(roomW / 3.2, 10 / 3.2);
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(roomW, 10),
    new THREE.MeshStandardMaterial({ map: parquet, roughness: 0.42, metalness: 0.05 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(roomCX, 0, -5);
  scene.add(floor);

  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(roomW, 10), M.ceiling);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(roomCX, ROOM_H, -5);
  scene.add(ceiling);

  box(roomW, ROOM_H, 0.2, M.wall, roomCX, ROOM_H / 2, WALL_Z - 0.1);
  box(0.2, ROOM_H, 10, M.wall, ROOM_X0 - 0.1, ROOM_H / 2, -5);
  box(0.2, ROOM_H, 10, M.wall, ROOM_X1 + 0.1, ROOM_H / 2, -5);
  box(ROOM_X1 - DOOR_W / 2, ROOM_H, 0.2, M.wall, (DOOR_W / 2 + ROOM_X1) / 2, ROOM_H / 2, 0.1);
  box(-DOOR_W / 2 - ROOM_X0, ROOM_H, 0.2, M.wall, (ROOM_X0 - DOOR_W / 2) / 2, ROOM_H / 2, 0.1);
  box(DOOR_W, ROOM_H - DOOR_H, 0.2, M.wall, 0, (ROOM_H + DOOR_H) / 2, 0.1);

  box(roomW, 0.14, 0.03, M.baseboard, roomCX, 0.07, WALL_Z + 0.015);
  box(roomW, 0.05, 0.04, M.trim, roomCX, RAIL_Y, WALL_Z + 0.02);
  box(roomW, 0.12, 0.08, M.trim, roomCX, ROOM_H - 0.06, WALL_Z + 0.04);
  box(roomW, 0.04, 0.04, M.rail, roomCX, ROOM_H - 0.12, -6.2);

  const title = new THREE.Mesh(
    new THREE.PlaneGeometry(4.4, 1.2),
    new THREE.MeshStandardMaterial({
      map: tex(2048, 560, paintWallTitle(CREDITS_WORDS.wallTitle, CREDITS_WORDS.wallSubtitle, fonts)),
      transparent: true,
      roughness: 1,
    }),
  );
  title.position.set(0, 2.3, WALL_Z + 0.01);
  scene.add(title);

  /* --- the lights inside -------------------------------------------------- */

  const warmGlowAtDoor = new THREE.PointLight(0xffc27a, 25, 0, 2);
  warmGlowAtDoor.position.set(0, 2.4, -1.4);
  scene.add(warmGlowAtDoor);

  /* Every light that goes out at the end. */
  const roomLights: RoomLight[] = [];
  const lampHeadGeo = new THREE.CylinderGeometry(0.07, 0.11, 0.22, 16);

  function addLampHead(x: number, z: number, target: THREE.Vector3) {
    const bulbMat = new THREE.MeshStandardMaterial({ color: 0x111111, emissive: C.light, emissiveIntensity: 3 });
    const head = new THREE.Mesh(lampHeadGeo, M.rail);
    head.position.set(x, ROOM_H - 0.3, z);
    head.lookAt(target);
    head.rotateX(Math.PI / 2);
    scene.add(head);
    const bulb = new THREE.Mesh(new THREE.CircleGeometry(0.08, 16), bulbMat);
    bulb.position.set(x, ROOM_H - 0.42, z);
    bulb.lookAt(target);
    scene.add(bulb);
    return bulbMat;
  }

  /* A soft wash along the ceiling track. */
  for (let x = ROOM_X0 + 3; x < ROOM_X1; x += SPACING) {
    const at = x + SPACING / 2;
    const pl = new THREE.PointLight(C.light, 0.9, 0, 2);
    pl.position.set(at, 3.7, -5.5);
    scene.add(pl);
    const bulb = addLampHead(at, -6.2, new THREE.Vector3(at, 0, -10));
    roomLights.push({ light: pl, base: 0.9, bulb, x: at, order: -1 });
  }

  const titleSpot = new THREE.SpotLight(C.light, 22, 0, 0.36, 0.55, 2);
  titleSpot.position.set(0, ROOM_H - 0.4, -6.2);
  titleSpot.target.position.set(0, 2.2, WALL_Z);
  scene.add(titleSpot, titleSpot.target);
  addLampHead(0, -6.2, titleSpot.target.position);
  roomLights.push({ light: titleSpot, base: 22, bulb: null, x: 0, order: -1 });

  /* --- the portraits ------------------------------------------------------ */

  let disposed = false;
  const photoTextures: THREE.Texture[] = [];

  function makeExhibit(p: CreditPerson, i: number): Exhibit {
    const st = CREDITS_FRAMES[p.frame];
    const fw = p.size[0] / 20;
    const fh = p.size[1] / 20;
    const group = new THREE.Group();
    const x = fx(i);
    /* Hung at the common height, unless the frame is tall enough that its
       plate would sink behind the chair rail - then just high enough to clear
       it. */
    const plateW = clamp(fw * 0.62, 0.9, 1.3);
    const plateH = plateW * 0.25;
    const y = Math.max(FRAME_Y, RAIL_Y + RAIL_CLEAR + plateH + 0.12 + fh / 2);
    group.position.set(x, y, WALL_Z);
    scene.add(group);
    const mats: THREE.Material[] = [];
    const own = (m: THREE.Material) => {
      const c = m.clone();
      c.transparent = true;
      mats.push(c);
      return c;
    };

    const haloMat = new THREE.MeshBasicMaterial({ map: haloTexture, transparent: true, depthWrite: false, opacity: 0.6 });
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(fw * 1.35, fh * 1.3), haloMat);
    halo.position.set(0, -0.08, 0.005);
    group.add(halo);

    /* The moulding: four bars. */
    const b = st.rim;
    const d = st.depth;
    const outerMat = own(M[st.outer]);
    box(fw, b, d, outerMat, 0, fh / 2 - b / 2, d / 2, group);
    box(fw, b, d, outerMat, 0, -fh / 2 + b / 2, d / 2, group);
    box(b, fh - 2 * b, d, outerMat, -fw / 2 + b / 2, 0, d / 2, group);
    box(b, fh - 2 * b, d, outerMat, fw / 2 - b / 2, 0, d / 2, group);
    if (st.lip) {
      /* A thin inner lip in a second colour. */
      const lipMat = own(M[st.lip]);
      const l = 0.025;
      const iw = fw - 2 * b;
      const ih = fh - 2 * b;
      box(iw, l, d * 0.7, lipMat, 0, ih / 2 - l / 2, d * 0.35, group);
      box(iw, l, d * 0.7, lipMat, 0, -ih / 2 + l / 2, d * 0.35, group);
      box(l, ih, d * 0.7, lipMat, -iw / 2 + l / 2, 0, d * 0.35, group);
      box(l, ih, d * 0.7, lipMat, iw / 2 - l / 2, 0, d * 0.35, group);
    }
    if (p.frame === "gold") {
      /* A raised bead round the middle, for the ornate one. */
      const bead = own(M.gold);
      const r = b * 0.5;
      const mw = fw - b;
      const mh = fh - b;
      for (const [bx, by, len, horiz] of [
        [0, mh / 2, mw, true],
        [0, -mh / 2, mw, true],
        [-mw / 2, 0, mh, false],
        [mw / 2, 0, mh, false],
      ] as const) {
        const c = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.35, r * 0.35, len, 10), bead);
        c.rotation.z = horiz ? Math.PI / 2 : 0;
        c.position.set(bx, by, d);
        group.add(c);
      }
    }

    /* The paper inside the frame, and the photo on it. */
    const innerW = fw - 2 * b;
    const innerH = fh - 2 * b;
    const mat = new THREE.Mesh(new THREE.PlaneGeometry(innerW, innerH), own(M.mat));
    mat.position.z = 0.02;
    group.add(mat);
    const pw = innerW - 2 * st.mat;
    const ph = innerH - 2 * st.mat;
    const photoMat = new THREE.MeshStandardMaterial({
      map: tex(400, 500, paintStandIn(i, photoLabel(p.photo))),
      roughness: 0.6,
      transparent: true,
    });
    mats.push(photoMat);
    const photo = new THREE.Mesh(new THREE.PlaneGeometry(pw, ph), photoMat);
    photo.position.z = 0.025;
    group.add(photo);
    coverFit(photoMat.map!, 400, 500, pw, ph);

    /* The stand-in stays if the file is not there. */
    const img = new Image();
    img.onload = () => {
      if (disposed) return;
      const t = new THREE.Texture(img);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = aniso;
      t.needsUpdate = true;
      coverFit(t, img.naturalWidth, img.naturalHeight, pw, ph);
      /* Handed to the GPU now, while it has just arrived, rather than on the
         frame the camera first turns to it - which is where the walk hitched. */
      renderer.initTexture(t);
      photoTextures.push(t);
      photoMat.map = t;
      photoMat.needsUpdate = true;
    };
    img.src = p.photo;

    /* The gold plate under the frame. */
    const plateFront = own(
      new THREE.MeshStandardMaterial({ map: tex(1024, 256, paintPlate(p, fonts)), metalness: 0.7, roughness: 0.32 }),
    );
    const plateSide = own(M.gold);
    const plate = box(plateW, plateH, 0.02, [plateSide, plateSide, plateSide, plateSide, plateFront, plateSide], 0, -fh / 2 - 0.12 - plateH / 2, 0.01, group);

    /* The shine that crosses it once, parked off its right edge until then. */
    const shineTex = shineTexture.clone();
    shineTex.needsUpdate = true;
    shineTex.offset.x = 1;
    const shine = new THREE.Mesh(
      new THREE.PlaneGeometry(plateW, plateH),
      new THREE.MeshBasicMaterial({
        map: shineTex,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        opacity: 0.85,
      }),
    );
    shine.position.set(0, plate.position.y, 0.022);
    group.add(shine);

    /* Its own spotlight. */
    const spot = new THREE.SpotLight(C.light, 0, 0, 0.34, 0.5, 2);
    spot.position.set(x, ROOM_H - 0.42, -6.2);
    spot.target.position.set(x, y - 0.3, WALL_Z);
    scene.add(spot, spot.target);
    const bulb = addLampHead(x, -6.2, spot.target.position);

    /* The beam, drawn so it shows: a soft open cone, fading toward the wall. */
    const from = spot.position.clone();
    const to = new THREE.Vector3(x, y - fh / 2 - 0.3, WALL_Z + 0.05);
    const len = from.distanceTo(to);
    const coneGeo = new THREE.ConeGeometry(Math.max(fw, fh) * 0.75, len, 32, 1, true);
    coneGeo.translate(0, -len / 2, 0);
    const beamMat = new THREE.MeshBasicMaterial({
      color: C.light,
      alphaMap: beamFade,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const beam = new THREE.Mesh(coneGeo, beamMat);
    beam.position.copy(from);
    beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), to.clone().sub(from).normalize());
    scene.add(beam);

    const entry: Exhibit = { group, y, mats, haloMat, shineTex, beamMat, focus: 0, shineAt: null };
    roomLights.push({ light: spot, base: 0, bulb, x, order: -1, exhibit: entry });
    return entry;
  }

  const exhibits = people.map(makeExhibit);

  /* --- on the floor ------------------------------------------------------- */

  const kit: PropKit = { scene, brass: M.brass, velvet: M.velvet, leather: M.leather, black: M.black, box };
  const pk = plantKit(aniso);
  ropeStands(kit, fx(0.5), -7.2);
  bench(kit, fx(2.5), -7.0);
  ropeStands(kit, fx(3.5), -7.2);
  plant(kit, pk, -2.4, -9.2, 1.1, "fig");
  plant(kit, pk, fx(4.5), -9.1, 1.1, "fig");
  plant(kit, pk, fx(1.5) + 0.4, -8.9, 1.0, "snake");
  ropeStands(kit, fx(5.5), -7.2);
  plant(kit, pk, fx(6.5) + 0.4, -8.9, 1.0, "snake");

  /* The lights still on screen at the end go out one by one: the outer ones
     first, the one in the middle last. */
  const endX = fx(N - 1);
  roomLights
    .filter((l) => Math.abs(l.x - endX) < SPACING * 1.4)
    .sort((a, b) => Math.abs(b.x - endX) - Math.abs(a.x - endX) || a.x - b.x)
    .forEach((l, k) => {
      l.order = k;
    });
  const goingOut = roomLights.filter((l) => l.order >= 0).length || 1;

  /* --- dust in the light -------------------------------------------------- */

  const DUST = 140;
  const dustPos = new Float32Array(DUST * 3);
  const dustSeed = new Float32Array(DUST);
  for (let k = 0; k < DUST; k++) {
    dustPos[k * 3] = (Math.random() - 0.5) * 1.8;
    dustPos[k * 3 + 1] = 0.4 + Math.random() * 3.6;
    dustPos[k * 3 + 2] = -9.7 + Math.random() * 2.2;
    dustSeed[k] = Math.random() * 100;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
  const dustMat = new THREE.PointsMaterial({
    size: 0.018,
    map: moteTexture,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    color: 0xfff1d0,
  });
  const dust = new THREE.Points(dustGeo, dustMat);
  scene.add(dust);
  const dustBase = dustPos.slice();

  /* The warm glow left at the very end. */
  const endGlow = new THREE.PointLight(0xffc46b, 0, 0, 2);
  endGlow.position.set(fx(N - 1), 1.6, -7);
  scene.add(endGlow);

  /* --- each frame --------------------------------------------------------- */

  const camPos = new THREE.Vector3();
  const camLook = new THREE.Vector3();
  const outside = new THREE.Vector3(0, 1.45, 10.5);
  const outsideLook = new THREE.Vector3(0, 2.0, 0);
  const inside = new THREE.Vector3();
  const insideLook = new THREE.Vector3();
  const clock = new THREE.Clock();

  function draw(S: MuseumState) {
    const t = clock.getElapsedTime();

    const a = lerp(CREDITS_ROOM.door.closed, CREDITS_ROOM.door.open, S.door);
    leafL.rotation.y = a;
    leafR.rotation.y = -a;

    /* The camera walks in from the street and then along the wall. */
    const x = fx(S.cam);
    inside.set(x - 0.7 * Math.min(1, camera.aspect) ** 2, 1.8, WALL_Z + viewDist);
    insideLook.set(x, 1.95, WALL_Z);
    camPos.lerpVectors(outside, inside, S.enter);
    camLook.lerpVectors(outsideLook, insideLook, Math.min(1, S.enter * 1.3));
    const sw = CREDITS_ROOM.cameraSway * 0.02;
    camPos.x += Math.sin(t * 0.55) * sw;
    camPos.y += Math.sin(t * 0.83 + 1) * sw * 0.7;
    camLook.x += Math.sin(t * 0.41 + 2) * sw * 0.8;
    camLook.y += Math.sin(t * 0.67) * sw * 0.5;
    camera.position.copy(camPos);
    camera.lookAt(camLook);

    /* Each portrait rises into place as it nears, takes the light in the
       middle, and its plate shines once. */
    let maxFocus = 0;
    exhibits.forEach((ex, i) => {
      const d = S.cam - i;
      const reveal = clamp(1 - (Math.abs(d) - 0.7) / 0.5);
      const focus = clamp(1 - Math.abs(d) / 0.45);
      ex.focus = focus;
      maxFocus = Math.max(maxFocus, focus);
      ex.group.position.y = ex.y - (1 - reveal) * 0.18;
      ex.group.position.z = WALL_Z + (1 - reveal) * 0.25;
      for (const m of ex.mats) m.opacity = reveal;
      ex.haloMat.opacity = 0.6 * reveal;
      if (ex.shineAt === null && focus > 0.7) ex.shineAt = t;
      if (ex.shineAt !== null) {
        /* Across from 0.75 to -0.75, easing out. */
        const p = clamp((t - ex.shineAt) / CREDITS_SHINE_S);
        ex.shineTex.offset.x = lerp(0.75, -0.75, 1 - (1 - p) ** 2);
      }
    });

    for (const l of roomLights) {
      const off = l.order >= 0 ? clamp(S.lightsOff * goingOut - l.order) : clamp(S.lightsOff * 3);
      let on = l.base;
      if (l.exhibit) {
        on = CREDITS_LIGHT.spotDim + CREDITS_LIGHT.spotFocus * l.exhibit.focus;
        l.exhibit.beamMat.opacity = (0.006 + 0.026 * l.exhibit.focus) * (1 - off);
      }
      l.light.intensity = on * (1 - off);
      if (l.bulb) l.bulb.emissiveIntensity = 3 * (1 - off * 0.95);
    }
    scene.environmentIntensity =
      lerp(CREDITS_LIGHT.outside, CREDITS_LIGHT.room, clamp(S.enter * 1.4)) * (1 - S.lightsOff * 0.85);
    warmGlowAtDoor.intensity = 25 * (1 - S.enter * 0.85) * (1 - S.lightsOff);

    /* The dust drifts in whichever beam is in the middle. */
    dust.position.x = fx(S.cam);
    dustMat.opacity = Math.max(maxFocus * (1 - S.lightsOff), S.glow * 0.6) * 0.75;
    const p = dustGeo.attributes.position.array as Float32Array;
    for (let k = 0; k < DUST; k++) {
      const s = dustSeed[k];
      p[k * 3] = dustBase[k * 3] + Math.sin(t * 0.2 + s) * 0.15;
      p[k * 3 + 1] = dustBase[k * 3 + 1] + Math.sin(t * 0.13 + s * 1.7) * 0.2;
      p[k * 3 + 2] = dustBase[k * 3 + 2] + Math.cos(t * 0.17 + s) * 0.1;
    }
    dustGeo.attributes.position.needsUpdate = true;

    endGlow.intensity = S.glow * 6;
    renderer.render(scene, camera);
  }

  function fit(w: number, h: number) {
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w < h ? 55 : 45;
    camera.updateProjectionMatrix();
    /* Keep a frame about 2.4m wide inside a narrow phone, and shrink the wall
       title to fit it too. */
    const halfTan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect;
    viewDist = clamp(1.25 / halfTan, 4.6, 8);
    title.scale.setScalar(Math.min(1, (halfTan * viewDist * 0.92) / 2.2));
  }

  function dispose() {
    disposed = true;
    const textures = new Set<THREE.Texture>(photoTextures);
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      mesh.geometry?.dispose();
      const mats = mesh.material ? ([] as THREE.Material[]).concat(mesh.material) : [];
      for (const m of mats) {
        for (const v of Object.values(m)) if (v instanceof THREE.Texture) textures.add(v);
        m.dispose();
      }
    });
    for (const t of textures) t.dispose();
    for (const t of [shineTexture, haloTexture, beamFade, moteTexture]) t.dispose();
    envTarget.dispose();
    pmrem.dispose();
    renderer.dispose();
    /* Browsers keep only a handful of live WebGL contexts; a reader who comes
       back here several times must not use them all up. */
    renderer.forceContextLoss();
  }

  fit(width, height);
  renderer.compile(scene, camera);

  return { draw, fit, dispose };
}
