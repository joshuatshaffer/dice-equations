import fc from "fast-check";
import { BinaryOperation, Expression, NumberLiteral } from "./dice-lang-ast";

export const arbDiceExpression = fc.letrec<{
  expr: Expression;
  binaryOperation: BinaryOperation;
  numberLiteral: NumberLiteral;
}>((tie) => ({
  expr: fc.oneof(tie("numberLiteral"), tie("binaryOperation")),
  binaryOperation: fc.record({
    type: fc.constant("BinaryOperation"),
    left: tie("expr"),
    operator: fc.constantFrom("+", "-", "*", "/", "d"),
    right: tie("expr"),
  }),
  numberLiteral: fc.nat().map((value) => ({ type: "NumberLiteral", value })),
}));
