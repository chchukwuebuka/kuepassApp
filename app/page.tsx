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
      console.log("Found userId in URL:", userId);
      console.log("Current URL:", window.location.href);
      console.log("Redirecting to:", `/user/${userId}`);

      // Immediate redirect
      const redirectUrl = `/user/${userId}`;
      console.log("Attempting redirect to:", redirectUrl);

      // Try multiple redirect methods
      try {
        window.location.replace(redirectUrl);
      } catch (error) {
        console.error("Redirect failed, trying alternative method:", error);
        window.location.href = redirectUrl;
      }
      return;
    }
  }, [userId]);

  // If userId is provided, show loading while redirecting
  if (userId) {
    const handleManualRedirect = () => {
      window.location.href = `/user/${userId}`;
    };

    return (
      <Stack
        style={{
          height: "100vh",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div>Redirecting to user profile for: {userId}</div>
        <div>Please wait...</div>
        <button
          onClick={handleManualRedirect}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            backgroundColor: "#025a3a",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Click here if redirect doesn&apos;t work
        </button>
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
