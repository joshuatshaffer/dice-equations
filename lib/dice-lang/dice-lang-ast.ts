export type DiceExpression =
  | {
      op: "+" | "-" | "*" | "/" | "d";
      l: DiceExpression;
      r: DiceExpression;
    }
  | number;
