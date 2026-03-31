import { vi } from "vitest";

type StateRecord<T> = {
  get current(): T;
  set: (value: T | ((previous: T) => T)) => void;
};

type MockReactHooksOptions = {
  stateOverrides?: Map<number, unknown>;
  transitionPending?: boolean;
};

export function createMockReactHooks(options: MockReactHooksOptions = {}) {
  const effects: Array<() => void | (() => void)> = [];
  const states: StateRecord<unknown>[] = [];
  const refs: Array<{ current: unknown }> = [];
  let stateIndex = 0;
  let refIndex = 0;

  return {
    beginRender() {
      stateIndex = 0;
      refIndex = 0;
      effects.length = 0;
    },
    effects,
    refs,
    states,
    async moduleFactory() {
      const actual = await vi.importActual<typeof import("react")>("react");

      return {
        ...actual,
        startTransition: (callback: () => void) => callback(),
        useMemo: vi.fn((factory: () => unknown) => factory()),
        useEffect: vi.fn((callback: () => void | (() => void)) => {
          effects.push(callback);
        }),
        useRef: vi.fn((initialValue: unknown) => {
          const ref = refs[refIndex] ?? { current: initialValue };
          refs[refIndex] = ref;
          refIndex += 1;
          return ref;
        }),
        useState: vi.fn((initialValue: unknown) => {
          const currentIndex = stateIndex++;
          const existing = states[currentIndex];
          if (existing) {
            return [existing.current, existing.set];
          }

          let current =
            options.stateOverrides?.has(currentIndex)
              ? options.stateOverrides.get(currentIndex)
              : typeof initialValue === "function"
                ? (initialValue as () => unknown)()
                : initialValue;

          const record: StateRecord<unknown> = {
            get current() {
              return current;
            },
            set(value) {
              current =
                typeof value === "function"
                  ? (value as (previous: unknown) => unknown)(current)
                  : value;
            }
          };

          states[currentIndex] = record;
          return [current, record.set];
        }),
        useTransition: vi.fn(() => [
          Boolean(options.transitionPending),
          (callback: () => void) => callback()
        ])
      };
    }
  };
}

export async function runMockEffects(
  effects: Array<() => void | (() => void)>
) {
  const cleanups = effects
    .map((callback) => callback())
    .filter((value): value is () => void => typeof value === "function");

  await Promise.resolve();
  await Promise.resolve();
  return cleanups;
}
