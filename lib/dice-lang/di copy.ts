const store = {
  get: <T = unknown>(key: string): Promise<T | undefined> =>
    Promise.resolve(undefined),
  set: (key: string, value: unknown): Promise<void> => Promise.resolve(),
};

interface CacheOptions<A extends unknown[]> {
  key: (...args: A) => string;
}

const cache =
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
  };

const fork = cache({ key: (id) => `fork:${id}` }, (id: number) => {});

export const bar = 5;

const g = () => {
  return bar + 5;
};
