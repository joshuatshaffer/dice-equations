type RandomVar = {
  pmf: () => Record<number, number>;
  gen: () => number;
};

function foo(
  a: Record<number, number>,
  b: Record<number, number>,
  f: (x: number, y: number) => number
): Record<number, number> {
  const c: Record<number, number> = {};

  for (const [av, am] of Object.entries(a)) {
    for (const [bv, bm] of Object.entries(b)) {
      const cv = f(Number(av), Number(bv));
      const cm = am + bm;

      if (c[cv] === undefined) {
        c[cv] = cm;
      } else {
        c[cv] += cm;
      }
    }
  }

  return c;
}

function die(sides: number): RandomVar {
  function* events() {
    for (let i = 1; i <= sides; ++i) {
      yield i;
    }
  }

  return {
    pmf: () => {
      const c: Record<number, number> = {};

      for (let i = 1; i <= sides; ++i) {
        c[i] = 1;
      }

      return c;
    },
    gen: () => Math.floor(Math.random() * Math.floor(sides))
  };
}

function dice(num: number, sides: number): RandomVar {}

function add(a: RandomVar, b: RandomVar): RandomVar {
  return { pmf: () => foo(a.pmf(), b.pmf(), (x, y) => x + y) };
}
