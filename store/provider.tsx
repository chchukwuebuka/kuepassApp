"use client";
import { ReactNode } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { MantineProvider, MantineThemeOverride } from "@mantine/core";
import { store, persistor } from "./store";
import GlobalLoading from "@/components/loader/globalLoading";
import { AuthProviders } from "@/app/providers";
import OfflineIndicator from "@/app/components/OfflineIndicator";
import { GoogleOAuthProvider } from "@react-oauth/google";

// CSS should either be imported globally in your layout
// or used as a CSS module with styles.className

interface ReduxProviderProps {
  children: ReactNode;
  theme?: MantineThemeOverride;
}

const ReduxProvider = ({ children, theme }: ReduxProviderProps) => {
  const content = (
    <>
      {children}
      <GlobalLoading />
      <OfflineIndicator />
    </>
  );

  // Get the Google Client ID from environment variables
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <MantineProvider theme={theme}>
          <GoogleOAuthProvider clientId={googleClientId}>
            <AuthProviders>{content}</AuthProviders>
          </GoogleOAuthProvider>
        </MantineProvider>
      </PersistGate>
    </Provider>
  );
};

export default ReduxProvider;
