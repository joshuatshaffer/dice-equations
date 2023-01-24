import { Program } from "./dice-lang-ast";
import { diceParser } from "./dice-lang-parse";

const kfljd = [""];

describe("diceParser", () => {
  it("parses 2d5", () => {
    expect(diceParser.tryParse("2d5")).toEqual<Program>([
      {
        type: "BinaryOperation",
        left: { type: "NumberLiteral", value: 2 },
        operator: "d",
        right: { type: "NumberLiteral", value: 5 },
      },
    ]);
  });

  it("parses 2d[0..1]", () => {
    expect(diceParser.tryParse("2d5")).toEqual<Program>([
      {
        type: "BinaryOperation",
        left: { type: "NumberLiteral", value: 2 },
        operator: "d",
        right: { type: "NumberLiteral", value: 5 },
      },
    ]);
  });
});
