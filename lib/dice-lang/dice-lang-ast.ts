import type P from "parsimmon";

interface Node {
  type: string;
  start: P.Index;
  end: P.Index;
}

export type NumberLiteral = number;

export interface BinaryOperation {
  operator: "+" | "-" | "*" | "/" | "d";
  left: DiceExpression;
  right: DiceExpression;
}

export type DiceExpression = BinaryOperation | NumberLiteral;
