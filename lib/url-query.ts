import { useRouter } from "next/router";
import { ParsedUrlQueryInput } from "node:querystring";

type Query = ParsedUrlQueryInput;

export interface QThing<T> {
  parse: (query: Query) => T;
  stringify: (value: T) => Query;
}

export interface SetUrlQueryReturn {
  href: string;
}

export interface UseUrlQueryReturn<T> {
  value: T;
  setValue: (action: T | ((value: T) => T)) => SetUrlQueryReturn;
}

export function useUrlQuery<T>(
  q: QThing<T>
): [T, (action: T | ((value: T) => T)) => (query: Query) => Query] {
  const router = useRouter();

  return [
    q.parse(router.query),

    (action) => {
      const foo = (query: Query): Query => {
        const newValue =
          typeof action === "function"
            ? (action as (value: T) => T)(q.parse(query))
            : action;
        return {
          ...query,
          ...q.stringify(newValue),
        };
      };

      return foo;
    },
  ];
}
