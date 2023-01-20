import { BinaryOperation, Expression } from "./dice-lang/dice-lang-ast";

type Bindings = Record<string, unknown>;

interface Pattern<B extends Bindings> {
  match: (x: Expression) => B | undefined;
}

export function b<N extends string>(name: N): Pattern<Record<N, Expression>>;

export function b<N extends string, B extends Bindings>(
  name: N,
  p: Pattern<B>
): Pattern<Record<N, Expression> & B>;

export function b<N extends string, B extends Bindings>(
  name: N,
  p?: Pattern<B>
): Pattern<Record<N, Expression> & (B | {})> {
  return {
    match: (x) => {
      if (p) {
        const m = p.match(x);
        return m ? { ...m, [name]: x } : undefined;
      }
      return { [name as N]: x } as Record<N, Expression>;
    },
  };
}

export function n(equalTo?: number): Pattern<Record<never, unknown>> {
  return {
    match: (x) =>
      typeof x === "number" && (equalTo === undefined || equalTo === x)
        ? {}
        : undefined,
  };
}

type Simplify<T> = T extends unknown ? { [P in keyof T]: T[P] } & {} : never;

export function op<L extends Bindings, R extends Bindings>(
  l: Pattern<L>,
  op: BinaryOperation["operator"],
  r: Pattern<R>
): Pattern<L & R> {
  return {
    match: (x) => {
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
    },
  };
}
