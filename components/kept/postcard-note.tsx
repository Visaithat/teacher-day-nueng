import { POSTCARD } from "@/lib/constants/kept";
import { jitter } from "@/lib/utils/jitter";
import type { CssVars } from "@/types/css-vars";
import type { Letter } from "@/types/mails";

/**
 * How far line `n` of the note leans.
 *
 * Its own salt, and not `leanAt`'s: the two cards would otherwise lean by the
 * same sequence of fractions, and two people writing the same crooked lines is
 * the one thing a hand-written page cannot look like. Deterministic, so the
 * server and the browser draw the same card.
 */
function leanOf(n: number) {
  return jitter(n, 52.9) * POSTCARD.note.lean;
}

interface PostcardNoteProps {
  letter: Letter;
}

/**
 * What one person wrote on the postcard.
 *
 * Three blocks, because the artwork is printed with three places to write and
 * it is the artwork that decides: a rule beside `From :`, the blank left half,
 * and five ruled lines under `For :`. Every measurement comes in from
 * {@link POSTCARD} as a custom property - the stylesheet holds none of them,
 * so there is one place to retune against the picture.
 *
 * Sizes are a share of the CARD, computed here rather than in CSS, because a
 * percentage `font-size` means a share of the inherited size and not of the box.
 * Tied to `--wide`, the writing and the card can only grow together.
 */
export default function PostcardNote({ letter }: PostcardNoteProps) {
  const { from, note, address, sit } = POSTCARD;
  const card = letter.postcard;

  return (
    <div className="card" aria-label={`The postcard from ${letter.name}`}>
      <span
        className="card__from"
        style={
          {
            "--from-left": `${from.left}%`,
            "--rule": `${from.rule}%`,
            "--from-size": `calc(var(--wide) * ${from.size / 100})`,
            "--sit": sit,
          } as CssVars
        }
      >
        {card.from}
      </span>

      <p
        className="card__note"
        style={
          {
            "--note-left": `${note.left}%`,
            "--note-right": `${100 - note.right}%`,
            "--note-top": `${note.top}%`,
            "--note-size": `calc(var(--wide) * ${note.size / 100})`,
          } as CssVars
        }
      >
        {card.note.map((line, n) =>
          line ? (
            <span
              key={n}
              className="card__line"
              style={{ "--lean": `${leanOf(n).toFixed(2)}deg` } as CssVars}
            >
              {line}
            </span>
          ) : (
            <span key={n} className="card__gap" aria-hidden="true" />
          ),
        )}
      </p>

      {/* Onto the printed rules, and placed one by one rather than stacked: the
          spacing is the artwork's, so each line is put on its own rule instead
          of trusting a line-height to land on five of them in a row. */}
      <span
        className="card__address"
        style={
          {
            "--to-left": `${address.left}%`,
            "--to-size": `calc(var(--wide) * ${address.size / 100})`,
            "--sit": sit,
          } as CssVars
        }
      >
        {card.address.map((line, n) => (
          <span
            key={n}
            className="card__to"
            style={
              {
                "--rule": `${address.rule + n * address.step}%`,
                "--lean": `${leanOf(n + 20).toFixed(2)}deg`,
              } as CssVars
            }
          >
            {line}
          </span>
        ))}
      </span>
    </div>
  );
}
