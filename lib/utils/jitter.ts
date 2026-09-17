/** Deterministic jitter in [-1, 1) from an index, so renders stay stable. */
export function jitter(index: number, salt: number) {
  const n = Math.sin((index + 1) * salt) * 10000;
  return (n - Math.floor(n)) * 2 - 1;
}
