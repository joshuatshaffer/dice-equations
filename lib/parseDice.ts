import P from "parsimmon";

// expr := term + term | term - term | term
// term := factor * factor | factor / factor | factor
// factor' := d-opp | factor
// factor := (expr) | int
//
// d-opp := factor d factor | d factor

export type DiceExpression =
  | {
      op: "+" | "-" | "*" | "/" | "d";
      l: DiceExpression;
      r: DiceExpression;
    }
  | number;

interface DiceLanguage {
  _: string;
  __: string;

  expr: DiceExpression;
  term: DiceExpression;
  factor: DiceExpression;
  factor1: DiceExpression;

  numberLiteral: number;
}

export const diceLanguage = P.createLanguage<DiceLanguage>({
  _: () => P.optWhitespace,
  __: () => P.whitespace,

  numberLiteral: () => P.regexp(/[+-]?([0-9]*\.)?[0-9]+/).map(Number),

  factor: (r) =>
    P.alt(P.string("(").then(r.expr).skip(P.string(")")), r.numberLiteral),

  factor1: (r) =>
    P.alt(
      P.seqMap(r.factor, P.string("d").trim(r._), r.factor, (l, op, r) => {
        return { l, op, r };
      }),
      P.seqMap(P.string("d").trim(r._), r.factor, (op, r) => {
        return { l: 1, op, r };
      }),
      r.factor
    ),

  term: (r) =>
    P.seqMap(
      r.factor1,
      P.seq(P.alt(P.string("*"), P.string("/")).trim(r._), r.factor1).many(),
      (first, rest) => rest.reduce((l, [op, r]) => ({ l, op, r }), first)
    ),

  expr: (r) =>
    P.seqMap(
      r.term,
      P.seq(P.alt(P.string("+"), P.string("-")).trim(r._), r.term).many(),
      (first, rest) => rest.reduce((l, [op, r]) => ({ l, op, r }), first)
    ),
});
