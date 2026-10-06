/**
 * Where a file in `public/` is served from.
 *
 * On Vercel the card sits at the root of its site and this returns the path
 * untouched. The GitHub Pages mirror sits under `/teacher-day-nueng/`, and the
 * raw `<img>`, `<audio>` and `fetch` calls that reach into `public/` know
 * nothing of Next's `basePath` - it rewrites its own chunks and nothing else.
 * So every such path passes through here, and the prefix is read from the same
 * variable `next.config.ts` hands to `basePath`, so the two cannot disagree.
 *
 * `NEXT_PUBLIC_*` is inlined at build time: there is no cost at run time, and
 * an unset variable leaves every path exactly as written.
 */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function publicUrl(path: string): string {
  return `${BASE_PATH}${path}`;
}
