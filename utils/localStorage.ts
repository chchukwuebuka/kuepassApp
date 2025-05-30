// // utils/localStorage.ts
// import { RootState } from "@/store/store"; // Adjust the path based on your project structure

// export const loadState = () => {
//   try {
//     const serializedState = localStorage.getItem("state");
//     if (serializedState === null) {
//       return undefined;
//     }
//     return JSON.parse(serializedState) as RootState;
//   } catch (err) {
//     console.error("Could not load state", err);
//     return undefined;
//   }
// };

// export const saveState = (state: RootState) => {
//   try {
//     const serializedState = JSON.stringify(state);
//     localStorage.setItem("state", serializedState);
//   } catch (err) {
//     console.error("Could not save state", err);
//   }
// };

// utils/localStorage.ts
import { RootState } from "@/store/store"; // Adjust path if needed

export const loadState = (): RootState | undefined => { // Ensure return type matches preloadedState expectation
  if (typeof window === "undefined") {
    // We are on the server, localStorage is not available
    return undefined;
  }
  try {
    const serializedState = localStorage.getItem("state"); // Or your specific key for redux-persist if you were trying to read that
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState) as RootState;
  } catch (err) {
    console.error("Could not load state from localStorage", err);
    return undefined;
  }
};