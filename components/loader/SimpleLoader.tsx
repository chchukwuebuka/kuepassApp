"use client";
import { Box } from "@mantine/core";
import styles from "./simpleLoader.module.css";

const SimpleLoader = () => {
  return (
    <Box className={styles.simpleLoader}>
      <div className={styles.spinner}></div>
    </Box>
  );
};

export default SimpleLoader;
