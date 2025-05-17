import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { diceParser } from "./dice-lang-parse";
import { diceLangSimplify } from "./dice-lang-simplify";
import { arbDiceAst } from "./dice-lang-test-utils";

describe("diceLangSimplify", () => {
  const testCases = [
    "1+1 -> 2",
    "2/3 -> 2/3",
    "0d3 -> 0",
    "highest(1, d5) -> d5",
    "highest(2, 2d8) -> 2d8",
    "lowest(1, d5) -> d5",
    "lowest(2, 2d8) -> 2d8",
    "-(4) -> -4",
    "-(-(d2)) -> d2",
    "1 - (-(d2)) -> 1 + d2",
    "1 + (-(d2)) -> 1 - d2",
    "-(1 - d2) -> d2 - 1",
    "explode(d6, 0) -> d6",
  ] as const;

  for (const testCase of testCases) {
    it(`Simplifies ${testCase}`, () => {
      const [from, to] = testCase
        .split(" -> ")
        .map((x) => diceParser.tryParse(x));
      expect(diceLangSimplify(from)).toEqual(to);
    });
  }

  it("is idempotent", () => {
    fc.assert(
      fc.property(arbDiceAst.program, (program) => {
        const first = diceLangSimplify(program);
        const second = diceLangSimplify(first);
        expect(second).toEqual(first);
      })
    );
  });
});
