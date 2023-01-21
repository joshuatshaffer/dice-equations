import { reduceFraction } from "../math-helpers";
import { Expression } from "./dice-lang-ast";

// This is a work in progress.
export function diceLangSimplify(expr: Expression): Expression {
  if (expr.type === "NumberLiteral") {
    return expr;
  }

  if (expr.type !== "BinaryOperation") {
    throw new Error("TODO: support " + expr.type);
  }

  expr = {
    ...expr,
    left: diceLangSimplify(expr.left),
    right: diceLangSimplify(expr.right),
  };

  if (
    expr.operator === "d" &&
    expr.right.type === "NumberLiteral" &&
    expr.right.value === 1
  ) {
    return expr.left;
  }

  if (
    expr.left.type === "NumberLiteral" &&
    expr.right.type === "NumberLiteral"
  ) {
    switch (expr.operator) {
      case "+":
        return {
          type: "NumberLiteral",
          value: expr.left.value + expr.right.value,
        };
      case "-":
        return {
          type: "NumberLiteral",
          value: expr.left.value - expr.right.value,
        };
      case "*":
        return {
          type: "NumberLiteral",
          value: expr.left.value * expr.right.value,
        };
      case "/":
        if (
          !Number.isInteger(expr.left.value) ||
          !Number.isInteger(expr.right.value)
        ) {
          return {
            type: "NumberLiteral",
            value: expr.left.value / expr.right.value,
          };
        }
        const [n, d] = reduceFraction(expr.left.value, expr.right.value);
        if (d === 1) {
          return { type: "NumberLiteral", value: n };
        }
        return {
          type: "BinaryOperation",
          left: { type: "NumberLiteral", value: n },
          operator: "/",
          right: { type: "NumberLiteral", value: d },
        };
    }
  }

  if (expr.operator === "+") {
    if (expr.right.type === "BinaryOperation" && expr.right.operator === "+") {
      return {
        type: "BinaryOperation",
        left: {
          type: "BinaryOperation",
          left: expr.left,
          operator: "+",
          right: expr.right.left,
        },
        operator: "+",
        right: expr.right.right,
      };
    }

    if (
      expr.left.type === "BinaryOperation" &&
      expr.left.operator === "d" &&
      expr.right.type === "BinaryOperation" &&
      expr.right.operator === "d" &&
      expr.left.right.type === "NumberLiteral" &&
      expr.right.right.type === "NumberLiteral" &&
      expr.left.right === expr.right.right
    ) {
      return {
        type: "BinaryOperation",
        left: diceLangSimplify({
          type: "BinaryOperation",
          left: expr.left.left,
          operator: "+",
          right: expr.right.left,
        }),
        operator: "d",
        right: expr.right.right,
      };
    }
  }

  if (expr.operator === "*") {
    if (expr.right.type === "BinaryOperation" && expr.right.operator === "*") {
      return {
        type: "BinaryOperation",
        left: {
          type: "BinaryOperation",
          left: expr.left,
          operator: "*",
          right: expr.right.left,
        },
        operator: "*",
        right: expr.right.right,
      };
    }
  }

  return expr;
}
