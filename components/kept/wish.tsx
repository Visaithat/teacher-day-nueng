
import type { CssVars } from "@/types/css-vars";
import type { Letter } from "@/types/mails";
import { WISH } from "@/lib/constants/kept";
import { leanAt } from "@/lib/utils/kept-lean";

/**
 * What she wrote, laid over the paper she wrote it on.
 *
 * Inside the sheet's own box and not over it, which matters for one reason
 * only: the sheet is the thing that crosses between the two pages, and
 * anything outside it would travel with the room instead — the words would
 * come loose from the paper halfway through the cut.
 *
 * The lines are the ones somebody chose. Nothing here rewraps them: a
 * hand-written letter's breaks are part of the drawing of it, and the sheet's
 * printed fold is a highlight rather than a tear, so the words go over it the
 * way ink goes over a fold on real paper. All this adds is that nobody writes
 * square to the page.
 *
 * A blank line is a paragraph break rather than an empty `<p>`: the wish is
 * stored as the lines somebody chose, and a break is one of the things they
 * chose.
 */
interface WishProps {
  letter: Letter;
}

export default function Wish({ letter }: WishProps) {
  return (
    <p
      className="wish"
      aria-label={`The letter from ${letter.name}`}
      /* The block's own geometry, pushed in rather than written out again in
         the stylesheet. They are percentages of one piece of artwork, and a
         second copy of them beside the rules that spend them is a second copy
         to retune and forget. */
      style={
        {
          "--wish-left": `${WISH.left}%`,
          "--wish-right": `${WISH.right}%`,
          "--wish-top": `${WISH.top}%`,
          /* Off the sheet's own width, which `--wide` already is. */
          "--wish-size": `calc(var(--wide) * ${WISH.size / 100})`,
        } as CssVars
      }
    >
      {letter.wish.map((line, n) =>
        line ? (
          <span
            key={n}
            className="wish__line"
            style={{ "--lean": `${leanAt(n).toFixed(2)}deg` } as CssVars}
          >
            {line}
          </span>
        ) : (
          <span key={n} className="wish__gap" aria-hidden="true" />
        ),
      )}
      <span className="wish__sign">{letter.signed}</span>
    </p>
  );
}
