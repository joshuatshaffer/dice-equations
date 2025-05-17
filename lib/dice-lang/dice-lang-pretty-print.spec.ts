import fc from "fast-check";
import P from "parsimmon";
import { describe, expect, it } from "vitest";
import { Program } from "./dice-lang-ast";
import { diceParser } from "./dice-lang-parse";
import { dicePrettyPrint } from "./dice-lang-pretty-print";
import { arbDiceAst } from "./dice-lang-test-utils";

describe("dicePrettyPrint", () => {
  it("Pretty printing and re-parsing does not change the AST", () => {
    fc.assert(
      fc.property(arbDiceAst.program, (program) => {
        expect(diceParser.parse(dicePrettyPrint(program))).toEqual<
          P.Success<Program>
        >({ status: true, value: program });
      })
    );
  });

  it("Minifying and re-parsing does not change the AST", () => {
    fc.assert(
      fc.property(arbDiceAst.program, (program) => {
        expect(
          diceParser.parse(dicePrettyPrint(program, { format: "min" }))
        ).toEqual<P.Success<Program>>({ status: true, value: program });
      })
    );
  });

  it("Printing with pedantic parens and re-parsing does not change the AST", () => {
    fc.assert(
      fc.property(arbDiceAst.program, (program) => {
        expect(
          diceParser.parse(
            dicePrettyPrint(program, { format: "pedanticParens" })
          )
        ).toEqual<P.Success<Program>>({ status: true, value: program });
      })
    );
  });
});
