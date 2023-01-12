import { Expression } from "./dice-lang-ast";

interface DicePrintOptions {
  /**
   * @default 'pretty'
   */
  format?: "pretty" | "min" | "pedanticParens";
}

export function dicePrettyPrint(
  expr: Expression,
  options?: DicePrintOptions
): string {
  if (typeof expr === "number") {
    return expr.toString();
  }

  let left = dicePrettyPrint(expr.left, options);
  let right = dicePrettyPrint(expr.right, options);
  const operator = expr.operator;

  if (options?.format === "pedanticParens") {
    return `(${left})${operator}(${right})`;
  }

  if (expr.operator === "d") {
    if (typeof expr.left !== "number") {
      left = `(${left})`;
    } else if (expr.left === 1) {
      left = "";
    }

    if (typeof expr.right !== "number") {
      right = `(${right})`;
    }

    return `${left}${operator}${right}`;
  }

  if (expr.operator === "+" || expr.operator === "-") {
    if (
      typeof expr.right !== "number" &&
      (expr.right.operator === "+" || expr.right.operator === "-")
    ) {
      right = `(${right})`;
    }

    return options?.format === "min"
      ? `${left}${operator}${right}`
      : `${left} ${operator} ${right}`;
  }

  if (expr.operator === "*" || expr.operator === "/") {
    if (
      typeof expr.left !== "number" &&
      (expr.left.operator === "+" || expr.left.operator === "-")
    ) {
      left = `(${left})`;
    }

    if (
      typeof expr.right !== "number" &&
      (expr.right.operator === "+" ||
        expr.right.operator === "-" ||
        expr.right.operator === "/" ||
        expr.right.operator === "*")
    ) {
      right = `(${right})`;
    }

    return options?.format === "min"
      ? `${left}${operator}${right}`
      : `${left} ${operator} ${right}`;
  }

  return `(${left}) ${operator} (${right})`;
}
