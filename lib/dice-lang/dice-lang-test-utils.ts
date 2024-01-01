import fc from "fast-check";
import {
  ArrayLiteral,
  BinaryOperation,
  CallExpression,
  Expression,
  NumberLiteral,
  Program,
  RangeExpression,
  Statement,
  UnaryOperation,
  binaryOperators,
  unaryOperators,
} from "./dice-lang-ast";

const depthIdentifier = fc.createDepthIdentifier();

export const arbDiceAst = fc.letrec<{
  numberLiteral: NumberLiteral;
  unaryOperation: UnaryOperation;
  binaryOperation: BinaryOperation;
  callExpression: CallExpression;
  rangeExpression: RangeExpression;
  arrayLiteral: ArrayLiteral;
  expression: Expression;
  statement: Statement;
  program: Program;
}>((tie) => ({
  numberLiteral: fc.nat().map((value) => ({ type: "NumberLiteral", value })),

  unaryOperation: fc.record({
    type: fc.constant("UnaryOperation"),
    operator: fc.constantFrom(...unaryOperators),
    operand: tie("expression"),
  }),

  binaryOperation: fc.record({
    type: fc.constant("BinaryOperation"),
    left: tie("expression"),
    operator: fc.constantFrom(...binaryOperators),
    right: tie("expression"),
  }),

  callExpression: fc.record({
    type: fc.constant("CallExpression"),
    callee: fc
      .stringMatching(/^[ac-zA-Z_][a-zA-Z0-9_]*$/)
      .filter((callee) => callee !== "d"),
    args: fc.array(tie("expression"), { depthIdentifier }),
  }),

  rangeExpression: fc.record({
    type: fc.constant("RangeExpression"),
    from: tie("expression"),
    then: fc.option(tie("expression"), { depthIdentifier }),
    to: tie("expression"),
  }),

  arrayLiteral: fc.record({
    type: fc.constant("ArrayLiteral"),
    elements: fc.array(tie("expression"), { depthIdentifier }),
  }),

  expression: fc.oneof(
    { depthIdentifier },
    tie("numberLiteral"),
    tie("unaryOperation"),
    tie("binaryOperation"),
    tie("callExpression")
  ),

  statement: tie("expression"),

  program: fc.array(tie("statement"), { depthIdentifier }),
}));
