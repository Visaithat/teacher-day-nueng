/**
 * Everything in the museum that is painted rather than modelled: the parquet,
 * the stone, the grain of a frame, the sky, the plates, the soft light shapes.
 *
 * Each is drawn once onto a canvas and handed to three.js as a texture. The
 * drawing is deterministic - every random choice comes from a seeded generator
 * - so the floor is laid the same way on every visit.
 */

import * as THREE from "three";

import type { CreditPerson, MuseumFonts } from "@/types/credits";
import { STAND_IN_TONES } from "./museum-stand-in";

type Paint = (g: CanvasRenderingContext2D, w: number, h: number) => void;

/**
 * A canvas, painted, as a texture.
 *
 * @param color Whether the pixels are colour (sRGB) rather than data, which an
 *   alpha map is.
 */
export function canvasTexture(
  w: number,
  h: number,
  paint: Paint,
  anisotropy: number,
  color = true,
): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  paint(c.getContext("2d")!, w, h);
  const t = new THREE.CanvasTexture(c);
  if (color) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = anisotropy;
  return t;
}

/** A small repeatable random generator: the same seed, the same run. */
export function seeded(seed: number): () => number {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/** The parquet: rows of planks of random length, each with its own grain. */
export const paintParquet: Paint = (g, w, h) => {
  const r = seeded(7);
  const rows = 8;
  const rh = h / rows;
  const tones = ["#B98552", "#A8743F", "#C4925E", "#9A6838", "#B07A47", "#C08B55"];
  for (let y = 0; y < rows; y++) {
    let x = -r() * 300;
    while (x < w) {
      const len = 220 + r() * 260;
      g.fillStyle = tones[Math.floor(r() * tones.length)];
      g.fillRect(x, y * rh, len, rh);
      for (let k = 0; k < 14; k++) {
        g.strokeStyle = `rgba(${r() > 0.5 ? "255,240,220" : "70,40,15"},${0.05 + r() * 0.06})`;
        g.lineWidth = 1 + r() * 2;
        const gy = y * rh + r() * rh;
        g.beginPath();
        g.moveTo(x, gy);
        g.bezierCurveTo(x + len * 0.3, gy + (r() - 0.5) * 8, x + len * 0.7, gy + (r() - 0.5) * 8, x + len, gy);
        g.stroke();
      }
      g.fillStyle = "#5e3a1e";
      g.fillRect(x, y * rh, 3, rh);
      x += len;
    }
    g.fillStyle = "#5e3a1e";
    g.fillRect(0, y * rh, w, 3);
  }
};

/** Stone blocks for the face of the building, laid in a running bond. */
export const paintStone: Paint = (g, w, h) => {
  const r = seeded(3);
  g.fillStyle = "#b9aa90";
  g.fillRect(0, 0, w, h);
  const rows = 8;
  const rh = h / rows;
  for (let y = 0; y < rows; y++) {
    const bw = w / 3;
    const off = ((y % 2) * bw) / 2;
    for (let x = -1; x < 4; x++) {
      const l = 82 + r() * 8;
      g.fillStyle = `hsl(36, 28%, ${l}%)`;
      g.fillRect(x * bw + off + 2, y * rh + 2, bw - 4, rh - 4);
    }
  }
};

/** Wood grain for a frame or a door, in a base tone and a darker one. */
export function paintWoodGrain(base: string, dark: string): Paint {
  return (g, w, h) => {
    const r = seeded(11);
    g.fillStyle = base;
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 70; i++) {
      g.strokeStyle = dark;
      g.globalAlpha = 0.15 + r() * 0.25;
      g.lineWidth = 1 + r() * 2;
      const y = r() * h;
      g.beginPath();
      g.moveTo(0, y);
      g.bezierCurveTo(w * 0.3, y + (r() - 0.5) * 10, w * 0.6, y + (r() - 0.5) * 10, w, y);
      g.stroke();
    }
    g.globalAlpha = 1;
  };
}

/** Dusk over the street outside, deep blue fading to a warm horizon. */
export const paintSky: Paint = (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, "#1c2a4a");
  gr.addColorStop(0.45, "#3d4f78");
  gr.addColorStop(0.62, "#c98a62");
  gr.addColorStop(0.7, "#e9b27a");
  gr.addColorStop(1, "#e9b27a");
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
};

/** A drawn stand-in portrait, for a photo that is missing. */
export function paintStandIn(i: number, label: string): Paint {
  return (g, w, h) => {
    g.fillStyle = STAND_IN_TONES[i % STAND_IN_TONES.length];
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#8f7b62";
    g.beginPath();
    g.arc(w / 2, h * 0.38, w * 0.2, 0, Math.PI * 2);
    g.fill();
    g.beginPath();
    g.moveTo(w * 0.14, h);
    g.bezierCurveTo(w * 0.14, h * 0.72, w * 0.3, h * 0.62, w / 2, h * 0.62);
    g.bezierCurveTo(w * 0.7, h * 0.62, w * 0.86, h * 0.72, w * 0.86, h);
    g.fill();
    g.fillStyle = "#f6efe2";
    g.font = "24px Georgia, serif";
    g.textAlign = "center";
    g.fillText(label, w / 2, h - 24);
  };
}

/** A gold name plate, screwed on at both ends, lettered in the serif. */
export function paintPlate(p: CreditPerson, fonts: MuseumFonts): Paint {
  return (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, h);
    gr.addColorStop(0, "#F6E3A1");
    gr.addColorStop(0.38, "#D4AF37");
    gr.addColorStop(0.62, "#B8932A");
    gr.addColorStop(1, "#E9CC72");
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(110,80,15,.8)";
    g.lineWidth = 6;
    g.strokeRect(14, 14, w - 28, h - 28);
    g.fillStyle = "#6d5413";
    for (const x of [40, w - 40]) {
      g.beginPath();
      g.arc(x, h / 2, 9, 0, Math.PI * 2);
      g.fill();
    }
    g.fillStyle = "#3A2A0C";
    g.textAlign = "center";
    g.textBaseline = "middle";
    const face = `${fonts.serif}, Georgia, serif`;
    let size = 88;
    g.font = `700 ${size}px ${face}`;
    while (g.measureText(p.name).width > w - 140 && size > 40) {
      size -= 4;
      g.font = `700 ${size}px ${face}`;
    }
    g.fillText(p.name, w / 2, h * 0.4);
    g.font = `700 50px ${face}`;
    if ("letterSpacing" in g) g.letterSpacing = "6px";
    g.fillText(p.role.toUpperCase(), w / 2, h * 0.74);
  };
}

/** The museum's name, in gold capitals on a dark board over the door. */
export function paintSign(name: string, fonts: MuseumFonts): Paint {
  return (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, "#2c2219");
    gr.addColorStop(1, "#1b140e");
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "#D4AF37";
    g.lineWidth = 10;
    g.strokeRect(10, 10, w - 20, h - 20);
    g.fillStyle = "#E3C25A";
    g.textAlign = "center";
    g.textBaseline = "middle";
    /* The reference size, shrunk with its tracking until the name fits inside
       the gold edging - a longer name than the reference's would run off both
       ends of the board. */
    const text = name.toUpperCase();
    let size = 96;
    let track = 26;
    const setType = () => {
      g.font = `700 ${size}px ${fonts.serif}, Georgia, serif`;
      if ("letterSpacing" in g) g.letterSpacing = `${track}px`;
    };
    setType();
    while (g.measureText(text).width > w - 100 && size > 40) {
      size -= 2;
      track = (26 * size) / 96;
      setType();
    }
    /* Half a space of tracking to the right: the browser adds it after the
       last letter too, which would otherwise pull the name off centre. */
    g.fillText(text, w / 2 + track / 2, h / 2 + 4);
  };
}

/** The title on the first wall, with a rule and a spaced-out subtitle. */
export function paintWallTitle(title: string, subtitle: string, fonts: MuseumFonts): Paint {
  return (g, w, h) => {
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillStyle = "#7d6c58";
    g.font = `italic 500 220px ${fonts.serif}, Georgia, serif`;
    g.fillText(title, w / 2, h * 0.36);
    g.fillStyle = "#b9a688";
    g.fillRect(w / 2 - 110, h * 0.66, 220, 4);
    g.fillStyle = "#8b7a64";
    g.font = `500 64px ${fonts.serif}, Georgia, serif`;
    if ("letterSpacing" in g) g.letterSpacing = "22px";
    g.fillText(subtitle.toUpperCase(), w / 2, h * 0.84);
  };
}

/** The band of light that sweeps across a plate once. */
export const paintShine: Paint = (g, w, h) => {
  const gr = g.createLinearGradient(w * 0.35, 0, w * 0.65, h);
  gr.addColorStop(0, "rgba(255,255,255,0)");
  gr.addColorStop(0.5, "rgba(255,255,255,1)");
  gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
};

/** The soft dark halo a frame casts on the wall behind it. */
export const paintHalo: Paint = (g, w, h) => {
  const gr = g.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w / 2);
  gr.addColorStop(0, "rgba(0,0,0,.55)");
  gr.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
};

/** Top to bottom, white to black: how a beam you can see fades toward the wall. */
export const paintBeamFade: Paint = (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, "#fff");
  gr.addColorStop(1, "#000");
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
};

/** One soft round mote of dust. */
export const paintMote: Paint = (g) => {
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, "rgba(255,248,225,1)");
  gr.addColorStop(1, "rgba(255,248,225,0)");
  g.fillStyle = gr;
  g.fillRect(0, 0, 64, 64);
};

/** A fiddle-leaf fig leaf: deep green, a pale midrib and side veins. */
export const paintFigLeaf: Paint = (g, w, h) => {
  const gr = g.createLinearGradient(0, h, 0, 0);
  gr.addColorStop(0, "#2c5426");
  gr.addColorStop(0.6, "#3f7234");
  gr.addColorStop(1, "#4d8240");
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
  g.strokeStyle = "rgba(205,225,160,.75)";
  g.lineWidth = 6;
  g.beginPath();
  g.moveTo(w / 2, h);
  g.lineTo(w / 2, 10);
  g.stroke();
  g.strokeStyle = "rgba(205,225,160,.45)";
  g.lineWidth = 3;
  for (let y = h - 40; y > 40; y -= 44) {
    for (const d of [-1, 1]) {
      g.beginPath();
      g.moveTo(w / 2, y);
      g.quadraticCurveTo(w / 2 + d * w * 0.25, y - 30, w / 2 + d * w * 0.48, y - 70);
      g.stroke();
    }
  }
};

/** A snake-plant leaf: wavy pale bands and yellow edges. */
export const paintSnakeLeaf: Paint = (g, w, h) => {
  g.fillStyle = "#2e4f2a";
  g.fillRect(0, 0, w, h);
  const r = seeded(21);
  for (let y = 0; y < h; y += 14 + r() * 12) {
    g.strokeStyle = `rgba(150,180,120,${0.25 + r() * 0.25})`;
    g.lineWidth = 3 + r() * 4;
    g.beginPath();
    g.moveTo(0, y);
    g.bezierCurveTo(w * 0.3, y - 8 - r() * 8, w * 0.7, y + 8 + r() * 8, w, y);
    g.stroke();
  }
  const edge = g.createLinearGradient(0, 0, w, 0);
  edge.addColorStop(0, "#d8c35a");
  edge.addColorStop(0.1, "rgba(216,195,90,0)");
  edge.addColorStop(0.9, "rgba(216,195,90,0)");
  edge.addColorStop(1, "#d8c35a");
  g.fillStyle = edge;
  g.fillRect(0, 0, w, h);
};
