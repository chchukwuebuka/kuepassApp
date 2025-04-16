// utils/localStorage.ts
import { RootState } from "@/store/store"; // Adjust the path based on your project structure

export const loadState = () => {
  try {
    const serializedState = localStorage.getItem("state");
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState) as RootState;
  } catch (err) {
    console.error("Could not load state", err);
    return undefined;
  }
};

export const saveState = (state: RootState) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem("state", serializedState);
  } catch (err) {
    console.error("Could not save state", err);
  }
};
