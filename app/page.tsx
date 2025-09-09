"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Stack } from "@mantine/core";
import HeroSection from "@/components/hero";
import CustomFooter from "@/components/Footer";
import Navbar from "@/components/navbar";
import EventSection from "@/components/TrendingEvents";
import styles from "./page.module.css";
import { QuickPage } from "@/components/QuickPass";
import PlatformShowcase from "@/components/platform";

export default function KuepassHome() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  useEffect(() => {
    // If userId is provided in query params, redirect to user profile page
    if (userId) {
      window.location.href = `/user/${userId}`;
      return;
    }
  }, [userId]);

  // If userId is provided, show loading while redirecting
  if (userId) {
    return (
      <Stack
        style={{
          height: "100vh",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div>Redirecting to user profile...</div>
      </Stack>
    );
  }

  // Otherwise, show your original home page
  return (
    <Stack>
      <Stack className={styles.navStark}>
        <Navbar />
      </Stack>
      <Stack style={{ padding: "1rem" }}>
        <HeroSection />
        <PlatformShowcase />
        <EventSection />
        <QuickPage />
      </Stack>
      <CustomFooter />
    </Stack>
  );
}
