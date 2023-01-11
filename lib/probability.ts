import { DiceExpression } from "./parseDice";

export function prob(diceExpr: DiceExpression): Map<number, number> {
  if (typeof diceExpr === "number") {
    return new Map([[diceExpr, 1]]);
  }

  const l = prob(diceExpr.l);
  const r = prob(diceExpr.r);
  const op = diceExpr.op;

  if (op === "d") {
    const s = snorg(r, (s) => dice(s));
    return snorg(l, (lv) => plorg(lv, s));
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

function dice(sides: number): Map<number, number> {
  return new Map(
    (function* () {
      for (let i = 1; i <= sides; ++i) {
        yield [i, 1 / sides];
      }
    })()
  );
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

function snorg(
  x: Map<number, number>,
  f: (x: number) => Map<number, number>
): Map<number, number> {
  const m = new Map<number, number>();

  for (const [xv, xp] of x.entries()) {
    for (const [yv, yp] of f(xv).entries()) {
      m.set(yv, (m.get(yv) ?? 0) + xp * yp);
    }
  }

  return m;
}

function plorg(times: number, x: Map<number, number>): Map<number, number> {
  let m = new Map<number, number>(x);

  for (let i = 1; i < times; ++i) {
    m = corg(m, x, (w, z) => w + z);
  }

  return m;
}
