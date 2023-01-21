import { Expression } from "./dice-lang-ast";

interface DicePrintOptions {
  /**
   * @default 'pretty'
   */
  format?: "pretty" | "min" | "pedanticParens" | "MathML";
}

export function dicePrettyPrint(
  expr: Expression,
  options?: DicePrintOptions
): string {
  const d = _dicePrettyPrint(expr, options);

  if (options?.format === "MathML") {
    return `<math><mrow>${d}</mrow></math>`;
  }

  return d;
}

function _dicePrettyPrint(
  expr: Expression,
  options?: DicePrintOptions
): string {
  const p = (x: string) =>
    options?.format === "MathML" ? `<mo>(</mo>${x}<mo>)</mo>` : `(${x})`;

  if (expr.type === "NumberLiteral") {
    return options?.format === "MathML"
      ? `<mn>${expr.value}</mn>`
      : expr.value.toString();
  }

  if (expr.type !== "BinaryOperation") {
    throw new Error("TODO: support " + expr.type);
  }

  let left = _dicePrettyPrint(expr.left, options);
  let right = _dicePrettyPrint(expr.right, options);

  if (options?.format === "pedanticParens") {
    return `${p(left)}${expr.operator}${p(right)}`;
  }

  if (options?.format === "MathML" && expr.operator === "/") {
    return `<mfrac><mrow>${left}</mrow><mrow>${right}</mrow></mfrac>`;
  }

  if (expr.operator === "+" || expr.operator === "-") {
    if (
      expr.right.type === "BinaryOperation" &&
      (expr.right.operator === "+" || expr.right.operator === "-")
    ) {
      right = p(right);
    }
  } else if (expr.operator === "*" || expr.operator === "/") {
    if (
      expr.left.type === "BinaryOperation" &&
      (expr.left.operator === "+" || expr.left.operator === "-")
    ) {
      left = p(left);
    }

    if (
      expr.right.type === "BinaryOperation" &&
      (expr.right.operator === "+" ||
        expr.right.operator === "-" ||
        expr.right.operator === "/" ||
        expr.right.operator === "*")
    ) {
      right = p(right);
    }
  } else if (expr.operator === "d") {
    if (expr.left.type !== "NumberLiteral") {
      left = p(left);
    } else if (expr.left.value === 1) {
      left = "";
    }

    if (expr.right.type !== "NumberLiteral") {
      right = p(right);
    }
  } else {
    left = p(left);
    right = p(right);
  }

  return options?.format === "MathML"
    ? expr.operator === "d"
      ? `${left}<ms>d</ms>${right}`
      : `${left}<mo>${
          expr.operator === "*" ? "&sdot;" : expr.operator
        }</mo>${right}`
    : options?.format === "min" || expr.operator === "d"
    ? `${left}${expr.operator}${right}`
    : `${left} ${expr.operator} ${right}`;
}
