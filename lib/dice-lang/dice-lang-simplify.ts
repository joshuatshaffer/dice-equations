import isEqual from "lodash/isEqual";
import { match, P } from "ts-pattern";
import { reduceFraction } from "../math-helpers";
import {
  add,
  bo,
  cx,
  dice,
  div,
  Expression,
  mul,
  n,
  uo,
} from "./dice-lang-ast";

// This is a work in progress.
export function diceLangSimplify(expr: Expression): Expression {
  let newExpr = expr;
  let oldExpr = expr;

  do {
    [oldExpr, newExpr] = [newExpr, replacements(newExpr)];
  } while (!isEqual(newExpr, oldExpr));

  return newExpr;
}

const replacements = (expr: Expression) =>
  match<Expression, Expression>(expr)
    .with(
      add(P.select("x"), add(P.select("y"), P.select("z"))),
      ({ x, y, z }) => add(add(x, y), z)
    )
    .with(
      mul(P.select("x"), mul(P.select("y"), P.select("z"))),
      ({ x, y, z }) => mul(mul(x, y), z)
    )
    .with(
      P.select(
        "original",
        add(
          dice(P.select("x0"), n(P.select("y0"))),
          dice(P.select("x1"), n(P.select("y1")))
        )
      ),
      ({ original, x0, y0, x1, y1 }) =>
        y0 === y1 ? dice(add(x0, x1), n(y0)) : original
    )
    .with(dice(n(0), P.any), () => n(0))
    .with(
      P.select(
        "original",
        bo(n(P.select("x")), P.select("o"), n(P.select("y")))
      ),
      ({ original, x, o, y }) => {
        switch (o) {
          case "+":
            return n(x + y);
          case "-":
            return n(x - y);
          case "*":
            return n(x * y);
          case "/": {
            if (Number.isInteger(x) && Number.isInteger(y)) {
              const [x1, y1] = reduceFraction(x, y);
              return y1 === 1 ? n(x1) : div(n(x1), n(y1));
            }
            return n(x / y);
          }
          case "%":
            return n(x % y);
          case "**":
            return n(x ** y);
          default:
            return original;
        }
      }
    )
    .with(uo(P.select("o"), P.select("x")), ({ o, x }) =>
      uo(o, diceLangSimplify(x))
    )
    .with(bo(P.select("x"), P.select("o"), P.select("y")), ({ x, o, y }) =>
      bo(diceLangSimplify(x), o, diceLangSimplify(y))
    )
    .with(cx(P.select("f"), P.select("args")), ({ f, args }) =>
      cx(f, args.map(diceLangSimplify))
    )
    .otherwise((x) => x);
