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
        for (const [lv, lp] of l.entries()) {
          for (const [rv, rp] of r.entries()) {
            for (let i = 1; i <= rv; ++i) {
              yield [i, lp + rp];
            }
          }
        }
      })()
    );
  }

  if (op === "+") {
    return new Map(
      (function* () {
        for (const [lv, lp] of l.entries()) {
          for (const [rv, rp] of r.entries()) {
            yield [lv + rv, lp + rp];
          }
        }
      })()
    );
  }

  return new Map();
}

function corg(
  x: Map<number, number>,
  y: Map<number, number>,
  f: (x: number, y: number) => Iterable<number>
): Map<number, number> {
  const m = new Map<number, number>();

  for (const [lv, lp] of x.entries()) {
    for (const [rv, rp] of y.entries()) {
      for (const g of f(lv, rv)) {
        m.set(g, (m.get(g) ?? 0) + lp + rp);
      }
    }
  }

  return m;
}
