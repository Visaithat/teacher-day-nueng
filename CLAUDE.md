@AGENTS.md

# Project rules

A Next.js 16 App Router greeting card. Hand-animated, no backend, no forms, no
data layer. Read `README.md` for what it actually does.

## Where things go

No `src/`. Top-level folders are the layers:

| Folder | Holds | Example |
|---|---|---|
| `app/` | **routing only** — `page.tsx`, `layout.tsx`, metadata, `globals.css` | `app/mails/page.tsx` |
| `components/<feature>/` | components **+ their `.css`** | `components/mailbox/mailbox.tsx` + `.css` |
| `hooks/` | **flat**, one `use-*.ts` per concern | `hooks/use-key-drag.ts` |
| `lib/constants/` | every tunable number, by domain | `lib/constants/mail-timing.ts` |
| `lib/utils/` | **pure functions**, by domain | `lib/utils/jitter.ts` |
| `providers/` | `*-provider.tsx`, default export | `providers/scene-memory-provider.tsx` |
| `types/` | **flat**, one `.ts` per domain | `types/mails.ts` |

**Adding something? Follow this:**

- A number the CSS or a timer reads → `lib/constants/<domain>.ts`. Never inline it.
- A pure function → `lib/utils/<domain>.ts`. Never a shared `utils.ts`.
- Anything with React state or effects → `hooks/use-*.ts`, even if only one caller.
- A type → `types/<domain>.ts`. **Except** component props (see below).
- A page → `app/`. Put its UI in `components/`, not in the route file.

**Do not create:** `index.ts` barrels (there are none), `components/common/`
(nothing is shared yet), or empty folders to mirror some other project.

## Naming and shape

- Files **kebab-case**, always. Component identifier is the PascalCase of the filename.
- `export default function Thing()` — not a named export.
- Props are an **unexported** `interface ThingProps` directly above the component.
  They do **not** go in `types/`.
- Constants `SCREAMING_SNAKE_CASE`. Prefix when two domains would collide
  (`MAIL_TIMING` vs `MAILBOX_TIMING`).

```tsx
interface MailboxProps {
  onOpenPresent: (from: DOMRect) => void;
}

export default function Mailbox({ onOpenPresent }: MailboxProps) { … }
```

## Imports

- `@/` for anything crossing a folder boundary. `@/*` → `./*` from the repo root.
- Relative `./` **only** for same-folder siblings.
- `import type` for type-only imports.
- Nothing outside `app/` may import from `@/app/...`.
- In **CSS**, `@import` stays relative (`../components/...`). Tailwind's resolver
  does not read `tsconfig.paths`; using `@/` there fails silently with no styles.

## Styling

Hand-written **BEM**, plus `data-*` attributes for state (`[data-act]`,
`[data-open]`, `[data-read]`). Tailwind is present but used only for a few
layout utilities in `layout.tsx` / `welcome.tsx` and `sr-only`. Do not reach for
Tailwind to style the scene.

**CSS custom properties are the only channel from JS to CSS.** Every duration,
offset and measurement comes from `lib/constants/` and is handed over as a
`--name`, so timers and keyframes cannot drift apart. Nothing is positioned from
a style attribute.

Style objects carrying custom properties are typed `CssVars`
(`@/types/css-vars`), never `as CSSProperties`:

```ts
function layerVars(layer: Layer): CssVars {
  return { "--left": `${layer.left}%`, "--w": `${layer.width}%` } as CssVars;
}
```

**The `@import` order in `app/globals.css` is load-bearing.** A few rules tie on
specificity and are decided by source order; the comments there say which. If you
split or reorder a stylesheet, verify with the CSS check below — a broken tie
renders wrong with no error.

Every stylesheet ends with its own `@media (prefers-reduced-motion: reduce)` block.
If you add motion, add its reduce case in the same file.

## Rules with teeth

1. **Reuse the shared helpers — do not re-implement them.** These exist because
   each was duplicated 2–6 times before:
   `prefersReducedMotion()` · `centreOf()` · `lockRootScroll()` · `jitter()` ·
   `useTimers()`. Check `lib/utils/` and `hooks/` before writing a helper.
2. **Ask about reduced motion live**, via `prefersReducedMotion()`, at the moment
   the decision is made. Never cache it in state — the stylesheets answer the same
   question with a live media query and a cached copy goes stale against them.
3. **Images are raw `<img>`, deliberately.** The layers are masked and blended and
   `next/image`'s wrapper breaks `mix-blend-mode`. Keep the per-call
   `eslint-disable-next-line @next/next/no-img-element` and its comment. Do not
   hoist the rule into `eslint.config.mjs`.
4. **`"use client"` must be the first line**, above every import. An import above
   it silently demotes it to a no-op string.
5. **Watch your prose in code files.** Tailwind v4 scans for class candidates, so a
   bare CSS-ish word in a **comment** — the positioning and display values that are
   also utility names — mints a real class into the bundle. Markdown is already
   excluded (`@source not` at the top of `globals.css`); `.ts`/`.tsx` are not.
   Hyphenate or reword if a build shows utilities you did not write.
6. **A CSS rule whose selector list spans components** must be split per component
   file, not filed under whichever matched first — otherwise it lands in the wrong
   `@import` position and stops overriding.

## Verify

```bash
npx tsc --noEmit && npm run lint && npm run build
```

Build passing proves little for an animation — also load `/`, `/mails`, and a
`/mails/<person>/<item>` route, and repeat with OS reduced-motion on.

If you moved, split or reordered CSS and the rendering is meant to be unchanged,
prove it. The built chunk's filename is content-derived, so it doubles as the
checksum:

```bash
npm run build && md5sum .next/static/chunks/*.css   # before your change
npm run build && md5sum .next/static/chunks/*.css   # after — must match
```

A legitimate byte change (splitting a rule that spans components duplicates its
declarations) still has to leave the *set* of rules identical — compare the two
files rule by rule rather than assuming.

## Known gaps — leave alone unless asked

`/mails` is reachable only by URL (nothing links to it). `Selection` is a stub.
`onOpenLetter` is threaded through but never passed. `.letter__layer--flap` is a
dead selector. `public/{file,globe,next,vercel,window}.svg` are unused
create-next-app leftovers.
