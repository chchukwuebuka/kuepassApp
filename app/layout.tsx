// import type { Metadata } from "next";

// import { Roboto } from "next/font/google";
// import { createTheme } from "@mantine/core";
// import ReduxProvider from "@/store/provider";
// import ErrorBoundary from "@/components/ErrorBoundary";
// import "./globals.css";
// import styles from "./page.module.css";

// const roboto = Roboto({
//   subsets: ["latin"],
//   weight: ["100", "300", "400", "500", "700", "900"],
// });

// const theme = createTheme({
//   fontFamily: roboto.style.fontFamily,
//   components: {
//     Transition: {
//       defaultProps: {
//         transition: "fade",
//         duration: 400,
//         timingFunction: "ease",
//       },
//     },
//   },
// });

// export const metadata: Metadata = {
//   title: "Kuepass App",
//   description: "Welcome to our Kuepass App.",
//   icons: {
//     icon: [
//       {
//         url: "/icon.png",
//         sizes: "32x32",
//         type: "image/png",
//       },
//       {
//         url: "/icon.png",
//         sizes: "16x16",
//         type: "image/png",
//       },
//     ],
//     shortcut: "/icon.png",
//     apple: "/icon.png",
//     other: [
//       {
//         rel: "mask-icon",
//         url: "/icon.png",
//         color: "#000",
//       },
//     ],
//   },
// };

// // STEP 3: No changes are needed to your actual RootLayout component.
// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en">
//       <body className={roboto.className}>
//         <ReduxProvider theme={theme}>
//           <ErrorBoundary>
//             <main className={styles.mainContent}>{children}</main>
//           </ErrorBoundary>
//         </ReduxProvider>
//       </body>
//     </html>
//   );
// }


import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { createTheme } from "@mantine/core";
import ReduxProvider from "@/store/provider";
import ErrorBoundary from "@/components/ErrorBoundary";
import "./globals.css";
import styles from "./page.module.css";
import GlobalLoading from "@/components/loader/globalLoading";
import { AnalyticsProvider } from "@/components/GoogleAnalytics/AnalyticsProvider";

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

export const metadata: Metadata = {
  title: "Kuepass App",
  description: "Welcome to our Kuepass App.",
  icons: {
    icon: [
      {
        url: "/icon.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/icon.png",
        sizes: "16x16",
        type: "image/png",
      },
    ],
    shortcut: "/icon.png",
    apple: "/icon.png",
    other: [
      {
        rel: "mask-icon",
        url: "/icon.png",
        color: "#000",
      },
    ],
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={roboto.className}>
        <AnalyticsProvider />
        <ReduxProvider theme={theme}>
          <GlobalLoading />
          <ErrorBoundary>
            <main className={styles.mainContent}>{children}</main>
          </ErrorBoundary>
        </ReduxProvider>
      </body>
    </html>
  );
}