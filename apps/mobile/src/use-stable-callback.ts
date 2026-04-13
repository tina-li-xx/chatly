import { useEffect, useRef } from "react";

export function useStableCallback<T extends (...args: never[]) => unknown>(callback: T): T {
  const callbackRef = useRef(callback);
  const stableCallbackRef = useRef<T>(((...args: Parameters<T>) => callbackRef.current(...args)) as T);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return stableCallbackRef.current;
}
