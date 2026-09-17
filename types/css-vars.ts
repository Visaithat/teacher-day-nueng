import type { CSSProperties } from "react";

/**
 * A style object that may also carry CSS custom properties.
 *
 * The card's one channel from JS to CSS is a custom property: every duration,
 * offset and measurement a stylesheet needs is handed to it as a `--name`, so
 * the timers and the keyframes cannot drift apart. React's `CSSProperties` has
 * no room for those, which is why every helper that builds one used to end in
 * `as CSSProperties` - a cast that silenced the complaint and every real typo
 * along with it.
 *
 * This says what those objects actually are, so the standard properties in them
 * stay checked.
 */
export type CssVars = CSSProperties & Record<`--${string}`, string | number>;
