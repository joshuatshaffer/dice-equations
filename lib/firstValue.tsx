// the largest value k such that for all x in xs, x = k*n+min(xs)
export function firstValue(
  x: string | string[] | undefined
): string | undefined {
  if (Array.isArray(x)) return x[0];
  return x;
}
