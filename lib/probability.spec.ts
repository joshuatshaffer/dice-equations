import { dice, irwinHallDistribution, newDice, Prob } from "./probability";

describe("dice", () => {
  it("ih", () => {
    const samples = 16;
    const d = irwinHallDistribution(1);

    console.log([...Array(samples)].map((_x, i) => d.pdf((i / samples) * 2)));
  });

  const testDice = (numberOfDice: number, sides: number) => {
    it(`Simplifies ${numberOfDice}d${sides}`, () => {
      const newResult = new Map(newDice(numberOfDice, sides));
      const oldResult = new Map(
        dice(Prob.unit(numberOfDice), Prob.unit(sides))
      );

      console.log(
        [...oldResult.keys()]
          .sort()
          .map((k) => [
            k,
            (newResult.get(k) ?? NaN) - (oldResult.get(k) ?? NaN),
          ])
      );

      expect(newResult).toEqual(oldResult);
    });
  };

  for (const n of [1, 2, 3]) {
    for (const s of [1, 2, 3, 4, 5, 6]) {
      testDice(n, s);
    }
  }
});
