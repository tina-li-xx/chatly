import type {
  ChattingKeyValueStorage,
  ChattingSessionState,
  ChattingSessionStore
} from "./chatting-types";

export function createMemorySessionStore(): ChattingSessionStore {
  let state: ChattingSessionState | null = null;

  return {
    async load() {
      return state;
    },
    async save(nextState) {
      state = nextState;
    },
    async clear() {
      state = null;
    }
  };
}

export function createKeyValueSessionStore(
  storage: ChattingKeyValueStorage,
  namespace: string
): ChattingSessionStore {
  const key = `chatting:${namespace}:session`;

  return {
    async load() {
      const value = await storage.getItem(key);
      return value ? (JSON.parse(value) as ChattingSessionState) : null;
    },
    async save(state) {
      await storage.setItem(key, JSON.stringify(state));
    },
    async clear() {
      if (typeof storage.removeItem === "function") {
        await storage.removeItem(key);
      } else {
        await storage.setItem(key, "");
      }
    }
  };
}
