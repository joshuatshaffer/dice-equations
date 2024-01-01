import { Program } from "./dice-lang-ast";
import { diceParser } from "./dice-lang-parse";

describe("diceParser", () => {
  const itParses = (input: string, expected: Program) => {
    it(`parses ${input}`, () => {
      expect(diceParser.tryParse(input)).toEqual(expected);
    });
  };

  itParses("0", [{ type: "NumberLiteral", value: 0 }]);
  itParses("-0", [{ type: "NumberLiteral", value: -0 }]);
  itParses("+0", [{ type: "NumberLiteral", value: +0 }]);
  itParses("1", [{ type: "NumberLiteral", value: 1 }]);
  itParses(Number.MAX_SAFE_INTEGER.toString(), [
    { type: "NumberLiteral", value: Number.MAX_SAFE_INTEGER },
  ]);
  itParses(Number.MIN_SAFE_INTEGER.toString(), [
    { type: "NumberLiteral", value: Number.MIN_SAFE_INTEGER },
  ]);
  itParses("0023", [{ type: "NumberLiteral", value: 23 }]);
  itParses("0.57", [{ type: "NumberLiteral", value: 0.57 }]);
  itParses("0.00", [{ type: "NumberLiteral", value: 0 }]);
  itParses("-0.57", [{ type: "NumberLiteral", value: -0.57 }]);

  itParses("-4", [{ type: "NumberLiteral", value: -4 }]);
  itParses("-(4)", [
    {
      type: "UnaryOperation",
      operator: "-",
      operand: { type: "NumberLiteral", value: 4 },
    },
  ]);

  // TODO: Test that space between sign and number is not allowed.

  itParses("2d5", [
    {
      type: "BinaryOperation",
      left: { type: "NumberLiteral", value: 2 },
      operator: "d",
      right: { type: "NumberLiteral", value: 5 },
    },
  ]);

  itParses("d20", [
    {
      type: "BinaryOperation",
      left: { type: "NumberLiteral", value: 1 },
      operator: "d",
      right: { type: "NumberLiteral", value: 20 },
    },
  ]);

  itParses("1d20", [
    {
      type: "BinaryOperation",
      left: { type: "NumberLiteral", value: 1 },
      operator: "d",
      right: { type: "NumberLiteral", value: 20 },
    },
  ]);

  itParses("2d(d6)", [
    {
      type: "BinaryOperation",
      left: { type: "NumberLiteral", value: 2 },
      operator: "d",
      right: {
        type: "BinaryOperation",
        left: { type: "NumberLiteral", value: 1 },
        operator: "d",
        right: { type: "NumberLiteral", value: 6 },
      },
    },
  ]);

  itParses("(1+3)d(6/4)", [
    {
      type: "BinaryOperation",
      left: {
        type: "BinaryOperation",
        left: { type: "NumberLiteral", value: 1 },
        operator: "+",
        right: { type: "NumberLiteral", value: 3 },
      },
      operator: "d",
      right: {
        type: "BinaryOperation",
        left: { type: "NumberLiteral", value: 6 },
        operator: "/",
        right: { type: "NumberLiteral", value: 4 },
      },
    },
  ]);

  itParses("floor()", [
    {
      type: "CallExpression",
      callee: "floor",
      args: [],
    },
  ]);
  itParses("floor(1)", [
    {
      type: "CallExpression",
      callee: "floor",
      args: [{ type: "NumberLiteral", value: 1 }],
    },
  ]);
  itParses("floor(1,2)", [
    {
      type: "CallExpression",
      callee: "floor",
      args: [
        { type: "NumberLiteral", value: 1 },
        { type: "NumberLiteral", value: 2 },
      ],
    },
  ]);
  itParses("floor(1,2,3)", [
    {
      type: "CallExpression",
      callee: "floor",
      args: [
        { type: "NumberLiteral", value: 1 },
        { type: "NumberLiteral", value: 2 },
        { type: "NumberLiteral", value: 3 },
      ],
    },
  ]);

  itParses("da(1,2,3)", [
    {
      type: "CallExpression",
      callee: "da",
      args: [
        { type: "NumberLiteral", value: 1 },
        { type: "NumberLiteral", value: 2 },
        { type: "NumberLiteral", value: 3 },
      ],
    },
  ]);

  // TODO: RangeExpression.
  // itParses("2d[0..1]", [
  //   {
  //     type: "BinaryOperation",
  //     left: { type: "NumberLiteral", value: 2 },
  //     operator: "d",
  //     right: { type: "RangeExpression", from: 0, then: null, to: 1 },
  //   },
  // ]);
});
