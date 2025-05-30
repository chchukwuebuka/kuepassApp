// app/layout.tsx (or _app.tsx if you use the pages directory)
import { Roboto } from "next/font/google";
import { createTheme } from "@mantine/core";
import ReduxProvider from "@/store/provider";
import ErrorBoundary from "@/components/ErrorBoundary";
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
        <ReduxProvider theme={theme}>
          <ErrorBoundary>
            <main className={styles.mainContent}>{children}</main>
          </ErrorBoundary>
        </ReduxProvider>
      </body>
    </html>
  );
}


// "use client"; // Add "use client" if reading env var directly or for consistency if children need it immediately

// import { Roboto } from "next/font/google";
// import { MantineProvider, createTheme,ColorSchemeScript } from "@mantine/core"; // Import MantineProvider
// import { GoogleOAuthProvider } from '@react-oauth/google'; // Import GoogleOAuthProvider
// import ReduxProvider from "@/store/provider"; // Your Redux Provider
// import ErrorBoundary from "@/components/ErrorBoundary";
// import "./globals.css"; // Ensure Mantine core styles are imported if not already
// import '@mantine/core/styles.css'; // Mantine V7 core styles
// // Import other Mantine component styles if needed, e.g., @mantine/dates/styles.css

// const roboto = Roboto({
//   subsets: ["latin"],
//   weight: ["100", "300", "400", "500", "700", "900"],
// });

// const theme = createTheme({
//   fontFamily: roboto.style.fontFamily,
//   // ... your other theme customizations
// });

// // It's good practice to define this outside the component if it doesn't change
// const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   if (!GOOGLE_CLIENT_ID) {
//     console.error(
//       "CRITICAL: NEXT_PUBLIC_GOOGLE_CLIENT_ID environment variable is not set! Google Sign-In will not work."
//     );
//     // You might want to render a noticeable error or a limited version of the app
//     // or simply proceed and let the Google library handle the missing ID error,
//     // but logging it is important.
//   }

//   return (
//     <html lang="en">
//       <head>
//         <ColorSchemeScript /> {/* Required for Mantine V7 default color scheme */}
//       </head>
//       <body className={roboto.className}>
//         {GOOGLE_CLIENT_ID ? (
//           <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
//             <ReduxProvider> {/* Pass theme to MantineProvider if ReduxProvider doesn't handle it */}
//               <MantineProvider theme={theme}> {/* Wrap with MantineProvider */}
//                 <ErrorBoundary>
//                   <main /*className={styles.mainContent} - mainContent often better on page level*/>
//                     {children}
//                   </main>
//                 </ErrorBoundary>
//               </MantineProvider>
//             </ReduxProvider>
//           </GoogleOAuthProvider>
//         ) : (
//           // Fallback if Google Client ID is missing
//           // You might want to show an error message or a limited app state
//           <ReduxProvider>
//             <MantineProvider theme={theme}>
//               <ErrorBoundary>
//                 <div>
//                   <p style={{ color: 'red', textAlign: 'center', padding: '20px', background: '#fff0f0', border: '1px solid red' }}>
//                     Google Authentication is not configured correctly (Missing Client ID). Some features may not work.
//                   </p>
//                   <main /*className={styles.mainContent}*/>{children}</main>
//                 </ErrorBoundary>
//               </MantineProvider>
//             </ReduxProvider>
//           </ReduxProvider>
//         )}
//       </body>
//     </html>
//   );
// }
