import P from "parsimmon";
import {
  BinaryOperation,
  bo,
  CallExpression,
  cx,
  Expression,
  n,
  NumberLiteral,
  Program,
  Statement,
} from "./dice-lang-ast";

interface DiceLanguage {
  _: string;
  __: string;

  program: Program;
  statement: Statement;

  expr: Expression;
  term: Expression;
  factor: Expression;
  factor1: Expression;
  factor2: Expression;

  callExpression: CallExpression;

  numberLiteral: NumberLiteral;
}

const diceLanguage = P.createLanguage<DiceLanguage>({
  _: () => P.optWhitespace,
  __: () => P.whitespace,

  numberLiteral: () =>
    P.regexp(/[+-]?([0-9]*\.)?[0-9]+/)
      .map(Number)
      .map((value): NumberLiteral => n(value))
      .desc("number"),

  callExpression: (r) =>
    P.seqMap(
      P.regex(/[a-zA-Z_][a-zA-Z0-9_]*/),
      P.sepBy(r.expr, P.string(",").trim(r._)).wrap(
        P.string("("),
        P.string(")")
      ),
      (callee, args): CallExpression => cx(callee, args)
    ),

  factor: (r) =>
    P.alt(
      r.expr.wrap(P.string("("), P.string(")")),
      r.callExpression,
      r.numberLiteral
    ),

  factor1: (r) =>
    P.alt(
      P.seqMap(
        r.factor,
        P.string("d")
          // So that identifiers can start with "d".
          .notFollowedBy(P.regex(/[a-zA-Z_]/))
          .trim(r._),
        r.factor,
        (left, operator, right): BinaryOperation => bo(left, operator, right)
      ),
      P.seqMap(
        P.string("d")
          // So that identifiers can start with "d".
          .notFollowedBy(P.regex(/[a-zA-Z_]/))
          .trim(r._),
        r.factor,
        (operator, right): BinaryOperation => bo(n(1), operator, right)
      ),
      r.factor
    ),

  factor2: (r) =>
    P.alt(
      P.seqMap(
        r.factor1,
        P.string("**").trim(r._),
        r.factor2,
        (left, operator, right): BinaryOperation => bo(left, operator, right)
      ),
      r.factor1
    ),

  term: (r) =>
    P.seqMap(
      r.factor2,
      P.seq(
        P.alt(P.string("*"), P.string("/"), P.string("%")).trim(r._),
        r.factor2
      ).many(),
      (first, rest) =>
        rest.reduce(
          (left, [operator, right]): BinaryOperation =>
            bo(left, operator, right),
          first
        )
    ),

  expr: (r) =>
    P.seqMap(
      r.term,
      P.seq(P.alt(P.string("+"), P.string("-")).trim(r._), r.term).many(),
      (first, rest) =>
        rest.reduce(
          (left, [operator, right]): BinaryOperation =>
            bo(left, operator, right),
          first
        )
    ).trim(r._),

  statement: (r) => r.expr,

  program: (r) => P.sepBy(r.statement, P.string(";")),
});

export const diceParser = diceLanguage.program;
