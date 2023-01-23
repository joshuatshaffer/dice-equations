interface NodeBase {
  type: string;
}

export interface NumberLiteral extends NodeBase {
  type: "NumberLiteral";
  value: number;
}

export interface UnaryOperation extends NodeBase {
  type: "UnaryOperation";
  operator: "-" | "!";
  operand: Expression;
}

export interface BinaryOperation extends NodeBase {
  type: "BinaryOperation";
  operator: "+" | "-" | "*" | "/" | "d";
  left: Expression;
  right: Expression;
}

export interface CallExpression extends NodeBase {
  type: "CallExpression";
  callee: string;
  args: Expression[];
}

export type Expression =
  | NumberLiteral
  | UnaryOperation
  | BinaryOperation
  | CallExpression;

export const n = <V>(value: V) => ({ type: "NumberLiteral" as const, value });

export const uo = <O, X>(operator: O, operand: X) => {
  return { type: "UnaryOperation" as const, operator, operand };
};

export const neg = <X>(x: X) => uo("-" as const, x);
export const fac = <X>(x: X) => uo("!" as const, x);

export const bo = <L, O, R>(left: L, operator: O, right: R) => {
  return { type: "BinaryOperation" as const, left, operator, right };
};

export const add = <X, Y>(x: X, y: Y) => bo(x, "+" as const, y);
export const sub = <X, Y>(x: X, y: Y) => bo(x, "-" as const, y);
export const mul = <X, Y>(x: X, y: Y) => bo(x, "*" as const, y);
export const div = <X, Y>(x: X, y: Y) => bo(x, "/" as const, y);
export const dice = <X, Y>(x: X, y: Y) => bo(x, "d" as const, y);

export const cx = <F, A>(callee: F, args: A) => {
  return { type: "CallExpression" as const, callee, args };
};
