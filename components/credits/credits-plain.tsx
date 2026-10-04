import type { SyntheticEvent } from "react";

import { CREDITS_CLIP, CREDITS_PEOPLE, CREDITS_WORDS } from "@/lib/constants/credits";
import { photoLabel, standInSrc } from "@/lib/utils/museum-stand-in";

/** A missing photo shows its drawn stand-in, once - never a broken image. */
function standIn(i: number, photo: string) {
  return (event: SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    if (img.dataset.standIn !== undefined) return;
    img.dataset.standIn = "";
    img.src = standInSrc(i, photoLabel(photo));
  };
}

/**
 * The museum with nothing moving: the wall title, every portrait at once, and
 * the thank-you underneath.
 *
 * For a reader who has asked for less motion, and for any browser the 3D room
 * could not be built in. Everything the walk shows is here; only the walking
 * is gone.
 */
export default function CreditsPlain() {
  return (
    <div className="credits-plain">
      <header className="credits-plain__header">
        <p className="credits-plain__museum">{CREDITS_WORDS.museumName}</p>
        <h2 className="credits-plain__title">{CREDITS_WORDS.wallTitle}</h2>
      </header>

      <ul className="credits-plain__wall">
        {CREDITS_PEOPLE.map((p, i) => (
          <li className="credits-plain__card" key={p.photo}>
            {/* A plain <img>, like every picture on this card: the stand-in is
                swapped in on error, which next/image's wrapper would fight. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="credits-plain__photo" src={p.photo} alt={p.name} onError={standIn(i, p.photo)} />
            <div className="credits-plain__plate">
              <strong className="credits-plain__name">{p.name}</strong>
              <span className="credits-plain__role">{p.role}</span>
            </div>
          </li>
        ))}
      </ul>

      {/* The clip, here too - but the reader's to start, with its own controls. */}
      <div className="credits-plain__clip">
        <video className="credits-plain__video" src={CREDITS_CLIP.src} controls playsInline preload="metadata" />
      </div>

      <div className="credits-plain__end">
        {CREDITS_WORDS.message.map((line) => (
          <p className="credits-plain__line" key={line}>
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}
