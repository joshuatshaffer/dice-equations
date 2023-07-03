export type ParseProgram<T> = T extends `${infer S};${infer R}`
  ? [ParseExpression<S>, ...ParseProgram<R>]
  : [ParseExpression<T>];

type ParseExpression<T> = T extends `${infer L} + ${infer R}`
  ? { operation: "+"; left: ParseExpression<L>; right: ParseExpression<R> }
  : T extends `${infer X extends number}`
  ? { value: X }
  : { failed: T };

const x: ParseProgram<"2 + y + z;bar"> = null as any;

function cache<T extends (...args: unknown[]) => unknown>(
  options: { key: (...args: Parameters<T>) => string },
  fn: T
) {}
