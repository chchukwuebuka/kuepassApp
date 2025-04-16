"use client";
import Navbar from "@/components/navbar";
import { Roboto } from "next/font/google";
import styles from "./styles.module.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
});

export default function DashboardLayout({ children }) {
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
