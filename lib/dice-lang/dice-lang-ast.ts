import type P from "parsimmon";

interface Node {
  type: string;
  start: P.Index;
  end: P.Index;
}

export interface NumberLiteral extends Node {
  type: "NumberLiteral";
  value: number;
}

export interface BinaryOperation extends Node {
  type: "BinaryOperation";
  operator: "+" | "-" | "*" | "/" | "d";
  left: Expression;
  right: Expression;
}

export type Expression = BinaryOperation | NumberLiteral;
