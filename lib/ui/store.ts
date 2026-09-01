type Listener = () => void;

export type ExternalStore<T> = {
  subscribe(listener: Listener): () => void;
  get(): T;
  getServer(): T;
};

export type BooleanStore = ExternalStore<boolean> & {
  set(next: boolean): void;
};

export type CounterStore = ExternalStore<number> & {
  increment(): void;
};

function createStore<T>(initial: T, serverValue: T) {
  let value = initial;
  const listeners = new Set<Listener>();

  return {
    read: () => value,
    write(next: T) {
      if (Object.is(value, next)) return;
      value = next;
      for (const listener of listeners) listener();
    },
    store: {
      subscribe(listener: Listener) {
        listeners.add(listener);
        return () => {
          listeners.delete(listener);
        };
      },
      get: () => value,
      getServer: () => serverValue,
    } satisfies ExternalStore<T>,
  };
}

export function createBooleanStore(initial = false, serverValue = false): BooleanStore {
  const { write, store } = createStore(initial, serverValue);
  return { ...store, set: write };
}

export function createCounterStore(): CounterStore {
  const { read, write, store } = createStore(0, 0);
  return { ...store, increment: () => write(read() + 1) };
}
