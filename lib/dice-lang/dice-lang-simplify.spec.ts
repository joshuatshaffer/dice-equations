import { diceParser } from "./dice-lang-parse";
import { diceLangSimplify } from "./dice-lang-simplify";

describe("diceLangSimplify", () => {
  const testCases = ["1+1 -> 2", "2/3 -> 2/3", "0d3 -> 0"] as const;

  for (const testCase of testCases) {
    it(`Simplifies ${testCase}`, () => {
      const [from, to] = testCase
        .split(" -> ")
        .map((x) => diceParser.tryParse(x));
      expect(diceLangSimplify(from)).toEqual(to);
    });
  }
});
