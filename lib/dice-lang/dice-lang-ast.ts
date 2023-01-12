export type NumberLiteral = number;

export interface BinaryOperation {
  operator: "+" | "-" | "*" | "/" | "d";
  left: Expression;
  right: Expression;
}

export type Expression = BinaryOperation | NumberLiteral;
