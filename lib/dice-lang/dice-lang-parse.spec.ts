import { Program } from "./dice-lang-ast";
import { diceParser } from "./dice-lang-parse";

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
});
