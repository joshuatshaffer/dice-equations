import { Expression } from "./dice-lang/dice-lang-ast";
import { choose, factorial } from "./math-helpers";

type UnaryMathFunctions = {
  [P in keyof Math]: ((x: number) => number) extends Math[P] ? P : never;
}[keyof Math];

const UnaryMathFunctions = [
  "sin",
  "cos",
  "tan",
  "acos",
  "asin",
  "atan",
  "sinh",
  "cosh",
  "tanh",
  "acosh",
  "asinh",
  "atanh",

  "abs",
  "sign",

  "floor",
  "ceil",
  "round",
  "trunc",
] as const satisfies readonly UnaryMathFunctions[];

function isElementOf<T>(s: readonly T[], x: unknown): x is T {
  return (s as readonly unknown[]).includes(x);
}

export function prob(expr: Expression): Prob<number> {
  if (expr.type === "NumberLiteral") {
    return Prob.unit(expr.value);
  }

  if (expr.type === "UnaryOperation") {
    return prob(expr.operand).map((x) => {
      switch (expr.operator) {
        case "-":
          return -x;
        case "!":
          return factorial(x);
      }
    });
  }

  if (expr.type === "BinaryOperation") {
    const left = prob(expr.left);
    const right = prob(expr.right);
    const operator = expr.operator;

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
          case "%":
            return x % y;
          case "**":
            return x ** y;
        }
      })
    );
  }

  if (expr.type === "CallExpression") {
    const callee = expr.callee;

    if (isElementOf(UnaryMathFunctions, callee)) {
      if (expr.args.length !== 1) {
        return Prob.unit(NaN);
      } else {
        return prob(expr.args[0]).map((x) => Math[callee](x));
      }
    }

    if (callee === "choose") {
      if (expr.args.length !== 2) {
        return Prob.unit(NaN);
      } else {
        return prob(expr.args[0]).flatMap((n) =>
          prob(expr.args[1]).map((k) => choose(n, k))
        );
      }
    }

    if (callee === "factorial") {
      if (expr.args.length !== 1) {
        return Prob.unit(NaN);
      } else {
        return prob(expr.args[0]).map((n) => factorial(n));
      }
    }

    return Prob.unit(NaN);
  }

  throw new TypeError("Invalid node type");
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

// This is related to the Irwin-Hall distribution.
function dice(numberOfDice: Prob<number>, sides: Prob<number>): Prob<number> {
  const d = sides.flatMap((s) => singleDie(s));
  return numberOfDice.flatMap((n) => sumOfRepeats(n, d));
}

function sumOfRepeats(times: number, x: Prob<number>): Prob<number> {
  if (times < 0) {
    return Prob.unit(NaN);
  }
  if (times === 0) {
    return Prob.unit(0);
  }

  let m = x;
  let i = 1;
  while (i < times) {
    if (2 * i <= times) {
      m = m.flatMap((w) => m.map((z) => w + z));
      i *= 2;
    } else {
      m = m.flatMap((w) => x.map((z) => w + z));
      ++i;
    }
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
