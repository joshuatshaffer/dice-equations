export type Dependable<T = unknown> = (
  resolutions?: Map<Dependable, unknown>
) => T;

type Foo = <T>(dep: Dependable<T>, r: T) => Foo;

const dk: Foo = null as any;

export type Dependencies = Record<string, Dependable>;

export type ResolvedDependencies<D extends Dependencies> = {
  [P in keyof D]: D[P] extends Dependable<infer V> ? V : never;
};

export function di<D extends Dependencies, T>(
  dependencies: D,
  factory: (deps: ResolvedDependencies<D>) => T
): Dependable<T> {
  return (resolutions = new Map()) => {
    const resolvedDependencies = {} as Record<string, unknown>;

    for (const [k, dep] of Object.entries(dependencies)) {
      if (resolutions.has(dep)) {
        resolvedDependencies[k] = resolutions.get(dep);
      } else {
        const d = dep(resolutions);
        resolutions.set(dep, d);
        resolvedDependencies[k] = d;
      }
    }

    return factory(resolvedDependencies as ResolvedDependencies<D>);
  };
}

const store = di({}, () => ({
  get: <T = unknown>(key: string): Promise<T | undefined> =>
    Promise.resolve(undefined),
  set: (key: string, value: unknown): Promise<void> => Promise.resolve(),
}));

interface CacheOptions<A extends unknown[]> {
  key: (...args: A) => string;
}

const cache = di(
  { store },
  ({ store }) =>
    <A extends unknown[], R>(opts: CacheOptions<A>, fn: (...args: A) => R) =>
    async (...args: A): Promise<Awaited<R>> => {
      const key = opts.key(...args);
      const cachedValue = await store.get<R>(key);
      if (cachedValue !== undefined) {
        return cachedValue;
      }
      const computedValue = await fn(...args);
      store.set(key, computedValue);
      return computedValue;
    }
);

const fork = di({ cache }, ({ cache }) =>
  cache({ key: (id) => `fork:${id}` }, (id: number) => {})
);

const bar = di({}, () => 5);

const g = di({ bar }, ({ bar }) => () => {
  return bar + 5;
});
