// Minimal in-memory localStorage for unit tests (Node has no usable one).
const values = new Map<string, string>();

const localStorageMock = {
  getItem: (key: string) => values.get(key) ?? null,
  setItem: (key: string, value: string) => void values.set(key, String(value)),
  removeItem: (key: string) => void values.delete(key),
  clear: () => values.clear(),
};

Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  configurable: true,
});

export const resetStorage = (content: Record<string, unknown> = {}) => {
  values.clear();
  for (const [key, value] of Object.entries(content)) {
    values.set(key, typeof value === "string" ? value : JSON.stringify(value));
  }
};

export const readStorage = (key: string) => {
  const value = values.get(key);

  return value === undefined ? undefined : JSON.parse(value);
};
