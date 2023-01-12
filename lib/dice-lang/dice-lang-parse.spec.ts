import P from "parsimmon";
import { DiceExpression } from "./dice-lang-ast";
import { diceParser } from "./dice-lang-parse";

describe("diceParser", () => {
  it("works", () => {
    expect(diceParser.parse("2d5")).toEqual<P.Success<DiceExpression>>({
      status: true,
      value: { left: 2, operator: "d", right: 5 },
    });
  });
});
