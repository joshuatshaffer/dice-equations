import { Expression } from "./dice-lang-ast";

interface DicePrintOptions {
  /**
   * @default 'pretty'
   */
  format: "MathML";
}
export function dicePrettyPrint(
  expr: Expression,
  options: DicePrintOptions
): string {
  const d = _dicePrettyPrint(expr, options);

  if (options?.format === "MathML") {
    return `<math><mrow>${d}</mrow></math>`;
  }

  return d;
}

function _dicePrettyPrint(expr: Expression, options: DicePrintOptions): string {
  const p = (x: string) => `<mo>(</mo>${x}<mo>)</mo>`;

  if (typeof expr === "number") {
    return `<mn>${expr}</mn>`;
  }

  let left = _dicePrettyPrint(expr.left, options);
  let right = _dicePrettyPrint(expr.right, options);
  const operator = expr.operator;

  if (expr.operator === "d") {
    if (typeof expr.left !== "number") {
      left = p(left);
    } else if (expr.left === 1) {
      left = "";
    }

    if (typeof expr.right !== "number") {
      right = p(right);
    }

    return `${left}<mo>${operator}</mo>${right}`;
  }

  if (expr.operator === "+" || expr.operator === "-") {
    if (
      typeof expr.right !== "number" &&
      (expr.right.operator === "+" || expr.right.operator === "-")
    ) {
      right = p(right);
    }

    return `${left}<mo>${operator}</mo>${right}`;
  }

  if (expr.operator === "/") {
    return `<mfrac><mrow>${left}</mrow><mrow>${right}</mrow></mfrac>`;
  }

  if (expr.operator === "*") {
    if (
      typeof expr.left !== "number" &&
      (expr.left.operator === "+" || expr.left.operator === "-")
    ) {
      left = p(left);
    }

    if (
      typeof expr.right !== "number" &&
      (expr.right.operator === "+" ||
        expr.right.operator === "-" ||
        expr.right.operator === "/" ||
        expr.right.operator === "*")
    ) {
      right = p(right);
    }

    return `${left}<mo>${operator}</mo>${right}`;
  }

  return `${p(left)} ${operator} ${p(right)}`;
}
