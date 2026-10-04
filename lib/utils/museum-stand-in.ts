/**
 * The drawn portrait a frame shows when its photo is not there.
 *
 * Apart from the textures on purpose: the plain gallery needs it too, and that
 * one must not pull three.js in with it.
 */

/** The paper tones the stand-ins cycle through. */
export const STAND_IN_TONES = ["#C9B79C", "#B7A48A", "#CDB89B", "#BFAE96", "#C6B293", "#B9A890"];

/** The stand-in as an image a plain `<img>` can show. */
export function standInSrc(i: number, label: string): string {
  const bg = STAND_IN_TONES[i % STAND_IN_TONES.length];
  const svg =
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 400'>" +
    `<rect width='300' height='400' fill='${bg}'/>` +
    "<circle cx='150' cy='165' r='62' fill='#8f7b62'/>" +
    "<path d='M40 400 C40 290 90 250 150 250 C210 250 260 290 260 400 Z' fill='#8f7b62'/>" +
    `<text x='150' y='380' font-family='Georgia,serif' font-size='22' text-anchor='middle' fill='#f6efe2'>${label}</text></svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

/** The file name a missing photo is labelled with. */
export function photoLabel(photo: string): string {
  return photo.slice(photo.lastIndexOf("/") + 1);
}
