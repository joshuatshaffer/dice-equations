import { BinaryOperation, Expression } from "./dice-lang/dice-lang-ast";

type Simplify<T> = T extends unknown ? { [P in keyof T]: T[P] } & {} : never;

type Bindings = Record<string, unknown>;

class Pattern<I, O extends I, B extends Bindings> {
  constructor(public readonly match: (i: I) => B | undefined) {}

  test(i: I): i is O {
    return this.match(i) !== undefined;
  }
}

export type InferBindings<T extends Pattern<any, any, any>> = Simplify<
  Exclude<ReturnType<T["match"]>, undefined>
>;

export function b<N extends string, I, O extends I>(
  name: N
): Pattern<I, O, Record<N, O>>;

export function b<N extends string, I, O extends I, B extends Bindings>(
  name: N,
  p: Pattern<I, O, B>
): Pattern<I, O, Record<N, O> & B>;

export function b<N extends string, I, O extends I, B extends Bindings>(
  name: N,
  p?: Pattern<I, O, B>
): Pattern<I, O, Record<N, O> & (B | {})> {
  return new Pattern<I, O, Record<N, O> & (B | {})>((x) => {
    if (p) {
      const m = p.match(x);
      return m ? ({ ...m, [name]: x } as Record<N, O> & B) : undefined;
    }
    return { [name as N]: x } as Record<N, O>;
  });
}

export function n(equalTo?: number) {
  return new Pattern<unknown, number, Record<never, unknown>>((x) =>
    typeof x === "number" && (equalTo === undefined || equalTo === x)
      ? {}
      : undefined
  );
}

export function op<LB extends Bindings, RB extends Bindings>(
  l: Pattern<Expression, Expression, LB>,
  op: BinaryOperation["operator"],
  r: Pattern<Expression, Expression, RB>
) {
  return new Pattern<Expression, Expression, LB & RB>((x) => {
    if (typeof x === "number" || x.operator !== op) {
      return undefined;
    }

    const lm = l.match(x.left);
    if (lm === undefined) {
      return undefined;
    }

    const rm = r.match(x.right);
    if (rm === undefined) {
      return undefined;
    }

    return { ...lm, ...rm };
  });
}
