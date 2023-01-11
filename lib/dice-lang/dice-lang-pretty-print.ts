import { DiceExpression } from "./dice-lang-ast";

export function dicePrettyPrint(expr: DiceExpression): string {
  if (typeof expr === "number") {
    return expr.toString();
  }

  let l = dicePrettyPrint(expr.l);
  let r = dicePrettyPrint(expr.r);
  const op = expr.op;

  if (expr.op === "d") {
    if (typeof expr.l !== "number") {
      l = `(${l})`;
    } else if (expr.l === 1) {
      l = "";
    }

    if (typeof expr.r !== "number") {
      r = `(${r})`;
    }

    return `${l}${op}${r}`;
  }

  if (expr.op === "+") {
    return `${l} ${op} ${r}`;
  }

  if (expr.op === "-") {
    if (
      typeof expr.r !== "number" &&
      (expr.r.op === "+" || expr.r.op === "-")
    ) {
      r = `(${r})`;
    }

    return `${l} ${op} ${r}`;
  }

  if (expr.op === "*") {
    if (
      typeof expr.l !== "number" &&
      (expr.l.op === "+" || expr.l.op === "-")
    ) {
      l = `(${l})`;
    }

    if (
      typeof expr.r !== "number" &&
      (expr.r.op === "+" || expr.r.op === "-" || expr.r.op === "/")
    ) {
      r = `(${r})`;
    }

    return `${l} ${op} ${r}`;
  }

  return `${l} ${op} ${r}`;
}
