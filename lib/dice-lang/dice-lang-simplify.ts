import { reduceFraction } from "../math-helpers";
import { b, op } from "../pattern";
import { Expression } from "./dice-lang-ast";

// This is a work in progress.
export function diceLangSimplify(expr: Expression): Expression {
  if (typeof expr === "number") {
    return expr;
  }

  expr = {
    ...expr,
    left: diceLangSimplify(expr.left),
    right: diceLangSimplify(expr.right),
  };

  if (expr.operator === "d" && expr.right === 1) {
    return expr.left;
  }

  if (typeof expr.left === "number" && typeof expr.right === "number") {
    switch (expr.operator) {
      case "+":
        return expr.left + expr.right;
      case "-":
        return expr.left - expr.right;
      case "*":
        return expr.left * expr.right;
      case "/":
        if (!Number.isInteger(expr.left) || !Number.isInteger(expr.right)) {
          return expr.left / expr.right;
        }
        const [n, d] = reduceFraction(expr.left, expr.right);
        if (d === 1) {
          return n;
        }
        return { left: n, operator: "/", right: d };
    }
  }

  if (expr.operator === "+") {
    if (typeof expr.right !== "number" && expr.right.operator === "+") {
      return {
        left: { left: expr.left, operator: "+", right: expr.right.left },
        operator: "+",
        right: expr.right.right,
      };
    }

    if (
      typeof expr.left !== "number" &&
      expr.left.operator === "d" &&
      typeof expr.right !== "number" &&
      expr.right.operator === "d" &&
      typeof expr.left.right === "number" &&
      typeof expr.right.right === "number" &&
      expr.left.right === expr.right.right
    ) {
      return {
        left: diceLangSimplify({
          left: expr.left.left,
          operator: "+",
          right: expr.right.left,
        }),
        operator: "d",
        right: expr.right.right,
      };
    }
  }

  // x*(y*z) -> x*y*z
  const rule = {
    pattern: op(b("x"), "*", op(b("y"), "*", b("z"))),
    replace: ({ x, y, z }) => [[x, "*", y], "*", z],
    replace2: ({ x, y, z }) => op(op(x, "*", y), "*", z),
  };

  if (expr.operator === "*") {
    if (typeof expr.right !== "number" && expr.right.operator === "*") {
      return {
        left: { left: expr.left, operator: "*", right: expr.right.left },
        operator: "*",
        right: expr.right.right,
      };
    }
  }

  return expr;
}
