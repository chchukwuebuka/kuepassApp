// "use client";

// import React, { createContext, useContext, ReactNode } from "react";
// import { GlobalLoader } from "@/components/GlobalLoader";
// import { useSelector } from "react-redux";
// import { RootState } from "@/store/store";

// interface LoadingContextType {
//   isLoading: boolean;
// }

// const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

// export function LoadingProvider({ children }: { children: ReactNode }) {
//   let isLoading = false;

//   try {
//     isLoading = useSelector((state: RootState) => state.loading.isLoading);
//   } catch (error) {
//     // If Redux is not available yet, default to false
//     console.warn("Redux not available in LoadingProvider:", error);
//   }

//   return (
//     <LoadingContext.Provider value={{ isLoading }}>
//       {children}
//       {isLoading && <GlobalLoader />}
//     </LoadingContext.Provider>
//   );
// }

// export function useLoading() {
//   const context = useContext(LoadingContext);
//   if (context === undefined) {
//     throw new Error("useLoading must be used within a LoadingProvider");
//   }
//   return context;
// }
