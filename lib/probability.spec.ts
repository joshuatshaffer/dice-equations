import {
  dice,
  irwinHallDistribution,
  newDice,
  possibleDice,
  possibleDice2,
  Prob,
  ProbBuilder,
} from "./probability";

describe("posibleDice", () => {
  it("works", () => {
    const n = 3;
    const s = 3;
    const fromOld = (() => {
      const b = new ProbBuilder<string>();

      for (const [dice, p] of possibleDice(n, s)) {
        b.add(dice.sort((a, b) => b - a).join(","), p);
      }

      return new Map(b.build());
    })();

    const fromNew = (() => {
      const b = new ProbBuilder<string>();

      for (const [dice, p] of possibleDice2(n, s)) {
        b.add(dice.join(","), p);
      }

      return new Map(b.build());
    })();

    expect(fromNew).toEqual(fromOld);
  });
});

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
