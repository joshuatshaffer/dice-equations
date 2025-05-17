import fc from "fast-check";
import { inspect } from "util";
import { describe, expect, it } from "vitest";
import { decimalToFraction, toME } from "./decimalToFraction";

describe.skip("decimalToFraction", () => {
  it("returns a fraction equal to the original number", () => {
    fc.assert(
      fc.property(fc.double({ min: 1, max: 20 }), fc.context(), (num, ctx) => {
        const [n, d] = decimalToFraction(num);
        ctx.log(inspect({ n, d }));

        expect(n / d).toEqual(num);
      })
    );
  });

  it("numerator is an integer", () => {
    fc.assert(
      fc.property(fc.double({ min: 0, max: 20 }), fc.context(), (num, ctx) => {
        const [n, d] = decimalToFraction(num);
        ctx.log(inspect({ n, d }));

        expect(n).toSatisfy(Number.isInteger);
      })
    );
  });

  it("denominator is an integer", () => {
    fc.assert(
      fc.property(fc.double({ min: 0, max: 20 }), fc.context(), (num, ctx) => {
        const [n, d] = decimalToFraction(num);
        ctx.log(inspect({ n, d }));

        expect(d).toSatisfy(Number.isInteger);
      })
    );
  });
});

describe.skip("toME", () => {
  it("returns a ? equal to the original number", () => {
    fc.assert(
      fc.property(fc.double({ min: 0, max: 20 }), fc.context(), (num, ctx) => {
        const { m, e } = toME(num);
        ctx.log(inspect({ m, e }));

        expect(m * Math.pow(10, e)).toEqual(num);
      })
    );
  });
});
