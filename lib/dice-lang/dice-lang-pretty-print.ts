import { DiceExpression } from "./dice-lang-ast";

interface DicePrintOptions {
  /**
   * @default 'pretty'
   */
  format?: "pretty" | "min" | "pedanticParens";
}

export function dicePrettyPrint(
  expr: DiceExpression,
  options?: DicePrintOptions
): string {
  if (typeof expr === "number") {
    return expr.toString();
  }

  let l = dicePrettyPrint(expr.l, options);
  let r = dicePrettyPrint(expr.r, options);
  const op = expr.op;

  if (options?.format === "pedanticParens") {
    return `(${l})${op}(${r})`;
  }

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

  if (expr.op === "+" || expr.op === "-") {
    if (
      typeof expr.r !== "number" &&
      (expr.r.op === "+" || expr.r.op === "-")
    ) {
      r = `(${r})`;
    }

    return options?.format === "min" ? `${l}${op}${r}` : `${l} ${op} ${r}`;
  }

  if (expr.op === "*" || expr.op === "/") {
    if (
      typeof expr.l !== "number" &&
      (expr.l.op === "+" || expr.l.op === "-")
    ) {
      l = `(${l})`;
    }

    if (
      typeof expr.r !== "number" &&
      (expr.r.op === "+" ||
        expr.r.op === "-" ||
        expr.r.op === "/" ||
        expr.r.op === "*")
    ) {
      r = `(${r})`;
    }

    return options?.format === "min" ? `${l}${op}${r}` : `${l} ${op} ${r}`;
  }

  return `(${l}) ${op} (${r})`;
}
