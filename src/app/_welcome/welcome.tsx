import { Signature } from "./signature";

export type WelcomeProps = {
  /** True once the card has been dismissed and the text is drifting away. */
  leaving: boolean;
  /** Called when the viewer clicks anywhere. */
  onOpen: () => void;
};

/** The welcome page: a greeting that writes itself, and waits to be clicked. */
export function Welcome({ leaving, onOpen }: WelcomeProps) {
  return (
    <main
      className={`welcome flex w-full min-w-0 flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center${
        leaving ? " welcome--leaving" : ""
      }`}
    >
      <Signature />

      <p className="subtitle text-foreground text-base font-bold tracking-tight sm:text-xl">
        It&rsquo;s been such a long time no talk
      </p>

      {/* The whole page is the target; there is no button to find. */}
      <button
        type="button"
        className="welcome__veil"
        onClick={onOpen}
        aria-label="Show the photos"
      >
        <span className="welcome__hint">Click anywhere to continue</span>
      </button>
    </main>
  );
}
