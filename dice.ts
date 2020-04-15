console.log("start");

type Exp =
  | number
  | {
      op: "add" | "sub" | "mul" | "div";
      a: Exp;
      b: Exp;
    }
  | {
      op: "die";
      a: number;
      b: number;
    };

function rollDice(num: number, sides: number): number {
  let total: number = 0;
  for (let i = 0; i < num; ++i) {
    const n = Math.floor(Math.random() * Math.floor(sides));
    total += n;
  }
  return total;
}

function evalExp(e: Exp): number {
  if (typeof e === "number") {
    return e;
  } else if (e.op === "add") {
    return evalExp(e.a) + evalExp(e.b);
  } else if (e.op === "sub") {
    return evalExp(e.a) - evalExp(e.b);
  } else if (e.op === "mul") {
    return evalExp(e.a) * evalExp(e.b);
  } else if (e.op === "div") {
    return evalExp(e.a) / evalExp(e.b);
  } else if (e.op === "die") {
    return rollDice(e.a, e.b);
  } else {
    throw new Error("The expression is not valid.");
  }
}

function normalize(a: Record<number, number>): Record<number, number> {
  const c: Record<number, number> = {};

  const total = Object.values(a).reduce((x, y) => x + y);
  for (const [av, am] of Object.entries(a)) {
    c[Number(av)] = am / total;
  }

  return c;
}

function foo(
  a: Record<number, number>,
  b: Record<number, number>,
  f: (x: number, y: number) => number
): Record<number, number> {
  const c: Record<number, number> = {};

  for (const [av, am] of Object.entries(a)) {
    for (const [bv, bm] of Object.entries(b)) {
      const cv = f(Number(av), Number(bv));
      const cm = am + bm;

      if (c[cv] === undefined) {
        c[cv] = cm;
      } else {
        c[cv] += cm;
      }
    }
  }

  return normalize(c);
}

function evalPmf(e: Exp): Record<number, number> {
  if (typeof e === "number") {
    return { [e]: 1 };
  } else {
    const a = evalPmf(e.a);
    const b = evalPmf(e.b);
    if (e.op === "add") {
      return foo(a, b, (x, y) => x + y);
    } else if (e.op === "sub") {
      return foo(a, b, (x, y) => x - y);
    } else if (e.op === "mul") {
      return foo(a, b, (x, y) => x * y);
    } else if (e.op === "div") {
      return foo(a, b, (x, y) => x / y);
    } else if (e.op === "die") {
      const c: Record<number, number> = {};

      for (let i = 1; i <= e.b; ++i) {
        c[i] = 1 / e.b;
      }

      return c;
    } else {
      throw new Error("The expression is not valid.");
    }
  }
}

function* dieEvents(sides: number) {
  for (let i = 1; i <= sides; ++i) yield i;
}

function fillArray<T>(x: T, num: number): T[] {
  const a = [];
  for (let i = 0; i < num; ++i) a.push(x);
  return a;
}

function* diceEvents(num: number, sides: number) {
  const dice = fillArray(1, num);

  while (true) {
    dice[i]++;
    if (dice[i] < sides) {
      break;
    } else {
      dice[i] = 0;
    }
  }
}

function* evalEvents(e: Exp): IterableIterator<number> {
  if (typeof e === "number") {
    yield e;
  } else if (e.op === "add") {
    for (const x of evalEvents(e.a))
      for (const y of evalEvents(e.b)) yield x + y;
  } else if (e.op === "sub") {
    for (const x of evalEvents(e.a))
      for (const y of evalEvents(e.b)) yield x - y;
  } else if (e.op === "mul") {
    for (const x of evalEvents(e.a))
      for (const y of evalEvents(e.b)) yield x * y;
  } else if (e.op === "div") {
    for (const x of evalEvents(e.a))
      for (const y of evalEvents(e.b)) yield x / y;
  } else if (e.op === "die") {
    for (let i = 1; i <= e.b; ++i) yield i;
  } else {
    throw new Error("The expression is not valid.");
  }
}

for (const x of evalEvents({
  op: "add",
  a: { op: "die", a: 1, b: 4 },
  b: {
    op: "add",
    a: { op: "die", a: 1, b: 4 },
    b: { op: "die", a: 1, b: 4 }
  }
}))
  console.log(x);
