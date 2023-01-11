import fc from "fast-check";
import {
  BinaryOperation,
  DiceExpression,
  NumberLiteral,
} from "./dice-lang-ast";

export const arbDiceExpression = fc.letrec<{
  expr: DiceExpression;
  binaryOperation: BinaryOperation;
  numberLiteral: NumberLiteral;
}>((tie) => ({
  expr: fc.oneof(tie("numberLiteral"), tie("binaryOperation")),
  binaryOperation: fc.record({
    l: tie("expr"),
    op: fc.constantFrom("+", "-", "*", "/", "d"),
    r: tie("expr"),
  }),
  numberLiteral: fc.nat(),
}));
