export type NumberLiteral = number;

export interface BinaryOperation {
  op: "+" | "-" | "*" | "/" | "d";
  l: DiceExpression;
  r: DiceExpression;
}

export type DiceExpression = BinaryOperation | NumberLiteral;
