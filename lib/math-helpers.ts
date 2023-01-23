export function gcd(a: number, b: number): number {
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

export function reduceFraction(n: number, d: number) {
  const f = gcd(n, d);
  return [n / f, d / f] as const;
}

export function factorial(n: number): number {
  let a = 1;
  for (let i = n; i > 0; --i) {
    a *= i;
  }
  return a;
}
