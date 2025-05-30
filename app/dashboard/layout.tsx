"use client";

import Navbar from "@/components/navbar";
import { Roboto } from "next/font/google";
import styles from "./styles.module.css";
import type { ReactNode } from "react";
import React from "react";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
});

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <div className={styles.dashboardLayout}>
        <div className={`${styles.container} ${roboto.className}`}>
          {children}
        </div>
      </div>
    </>
  );
}
