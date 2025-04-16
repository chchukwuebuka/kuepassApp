

// app/layout.tsx (or _app.tsx if you use the pages directory)
import { Roboto } from "next/font/google";
import { MantineProvider, createTheme } from "@mantine/core";
import ReduxProvider from "@/store/provider";
import ErrorBoundary from "@/components/ErrorBoundary";
import GlobalLoading from "@/components/loader/globalLoading";
import "./globals.css";
import styles from "./page.module.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
});

const theme = createTheme({
  fontFamily: roboto.style.fontFamily,
  components: {
    Transition: {
      defaultProps: {
        transition: "fade",
        duration: 400,
        timingFunction: "ease",
      },
    },
  },
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={roboto.className}>
        <ReduxProvider>
          <ErrorBoundary>
            <MantineProvider theme={theme} >
              <GlobalLoading />
              <main className={styles.mainContent}>{children}</main>
            </MantineProvider>
          </ErrorBoundary>
        </ReduxProvider>
      </body>
    </html>
  );
}
