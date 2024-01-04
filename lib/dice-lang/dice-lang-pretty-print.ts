import { Expression, Program } from "./dice-lang-ast";

interface DicePrintOptions {
  /**
   * @default 'pretty'
   */
  format?: "pretty" | "min" | "pedanticParens" | "MathML";
}

export function dicePrettyPrint(
  program: Program,
  options: DicePrintOptions = {}
): string {
  if (options?.format === "MathML") {
    return `<math><mtable>${program
      .map(
        (expr) =>
          `<mtr><mtd><mrow>${prettyPrintExpression(
            expr,
            options
          )}</mrow></mtd></mtr>`
      )
      .join("")}</mtable></math>`;
  }

  return (
    program
      .map((expr) => prettyPrintExpression(expr, options))
      .join(options?.format === "min" ? ";" : ";\n") +
    (options?.format === "min" || program.length < 2 ? "" : ";")
  );
}

function prettyPrintExpression(
  expr: Expression,
  options: DicePrintOptions
): string {
  const p = (x: string) =>
    options?.format === "MathML"
      ? `<mrow><mo>(</mo>${x}<mo>)</mo></mrow>`
      : `(${x})`;

  if (expr.type === "NumberLiteral") {
    return options?.format === "MathML"
      ? `<mn>${expr.value}</mn>`
      : expr.value.toString();
  }

  if (expr.type === "CallExpression") {
    const args =
      options?.format === "MathML"
        ? expr.args
            .map((a) => prettyPrintExpression(a, options))
            .join("<mo>,</mo>")
        : expr.args
            .map((a) => prettyPrintExpression(a, options))
            .join(options?.format === "min" ? "," : ", ");

    return options?.format === "MathML"
      ? expr.callee === "floor"
        ? `<mrow><mo>&lfloor;</mo>${args}<mo>&rfloor;</mo></mrow>`
        : expr.callee === "ceil"
        ? `<mrow><mo>&lceil;</mo>${args}<mo>&rceil;</mo></mrow>`
        : `<mi>${expr.callee}</mi><mrow><mo>(</mo>${args}<mo>)</mo></mrow>`
      : `${expr.callee}(${args})`;
  }

  if (expr.type === "UnaryOperation") {
    let operand = prettyPrintExpression(expr.operand, options);

    if (
      options?.format === "pedanticParens" ||
      expr.operand.type !== "CallExpression"
    ) {
      operand = p(operand);
    }

    if (options?.format === "MathML") {
      return `<mrow><mo>${expr.operator}</mo>${operand}</mrow>`;
    }

    return `${expr.operator}${operand}`;
  }

  let left = prettyPrintExpression(expr.left, options);
  let right = prettyPrintExpression(expr.right, options);

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
  } else if (
    expr.operator === "*" ||
    expr.operator === "/" ||
    expr.operator === "%"
  ) {
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
        expr.right.operator === "*" ||
        expr.right.operator === "/" ||
        expr.right.operator === "%")
    ) {
      right = p(right);
    }
  } else if (expr.operator === "**") {
    if (
      expr.left.type === "BinaryOperation" &&
      (expr.left.operator === "+" ||
        expr.left.operator === "-" ||
        expr.left.operator === "*" ||
        expr.left.operator === "/" ||
        expr.left.operator === "%" ||
        expr.left.operator === "**")
    ) {
      left = p(left);
    }

    if (
      options?.format !== "MathML" &&
      expr.right.type === "BinaryOperation" &&
      (expr.right.operator === "+" ||
        expr.right.operator === "-" ||
        expr.right.operator === "*" ||
        expr.right.operator === "/" ||
        expr.right.operator === "%")
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

  if (options?.format === "MathML") {
    if (expr.operator === "**") {
      return `<msup><mrow>${left}</mrow><mrow>${right}</mrow></msup>`;
    } else if (expr.operator === "d") {
      return `${left}<ms>d</ms>${right}`;
    } else {
      return `${left}<mo>${
        expr.operator === "*" ? "&sdot;" : expr.operator
      }</mo>${right}`;
    }
  } else if (options?.format === "min" || expr.operator === "d") {
    return `${left}${expr.operator}${right}`;
  } else {
    return `${left} ${expr.operator} ${right}`;
  }
}
