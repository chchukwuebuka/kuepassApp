'use client';
import { ReactNode } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { MantineProvider } from "@mantine/core";
import { store, persistor } from "./store"; 
import GlobalLoading from "@/components/loader/globalLoading";

// CSS should either be imported globally in your layout
// or used as a CSS module with styles.className

interface ReduxProviderProps {
  children: ReactNode;
}

const ReduxProvider = ({ children }: ReduxProviderProps) => {
  const content = (
    <>
      {children}
      <GlobalLoading/>
    </>
  );

  if (!persistor) {
    return (
      <Provider store={store}>
        <MantineProvider>
          {content}
        </MantineProvider>
      </Provider>
    );
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <MantineProvider>
          {content}
        </MantineProvider>
      </PersistGate>
    </Provider>
  );
};

export default ReduxProvider;