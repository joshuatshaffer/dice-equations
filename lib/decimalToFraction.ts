export function decimalToFraction(
  num: number
): [numerator: number, denominator: number] {
  let n = num;
  let d = 1;

  while (n % 1 > 0 && n % 1 < 1) {
    n *= 2;
    d *= 2;
  }

  return [n, d];
}

export function toME(num: number) {
  const [ms, es] = num.toExponential().split("e");

  const fp = ms.length - Math.max(0, ms.indexOf(".")) - 1;
  const m = Number(ms) * Math.pow(10, fp);
  const e = Number(es) - fp;
  return { m, e };
}
