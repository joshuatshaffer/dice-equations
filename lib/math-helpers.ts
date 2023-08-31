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

/**
 * Product of `n*(n-1)*(n-2)*...*2*1`.
 *
 * Non-integer values of n are rounded down, i.e. `factorial(n) === factorial(Math.floor(n))`
 */
export function factorial(n: number): number {
  if (n < 0) {
    return NaN;
  }

  let a = 1;
  for (let i = 2; i <= n; ++i) {
    a *= i;
  }
  return a;
}

export function choose(n: number, k: number): number {
  return factorial(n) / (factorial(k) * factorial(n - k));
}

export function binom(n: number, k: number) {
  if (k < 0 || k > n) {
    return 0;
  }

  let a = 1;

  for (let i = 0; i < k; i++) {
    a = (a * (n - i)) / (i + 1);
  }

  return a;
}

export function fromThenTo({
  from,
  then,
  to,
}: {
  from: number;
  then?: number;
  to: number;
}) {
  if (then === undefined) {
    then = from <= to ? from + 1 : from - 1;
  }

  const step = then - from;

  if (step === 0) {
    throw new Error("from and then must not be equal");
  }

  const output: number[] = [];
  for (let i = from; step > 0 ? i <= to : i >= to; i += step) {
    output.push(i);
  }
  return output;
}
