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

export function pmf(expr: Expression): Pmf<number> {
  if (expr.type === "NumberLiteral") {
    return Pmf.unit(expr.value);
  }

  if (expr.type === "UnaryOperation") {
    return pmf(expr.operand).map((x) => {
      switch (expr.operator) {
        case "-":
          return -x;
      }
    });
  }

  if (expr.type === "BinaryOperation") {
    const left = pmf(expr.left);
    const right = pmf(expr.right);
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
        return Pmf.unit(NaN);
      } else {
        return pmf(expr.args[0]).map((x) => Math[callee](x));
      }
    }

    if (callee === "choose") {
      if (expr.args.length !== 2) {
        return Pmf.unit(NaN);
      } else {
        return pmf(expr.args[0]).flatMap((n) =>
          pmf(expr.args[1]).map((k) => choose(n, k))
        );
      }
    }

    if (callee === "factorial") {
      if (expr.args.length !== 1) {
        return Pmf.unit(NaN);
      } else {
        return pmf(expr.args[0]).map((n) => factorial(n));
      }
    }

    if (callee === "highest") {
      if (
        expr.args.length !== 2 ||
        expr.args[1].type !== "BinaryOperation" ||
        expr.args[1].operator !== "d"
      ) {
        return Pmf.unit(NaN);
      } else {
        const {
          args: [K, { left: N, right: M }],
        } = expr;

        return pmf(K).flatMap((k) =>
          pmf(N).flatMap((n) => pmf(M).flatMap((m) => highest(k, n, m)))
        );
      }
    }

    if (callee === "lowest") {
      if (
        expr.args.length !== 2 ||
        expr.args[1].type !== "BinaryOperation" ||
        expr.args[1].operator !== "d"
      ) {
        return Pmf.unit(NaN);
      } else {
        const {
          args: [K, { left: N, right: M }],
        } = expr;

        return pmf(K).flatMap((k) =>
          pmf(N).flatMap((n) => pmf(M).flatMap((m) => lowest(k, n, m)))
        );
      }
    }

    if (callee === "analyticDice") {
      if (expr.args.length !== 2) {
        return Pmf.unit(NaN);
      } else {
        const n1 = pmf(expr.args[0]);
        const s1 = pmf(expr.args[1]);

        return n1.flatMap((n) => s1.flatMap((s) => analyticDice(n, s)));
      }
    }

    if (callee === "explode") {
      if (expr.args.length !== 2) {
        return Pmf.unit(NaN);
      } else {
        const base = pmf(expr.args[0]);

        const [maxEvent, ...lesserEvents] = [...base].sort(([a], [b]) => b - a);

        return pmf(expr.args[1]).flatMap((limit) => {
          let exploded = base;
          for (let i = 0; i < limit; ++i) {
            exploded = Pmf.build((b) => {
              // Copy lesser events.
              for (const [event, probability] of lesserEvents) {
                b(event, probability);
              }

              // Replace max event with a sum of max event and lesser events.
              for (const [event, probability] of exploded) {
                b(event + maxEvent[0], probability * maxEvent[1]);
              }
            });
          }

          return exploded;
        });
      }
    }

    return Pmf.unit(NaN);
  }

  throw new TypeError("Invalid node type");
}

function singleDie(sides: number) {
  if (sides < 1) {
    return Pmf.unit(NaN);
  }

  return Pmf.build<number>((b) => {
    for (let i = 1; i <= sides; ++i) {
      b(i, 1 / sides);
    }
  });
}

// This is related to the Irwin-Hall distribution.
function dice(numberOfDice: Pmf<number>, sides: Pmf<number>): Pmf<number> {
  const d = sides.flatMap((s) => singleDie(s));
  return numberOfDice.flatMap((n) => monoidMult((w, z) => w + z, n, d));
}

/**
 * An analytic solution for the PMF of the sum of n dice with s sides.
 *
 * Adapted from https://towardsdatascience.com/modelling-the-probability-distributions-of-dice-b6ecf87b24ea
 */
function analyticDice(n: number, s: number): Pmf<number> {
  return Pmf.build((b) => {
    for (let T = n; T <= s * n; T++) {
      b(
        T,
        (1 / s) ** n *
          [...Array(Math.floor((T - n) / s) + 1)].reduce(
            (a, _, k) =>
              a +
              (-1) ** k *
                choose(n, k) *
                (factorial(T - s * k - 1) /
                  (factorial(T - s * k - n) * factorial(n - 1))),
            0
          )
      );
    }
  });
}

function* possibleDice(
  numberOfDice: number,
  sides: number
): Generator<[number[], number], void, void> {
  const p = 1 / sides ** numberOfDice;

  const diceCounters: number[] = [...Array(numberOfDice)].map(() => 1);

  const incrementCountersAndReturnIsDone = () => {
    for (let i = 0; i < numberOfDice; i++) {
      diceCounters[i]++;
      if (diceCounters[i] <= sides) {
        return false;
      }
      diceCounters[i] = 1;
    }
    return true;
  };

  do {
    yield [[...diceCounters], p];
  } while (!incrementCountersAndReturnIsDone());
}

function a2s(a: number[]) {
  return a.join(",");
}

function s2a(s: string) {
  return s.split(",").map((x) => Number(x));
}

function setsOfDice(
  highest: boolean,
  numberOfDiceToKeep: number,
  numberOfDice: number,
  sides: number
): Pmf<number> {
  return monoidMult(
    (w, z) =>
      a2s(
        [...s2a(w), ...s2a(z)]
          .sort((a, b) => (highest ? b - a : a - b))
          .slice(0, numberOfDiceToKeep)
      ),
    numberOfDice,
    Pmf.build<string>((b) => {
      for (let i = 1; i <= sides; ++i) {
        b(a2s([i]), 1 / sides);
      }
    })
  ).map((x) => s2a(x).reduce((a, b) => a + b, 0));
}

function monoidMult<T>(
  op: (w: T, z: T) => T,
  times: number,
  x: Pmf<T>
): Pmf<T> {
  let m = x;
  let i = 1;
  while (i < times) {
    if (2 * i <= times) {
      m = m.flatMap((w) => m.map((z) => op(w, z)));
      i *= 2;
    } else {
      m = m.flatMap((w) => x.map((z) => op(w, z)));
      ++i;
    }
  }

  return m;
}

// TODO: `setsOfDice` is slow. Replace this with a faster implementation.
function highest(
  numberOfDiceToKeep: number,
  numberOfDice: number,
  sides: number
): Pmf<number> {
  // This special case is known to have a faster solution.
  if (numberOfDiceToKeep === 1) {
    return Pmf.build((b) => {
      for (let i = 1; i <= sides; ++i) {
        b(
          i,
          (i ** numberOfDice - (i - 1) ** numberOfDice) / sides ** numberOfDice
        );
      }
    });
  }

  return setsOfDice(true, numberOfDiceToKeep, numberOfDice, sides);
}

// TODO: `setsOfDice` is slow. Replace this with a faster implementation.
function lowest(
  numberOfDiceToKeep: number,
  numberOfDice: number,
  sides: number
): Pmf<number> {
  // This special case is known to have a faster solution.
  if (numberOfDiceToKeep === 1) {
    return Pmf.build((b) => {
      for (let i = 1; i <= sides; ++i) {
        b(
          i,
          ((sides - i + 1) ** numberOfDice - (sides - i) ** numberOfDice) /
            sides ** numberOfDice
        );
      }
    });
  }

  return setsOfDice(false, numberOfDiceToKeep, numberOfDice, sides);
}

type PmfEntry<T> = [event: T, probability: number];

class Pmf<T> implements Iterable<PmfEntry<T>> {
  private constructor(private readonly m: ReadonlyMap<T, number>) {}

  [Symbol.iterator](): Iterator<PmfEntry<T>> {
    return this.m.entries();
  }

  map<U>(f: (x: T) => U): Pmf<U> {
    return Pmf.build((b) => {
      for (const [x, p] of this) {
        b(f(x), p);
      }
    });
  }

  flatMap<U>(f: (x: T) => Pmf<U>): Pmf<U> {
    return Pmf.build((b) => {
      for (const [x, xp] of this) {
        for (const [y, yp] of f(x)) {
          b(y, xp * yp);
        }
      }
    });
  }

  static unit<T>(event: T) {
    return new Pmf(new Map([[event, 1]]));
  }

  static build<T>(
    builder: (addEvent: (event: T, probability: number) => void) => void
  ) {
    const m = new Map<T, number>();
    builder((x, p) => {
      m.set(x, (m.get(x) ?? 0) + p);
    });
    return new Pmf(m);
  }
}
