import { Expression } from "./dice-lang/dice-lang-ast";

export function prob(diceExpr: Expression): Prob<number> {
  if (typeof diceExpr === "number") {
    return new Map([[diceExpr, 1]]);
  }

  const left = prob(diceExpr.left);
  const right = prob(diceExpr.right);
  const operator = diceExpr.operator;

  if (operator === "d") {
    const s = flatMap(right, (s) => dice(s));
    return flatMap(left, (lv) => plorg(lv, s));
  }

  return corg(left, right, function (lv, rv) {
    switch (operator) {
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

function dice(sides: number): Prob<number> {
  return new Map(
    (function* () {
      for (let i = 1; i <= sides; ++i) {
        yield [i, 1 / sides];
      }
    })()
  );
}

function corg<T, U, V>(x: Prob<T>, y: Prob<U>, f: (x: T, y: U) => V): Prob<V> {
  const m = new Map<V, number>();

  for (const [lv, lp] of x.entries()) {
    for (const [rv, rp] of y.entries()) {
      const g = f(lv, rv);
      m.set(g, (m.get(g) ?? 0) + lp * rp);
    }
  }

  return m;
}

function map<T, U>(x: Prob<T>, f: (x: T) => U): Prob<U> {
  const m = new Map<U, number>();

  for (const [xv, xp] of x.entries()) {
    const yv = f(xv);
    m.set(yv, (m.get(yv) ?? 0) + xp);
  }

  return m;
}

function flatMap<T, U>(x: Prob<T>, f: (x: T) => Prob<U>): Prob<U> {
  const m = new Map<U, number>();

  for (const [xv, xp] of x.entries()) {
    for (const [yv, yp] of f(xv).entries()) {
      m.set(yv, (m.get(yv) ?? 0) + xp * yp);
    }
  }

  return m;
}

function plorg(times: number, x: Prob<number>): Prob<number> {
  let m = new Map<number, number>(x);

  for (let i = 1; i < times; ++i) {
    m = corg(m, x, (w, z) => w + z);
  }

  return m;
}

type Prob<T> = Map<T, number>;
