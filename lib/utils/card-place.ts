import { keptOf } from "@/lib/utils/mail-slugs";
import type { Mark, Place } from "@/types/card-place";

/** A place, as the history can keep it. */
export function markOf(place: Place): Mark {
  return place.at === "kept"
    ? { at: "kept", person: place.letter.slug, item: place.content.slug }
    : { at: place.at };
}

/**
 * And back again, suspiciously.
 *
 * Everything handed to this is untrusted. A mark can be left over from before a
 * reload, or from a build of this card that had different letters in it, so the
 * shape is checked and then the slugs are resolved against the real lists.
 * Anything that does not name a real pair falls back to the selection page,
 * which is the one place that is always there.
 */
export function placeOf(mark: unknown): Place {
  if (!mark || typeof mark !== "object") return { at: "selection" };
  const { at } = mark as { at?: unknown };
  if (at === "mails") return { at: "mails" };
  if (at === "song") return { at: "song" };
  if (at === "kept") {
    const { person, item } = mark as { person?: unknown; item?: unknown };
    if (typeof person === "string" && typeof item === "string") {
      const found = keptOf(person, item);
      if (found) return { at: "kept", ...found };
    }
  }
  return { at: "selection" };
}
