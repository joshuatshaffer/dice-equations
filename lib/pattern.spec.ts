/// <reference types="jest-extended" />
import { Expression } from "./dice-lang/dice-lang-ast";
import { b, n, op } from "./pattern";

describe("pattern", () => {
  it("works", () => {
    const p = op(b("l"), "d", n(1));
    const e: Expression = { left: 45, operator: "d", right: 1 };

    expect(p.match(e)).toEqual({ l: 45 });
  });
});
