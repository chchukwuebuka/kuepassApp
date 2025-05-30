// store/customStorage.ts
import createWebStorage from "redux-persist/lib/storage/createWebStorage";

const createNoopStorage = () => {
  return {
    getItem(_key: string): Promise<string | null> {
      return Promise.resolve(null);
    },
    setItem(_key: string, value: any): Promise<any> {
      return Promise.resolve(value);
    },
    removeItem(_key: string): Promise<void> {
      return Promise.resolve();
    },
  };
};

const storage =
  typeof window !== "undefined"
    ? createWebStorage("local") // Uses localStorage on the client
    // ? createWebStorage("session") // Or uncomment this and comment above to use sessionStorage
    : createNoopStorage(); // Uses a no-op storage on the server

export default storage;