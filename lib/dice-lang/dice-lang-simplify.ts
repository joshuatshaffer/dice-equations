import { DiceExpression } from "./dice-lang-ast";

// This is a work in progress.
export function diceLangSimplify(expr: DiceExpression): DiceExpression {
  if (typeof expr === "number") {
    return expr;
  }

  expr = {
    ...expr,
    l: diceLangSimplify(expr.l),
    r: diceLangSimplify(expr.r),
  };

  if (typeof expr.l === "number" && typeof expr.r === "number") {
    switch (expr.op) {
      case "+":
        return expr.l + expr.r;
      case "-":
        return expr.l - expr.r;
      case "*":
        return expr.l * expr.r;
      case "/":
        // TODO: Don't do this if the fraction is cleaner.
        return expr.l / expr.r;
    }
  }

  if (expr.op === "+") {
    if (
      typeof expr.l !== "number" &&
      expr.l.op === "d" &&
      typeof expr.r !== "number" &&
      expr.r.op === "d" &&
      typeof expr.l.r === "number" &&
      typeof expr.r.r === "number" &&
      expr.l.r === expr.r.r
    ) {
      return {
        l: diceLangSimplify({ l: expr.l.l, op: "+", r: expr.r.l }),
        op: "d",
        r: expr.r.r,
      };
    }
  }

  return expr;
}
