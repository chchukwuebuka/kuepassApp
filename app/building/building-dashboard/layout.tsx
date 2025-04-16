"use client";
import Navbar from "@/components/navbar";
import { Roboto } from "next/font/google";
import styles from "./styles.module.css";
import { Stack } from "@mantine/core";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
});

export default function DashboardLayout({ children }) {
  return (
    <>
      <Stack className={styles.navStark}>
        <Navbar />
      </Stack>
      <div className={styles.dashboardLayout}>
        <div className={`${styles.container} ${roboto.className}`}>
          {children}
        </div>
      </div>
    </>
  );
}
