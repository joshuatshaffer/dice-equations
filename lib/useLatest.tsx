import { useRef } from "react";

export function useLatest<T>(x: T, initialValue = x): T {
  const latestRef = useRef(initialValue);

  if (x !== undefined) {
    latestRef.current = x;
  }

  return latestRef.current;
}
