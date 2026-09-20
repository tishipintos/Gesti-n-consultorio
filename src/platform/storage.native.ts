import Storage from 'expo-sqlite/kv-store'

// Synchronous SQLite storage keeps existing store mutations atomic from the UI's
// perspective: a failed write throws before Zustand publishes the new state.
export const storage = {
  getItem: (key: string): string | null => Storage.getItemSync(key),
  setItem: (key: string, value: string): void => Storage.setItemSync(key, value),
}
