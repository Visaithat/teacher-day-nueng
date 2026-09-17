# teacher-day-nueng

A greeting card that opens. The welcome page is written by hand, clicked away, and
the home page assembles in its place; a mail box waits one screen below it, and the
present inside turns the screen to light. Behind that is `/mails`, where a cardboard
box tips over and pours letters onto a gingham cloth — each one waiting with its wax
seal unbroken, each thing inside opening onto a page of its own.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build
npm run lint    # eslint
npx tsc --noEmit
```

## Stack

- **Next.js 16** (App Router, Turbopack) · **React 19**
- **TypeScript**, strict
- **Tailwind v4** for a handful of layout utilities only — the scene itself is
  hand-written BEM with CSS custom properties
- No UI library, no state library, no data layer - the whole card prerenders.

## Project Structure

```
├── app/                    # App Router: routing, layouts and metadata only
│   ├── globals.css        #   the one stylesheet entry - imports every component's
│   └── mails/             #   /mails and /mails/[person]/[item]
├── components/             # one folder per feature, CSS beside its component
│   ├── welcome/ home/ mailbox/ selection/
│   ├── stage/             #   the light and the camera moves between pages
│   ├── cloth/             #   the gingham ground, shared by two routes
│   ├── mails/             #   the scene: mails, letter, cardboard-box
│   └── kept/              #   a thing once it is out of its envelope
├── hooks/                  # flat, one use-*.ts per concern
├── lib/
│   ├── constants/         #   every tunable number, by domain
│   └── utils/             #   pure functions, by domain
├── providers/              # *-provider.tsx context providers
├── types/                  # flat, one .ts per domain
└── public/art|photos/      # illustration and photography
```

Imports use the `@/` alias (`@/*` → `./*`) for anything crossing a folder
boundary; same-folder siblings stay relative.

## How it is put together

**CSS custom properties are the only channel from JS to CSS.** Every duration,
offset and measurement a stylesheet needs is handed to it as a `--name` built in
`lib/constants/`, so the timers that drive the swaps and the keyframes that drive
the pixels cannot drift apart. Nothing is positioned from a style attribute.

**The stylesheet order in `app/globals.css` is load-bearing.** A few rules tie on
specificity and are decided by source order — the comments there say which. Within
the mail scene, `mails.css` → `cardboard-box.css` → `letter.css` preserves the
order they were originally written in.

**Reduced motion is asked live, never remembered.** `prefersReducedMotion()` is
called at the moment a decision is made, because the stylesheets answer the same
question with a media query and a cached copy in JS could only go stale against it.
Every stylesheet ends with its own `prefers-reduced-motion` block.

**Images are raw `<img>`, deliberately.** The scene's layers are masked and blended,
and `next/image`'s wrapper breaks `mix-blend-mode`. Each one carries its own
`eslint-disable` line saying so.
