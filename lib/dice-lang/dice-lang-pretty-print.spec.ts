import fc from "fast-check";
import P from "parsimmon";
import { Expression } from "./dice-lang-ast";
import { diceParser } from "./dice-lang-parse";
import { dicePrettyPrint } from "./dice-lang-pretty-print";
import { arbDiceExpression } from "./dice-lang-test-utils";

describe("dicePrettyPrint", () => {
  it("Pretty printing and re-parsing does not change the AST", () => {
    fc.assert(
      fc.property(arbDiceExpression.expr, (expr) => {
        expect(diceParser.parse(dicePrettyPrint(expr))).toEqual<
          P.Success<Expression>
        >({ status: true, value: expr });
      })
    );
  });
});
