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
  neg,
  Program,
  sub,
} from "./dice-lang-ast";

// This is a work in progress.
export function diceLangSimplify(program: Program): Program {
  return program.map(simplifyExpression);
}

function simplifyExpression(expr: Expression): Expression {
  let newExpr = expr;
  let oldExpr = expr;

  do {
    [oldExpr, newExpr] = [newExpr, replacements(newExpr)];
  } while (!isEqual(newExpr, oldExpr));

  return newExpr;
}

const replacements = (expr: Expression) =>
  match<Expression, Expression>(expr)
    // highest(x, xdy) -> xdy
    //  lowest(x, xdy) -> xdy
    .with(
      P.select(
        "original",
        cx(P.union("highest", "lowest"), [
          n(P.select("x0")),
          dice(n(P.select("x1")), n(P.select("y"))),
        ])
      ),
      ({ original, x0, x1, y }) => (x0 === x1 ? dice(n(x1), n(y)) : original)
    )
    // explode(x, 0) -> x
    .with(cx("explode", [P.select("x"), n(0)]), ({ x }) => x)
    // x+(y+z) -> (x+y)+z
    .with(
      add(P.select("x"), add(P.select("y"), P.select("z"))),
      ({ x, y, z }) => add(add(x, y), z)
    )
    // x*(y*z) -> (x*y)*z
    .with(
      mul(P.select("x"), mul(P.select("y"), P.select("z"))),
      ({ x, y, z }) => mul(mul(x, y), z)
    )
    // xdz + ydz -> (x + y)dz
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
    // 0dx -> 0
    .with(dice(n(0), P.any), () => n(0))
    // xd1 -> x
    .with(dice(P.select("x"), n(1)), ({ x }) => x)
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
    // x/(y/z) -> (x*z)/y
    .with(
      div(P.select("x"), div(P.select("y"), P.select("z"))),
      ({ x, y, z }) => div(mul(x, z), y)
    )
    // (x/y)/z -> x/(y*z)
    .with(
      div(div(P.select("x"), P.select("y")), P.select("z")),
      ({ x, y, z }) => div(x, mul(y, z))
    )
    // x*(y/z) -> (x*y)/z
    .with(
      mul(P.select("x"), div(P.select("y"), P.select("z"))),
      ({ x, y, z }) => div(mul(x, y), z)
    )
    // (y/z)*x -> (y*x)/z
    .with(
      mul(div(P.select("y"), P.select("z")), P.select("x")),
      ({ x, y, z }) => div(mul(x, y), z)
    )
    // -(x) -> -x
    .with(neg(n(P.select("x"))), ({ x }) => n(-x))
    // -(-(x)) -> x
    .with(neg(neg(P.select("x"))), ({ x }) => x)
    // -(x-y) -> y-x
    .with(neg(sub(P.select("x"), P.select("y"))), ({ x, y }) => sub(y, x))
    // -(x+y) -> (-x)-y
    .with(neg(add(P.select("x"), P.select("y"))), ({ x, y }) => sub(neg(x), y))
    // x+(-y) -> x-y
    .with(add(P.select("x"), neg(P.select("y"))), ({ x, y }) => sub(x, y))
    // (-x)+y -> y-x
    .with(add(neg(P.select("x")), P.select("y")), ({ x, y }) => sub(y, x))
    // x-(-y) -> x+y
    .with(sub(P.select("x"), neg(P.select("y"))), ({ x, y }) => add(x, y))
    // -(x*y) -> (-x)*y
    .with(neg(mul(P.select("x"), P.select("y"))), ({ x, y }) => mul(neg(x), y))
    // -(x/y) -> (-x)/y
    .with(neg(div(P.select("x"), P.select("y"))), ({ x, y }) => div(neg(x), y))
    .with(bo(P.select("x"), P.select("o"), P.select("y")), ({ x, o, y }) =>
      bo(simplifyExpression(x), o, simplifyExpression(y))
    )
    .with(cx(P.select("f"), P.select("args")), ({ f, args }) =>
      cx(f, args.map(simplifyExpression))
    )
    .otherwise((x) => x);
