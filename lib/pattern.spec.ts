/// <reference types="jest-extended" />
import { Expression } from "./dice-lang/dice-lang-ast";
import { b, InferBindings, n, op } from "./pattern";

describe.skip("pattern", () => {
  it("works", () => {
    const p = op(b("l"), "d", n(1));
    const e: Expression = { left: 45, operator: "d", right: 1 };

    expect(p.match(e)).toEqual<InferBindings<typeof p>>({ l: 45 });
  });
});
