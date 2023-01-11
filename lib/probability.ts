import { DiceExpression } from "./parseDice";

export function prob(diceExpr: DiceExpression): Map<number, number> {
  if (typeof diceExpr === "number") {
    return new Map([[diceExpr, 1]]);
  }

  const l = prob(diceExpr.l);
  const r = prob(diceExpr.r);
  const op = diceExpr.op;

  if (op === "d") {
    return Object.fromEntries([...Array()]);
  }

  if (op === "+") {
    return Object.fromEntries(
      Object.entries(l).flatMap(([lv, lp]) =>
        Object.entries(r).map(([rv, rp]) => [Number(lv) + Number(rv), lp + rp])
      )
    );
  }

  return {};
}
