import { match, P } from "ts-pattern";
import { Expression, n, Program } from "./dice-lang-ast";

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

  return program
    .map((expr) => prettyPrintExpression(expr, options))
    .join(options?.format === "min" ? ";" : ";\n");
}

function prettyPrintExpression(
  expr: Expression,
  options: DicePrintOptions
): string {
  const p = (x: string) =>
    options?.format === "MathML" ? `<mo>(</mo>${x}<mo>)</mo>` : `(${x})`;

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

  if (expr.type !== "BinaryOperation") {
    throw new Error("TODO: support " + expr.type);
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

  return options?.format === "MathML"
    ? expr.operator === "**"
      ? `<msup><mrow>${left}</mrow><mrow>${right}</mrow></msup>`
      : expr.operator === "d"
      ? `${left}<ms>d</ms>${right}`
      : `${left}<mo>${
          expr.operator === "*" ? "&sdot;" : expr.operator
        }</mo>${right}`
    : options?.format === "min" || expr.operator === "d"
    ? `${left}${expr.operator}${right}`
    : `${left} ${expr.operator} ${right}`;
}

export const dicePrettyPrint2 = (expr: Expression): string =>
  match<Expression, string>(expr)
    .with(n(P.select("x")), ({ x }) => x.toString())
    .otherwise(() => "TODO");

export function diceLangPrintPedanticParens(expr: Expression): string {
  if (expr.type === "NumberLiteral") {
    return expr.value.toString();
  }

  if (expr.type === "UnaryOperation") {
    const x = diceLangPrintPedanticParens(expr.operand);
    if (expr.operator === "!") {
      return `(${x})${expr.operator}`;
    } else {
      return `${expr.operator}(${x})`;
    }
  }

  if (expr.type === "BinaryOperation") {
    const l = diceLangPrintPedanticParens(expr.left);
    const r = diceLangPrintPedanticParens(expr.right);
    return `(${l})${expr.operator}(${r})`;
  }

  if (expr.type === "CallExpression") {
    return `(${expr.callee})(${expr.args
      .map((a) => diceLangPrintPedanticParens(a))
      .map((a) => `(${a})`)
      .join(", ")})`;
  }

  throw new TypeError("Invalid node type");
}
