/** Moving the card from its first page to its second. */

export type CardStageOptions = {
  /** Images to fetch before the second page is allowed to start moving. */
  preload: readonly string[];
  /** How long the second page takes to assemble, in ms. */
  assembleMs: number;
};

export type CardStage = {
  /** The first page has been dismissed and its text is drifting away. */
  leaving: boolean;
  /** The text has cleared and every photo has loaded: show the second page. */
  showSecond: boolean;
  /** Every layer of the second page has come to rest. */
  assembled: boolean;
  /** Dismiss the first page. */
  open: () => void;
};
