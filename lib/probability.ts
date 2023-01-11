import { DiceExpression } from "./parseDice";

export function prob(diceExpr: DiceExpression): Map<number, number> {
  if (typeof diceExpr === "number") {
    return new Map([[diceExpr, 1]]);
  }

  const l = prob(diceExpr.l);
  const r = prob(diceExpr.r);
  const op = diceExpr.op;

  if (op === "d") {
    return new Map(
      (function* () {
        for (const [rv, rp] of r.entries()) {
          for (let i = 1; i <= rv; ++i) {
            yield [i, 1 / rv];
          }
        }
      })()
    );
  }

  return corg(l, r, function (lv, rv) {
    switch (op) {
      case "+":
        return lv + rv;
      case "-":
        return lv - rv;
      case "*":
        return lv * rv;
      case "/":
        return lv / rv;
    }
  });
}

function corg(
  x: Map<number, number>,
  y: Map<number, number>,
  f: (x: number, y: number) => number
): Map<number, number> {
  const m = new Map<number, number>();

  for (const [lv, lp] of x.entries()) {
    for (const [rv, rp] of y.entries()) {
      const g = f(lv, rv);
      m.set(g, (m.get(g) ?? 0) + lp * rp);
    }
  }

  return m;
}

export function normalize(p: Map<number, number>): Map<number, number> {
  let total = 0;
  for (const x of p.values()) {
    total += x;
  }

  const m = new Map<number, number>();
  for (const [k, v] of p.entries()) {
    m.set(k, v / total);
  }
  return m;
}
