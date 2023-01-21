interface NodeBase {
  type: string;
}

export interface NumberLiteral extends NodeBase {
  type: "NumberLiteral";
  value: number;
}

export interface UnaryOperation extends NodeBase {
  type: "UnaryOperation";
  operator: "+" | "-" | "!";
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
