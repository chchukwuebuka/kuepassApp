"use client";
import { Stack, Box } from "@mantine/core";
import Image from "next/image";
import styles from "./loader.module.css";
import api from "../../utils/api";

const Loading = () => {
  return (
    <Stack align="center" justify="center" className={styles.loaderContainer}>
      <Box className={styles.spinnerWrapper}>
        {/* Outer rotating ring */}
        <div className={styles.outerRing}></div>

        {/* Middle rotating ring */}
        <div className={styles.middleRing}></div>

        {/* Inner rotating ring */}
        <div className={styles.innerRing}></div>

        {/* Stationary logo in center */}
        <Box className={styles.logoContainer}>
          <Image
            src="/images/klogo.png" // Updated path (removed /public)
            alt="Loading..."
            width={60}
            height={60}
            className={styles.logo}
            priority
          />
        </Box>

        {/* Decorative dots */}
        <div className={styles.dot1}></div>
        <div className={styles.dot2}></div>
        <div className={styles.dot3}></div>
        <div className={styles.dot4}></div>
      </Box>
    </Stack>
  );
};

export default Loading;
