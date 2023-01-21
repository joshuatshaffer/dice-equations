import { Expression } from "./dice-lang/dice-lang-ast";

export function prob(diceExpr: Expression): Prob<number> {
  if (typeof diceExpr === "number") {
    return Prob.unit(diceExpr);
  }

  const left = prob(diceExpr.left);
  const right = prob(diceExpr.right);
  const operator = diceExpr.operator;

  if (operator === "d") {
    return dice(left, right);
  }

  return left.flatMap((x) =>
    right.map((y) => {
      switch (operator) {
        case "+":
          return x + y;
        case "-":
          return x - y;
        case "*":
          return x * y;
        case "/":
          return x / y;
      }
    })
  );
}

function singleDie(sides: number) {
  if (sides < 1) {
    return Prob.unit(NaN);
  }

  const b = new ProbBuilder<number>();

  for (let i = 1; i <= sides; ++i) {
    b.add(i, 1 / sides);
  }

  return b.build();
}

function dice(numberOfDice: Prob<number>, sides: Prob<number>): Prob<number> {
  const d = sides.flatMap((s) => singleDie(s));
  return numberOfDice.flatMap((n) => sumOfRepeats(n, d));
}

function sumOfRepeats(times: number, x: Prob<number>): Prob<number> {
  if (times < 1) {
    return Prob.unit(NaN);
  }

  let m = x;

  for (let i = 1; i < times; ++i) {
    m = m.flatMap((w) => x.map((z) => w + z));
  }

  return m;
}

class Prob<T> implements Iterable<[T, number]> {
  private readonly m: ReadonlyMap<T, number>;

  constructor(iterable: Iterable<readonly [T, number]>) {
    this.m = iterable instanceof Map ? iterable : new Map<T, number>(iterable);
  }

  [Symbol.iterator](): Iterator<[T, number]> {
    return this.m.entries();
  }

  map<U>(f: (x: T) => U): Prob<U> {
    const b = new ProbBuilder<U>();

    for (const [x, p] of this) {
      b.add(f(x), p);
    }

    return b.build();
  }

  flatMap<U>(f: (x: T) => Prob<U>): Prob<U> {
    const b = new ProbBuilder<U>();

    for (const [x, xp] of this) {
      for (const [y, yp] of f(x)) {
        b.add(y, xp * yp);
      }
    }

    return b.build();
  }

  static unit<T>(event: T) {
    return new Prob([[event, 1]]);
  }
}

class ProbBuilder<T> {
  private readonly m = new Map<T, number>();

  add(event: T, probability: number) {
    this.m.set(event, (this.m.get(event) ?? 0) + probability);
  }

  build() {
    return new Prob(this.m);
  }
}
