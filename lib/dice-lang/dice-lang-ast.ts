import type P from "parsimmon";

interface Node {
  type: string;
  start: P.Index;
  end: P.Index;
}

export type NumberLiteral = number;

export interface BinaryOperation {
  op: "+" | "-" | "*" | "/" | "d";
  l: DiceExpression;
  r: DiceExpression;
}

export type DiceExpression = BinaryOperation | NumberLiteral;
