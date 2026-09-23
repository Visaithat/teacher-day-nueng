/**
 * Seconds, as a clock reads them.
 *
 * Nothing on this page prints a time - the reference draws position as a
 * waveform and no digits anywhere. This is for the label a screen reader is
 * given instead, which has no waveform to look at and needs the same fact in
 * words.
 */
export function clockOf(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const whole = Math.floor(seconds);
  const minutes = Math.floor(whole / 60);
  return `${minutes}:${String(whole - minutes * 60).padStart(2, "0")}`;
}
