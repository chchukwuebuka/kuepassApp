// "use client";
// import React from "react";
// import { useSelector } from "react-redux";
// import { RootState } from "../../store/store";
// import Loading from "./loader";

// const GlobalLoading: React.FC = () => {
//   const isLoading = useSelector((state: RootState) => state.loading.isLoading);

//   if (!isLoading) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
//       <Loading />
//     </div>
//   );
// };

// export default GlobalLoading;

"use client";

import type React from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import { Box, Container, Text, Stack } from "@mantine/core";
import Loading from "./loader";
import styles from "./globaLoading.module.css";

const GlobalLoading: React.FC = () => {
  const isLoading = useSelector((state: RootState) => state.loading.isLoading);

  if (!isLoading) return null;

  return (
    <Box className={styles.globalLoaderOverlay}>
      <Container size="sm" className={styles.loaderWrapper}>
        <Stack align="center" gap="xl">
          <Loading />
          <Stack align="center" gap="xs">
            <Text size="lg" fw={600} className={styles.loadingText}>
              Loading...
            </Text>
            <Text
              size="sm"
              c="dimmed"
              ta="center"
              className={styles.loadingSubtext}
            >
              Please wait while we prepare everything for you
            </Text>
          </Stack>
        </Stack>
      </Container>

      {/* Animated background elements */}
      <div className={styles.backgroundElement1}></div>
      <div className={styles.backgroundElement2}></div>
      <div className={styles.backgroundElement3}></div>
    </Box>
  );
};

export default GlobalLoading;
