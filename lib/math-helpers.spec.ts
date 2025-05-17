import { describe, expect, it } from "vitest";
import { fromThenTo } from "./math-helpers";

describe("fromThenTo", () => {
  it("then defaults to from + 1 when from <= to", () => {
    expect(fromThenTo({ from: 1, to: 4 })).toEqual([1, 2, 3, 4]);
  });

  it("then defaults to from - 1 when from > to", () => {
    expect(fromThenTo({ from: 4, to: 1 })).toEqual([4, 3, 2, 1]);
  });

  it("does not include to if the last step overshoots it", () => {
    expect(fromThenTo({ from: 0, then: 2, to: 5 })).toEqual([0, 2, 4]);
  });

  it("can step by fractions", () => {
    expect(fromThenTo({ from: 0, then: 0.5, to: 4 })).toEqual([
      0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4,
    ]);
  });

  it("returns empty if the step leads away from to", () => {
    expect(fromThenTo({ from: 0, then: -1, to: 4 })).toEqual([]);
  });

  it("returns [from] when from === to", () => {
    expect(fromThenTo({ from: 3, to: 3 })).toEqual([3]);
    expect(fromThenTo({ from: 3, then: 1, to: 3 })).toEqual([3]);
    expect(fromThenTo({ from: 3, then: -1, to: 3 })).toEqual([3]);
  });
});
