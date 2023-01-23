import P from "parsimmon";
import {
  BinaryOperation,
  bo,
  Expression,
  n,
  NumberLiteral,
} from "./dice-lang-ast";

interface DiceLanguage {
  _: string;
  __: string;

  expr: Expression;
  term: Expression;
  factor: Expression;
  factor1: Expression;
  factor2: Expression;

  numberLiteral: NumberLiteral;
}

const skldj = 1 ** (2 ** 3);

const diceLanguage = P.createLanguage<DiceLanguage>({
  _: () => P.optWhitespace,
  __: () => P.whitespace,

  numberLiteral: () =>
    P.regexp(/[+-]?([0-9]*\.)?[0-9]+/)
      .map(Number)
      .map((value): NumberLiteral => n(value))
      .desc("number"),

  factor: (r) =>
    P.alt(r.expr.wrap(P.string("("), P.string(")")), r.numberLiteral),

  factor1: (r) =>
    P.alt(
      P.seqMap(
        r.factor,
        P.string("d").trim(r._),
        r.factor,
        (left, operator, right): BinaryOperation => bo(left, operator, right)
      ),
      P.seqMap(
        P.string("d").trim(r._),
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
});

export const diceParser = diceLanguage.expr;
