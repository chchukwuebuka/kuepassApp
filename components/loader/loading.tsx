"use client";
import "@mantine/core/styles.css";
import React from "react";
import { Stack } from "@mantine/core";
import Image from "next/image";
import styles from "./loader.module.css";

const Loading = () => {
  return (
    <Stack align="center" justify="center" className={styles.loaderContainer}>
      {/* Rotating Circle */}
      <div className={styles.spinner}>
        {/* Centered Image */}
        <Image
          src="/path-to-your-image/Kuepass Logo.png" // Replace with your image path
          alt="Loader Icon"
          width={80}
          height={80}
          className={styles.image}
        />
      </div>
    </Stack>
  );
};

export default Loading;
