import { BinaryOperation, Expression } from "./dice-lang/dice-lang-ast";

type Bindings = Record<string, unknown>;

interface Pattern<B extends Bindings> {
  match: (x: Expression) => B | undefined;
}

export function b<N extends string>(name: N): Pattern<Record<N, Expression>>;
export function b<N extends string, B extends Bindings>(
  name: N,
  p: Pattern<B>
): Pattern<Simplify<Record<N, Expression> & B>>;
export function b<N extends string>(name: N): Pattern<Record<N, Expression>> {
  throw new Error("TODO");
}

export function n(equalTo?: number): Pattern<Record<never, unknown>> {
  throw new Error("TODO");
}

type Simplify<T> = T extends unknown ? { [P in keyof T]: T[P] } : never;

export function op<L extends Bindings, R extends Bindings>(
  l: Pattern<L>,
  op: BinaryOperation["operator"],
  r: Pattern<R>
): Pattern<Simplify<L & R>> {
  throw new Error("TODO");
}

// export function rule(p:Pattern, t:(x:))

const x = op(b("l"), "d", n(1));
