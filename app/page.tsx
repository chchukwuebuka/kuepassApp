"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Stack } from "@mantine/core";
import HeroSection from "@/components/hero";
import CustomFooter from "@/components/Footer";
import Navbar from "@/components/navbar";
import EventSection from "@/components/TrendingEvents";
import styles from "./page.module.css";
import PlatformShowcase from "@/components/PlatformShowcase";
import ServicesSection from "@/components/Services";
import StatsSection from "@/components/StatsSection";
import HelpSection from "@/components/HelpSection";
import FAQSection from "@/components/FAQSection";

export default function KuepassHome() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  useEffect(() => {
    // If userId is provided in query params, redirect to user profile page
    if (userId) {
      console.log("Found userId in URL:", userId);
      console.log("Current URL:", window.location.href);
      console.log("Redirecting to:", `/user/${userId}`);

      // Immediate redirect to dynamic route
      const redirectUrl = `/user/${userId}`;
      console.log("Attempting redirect to:", redirectUrl);

      // Use replace to avoid back button issues
      window.location.replace(redirectUrl);
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
      <div style={{ position: "relative" }}>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url("/images/heroImage.png")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            zIndex: -2,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            zIndex: -1,
          }}
        />
        <Stack className={styles.navStark} style={{ marginBottom: "2rem" }}>
          <Navbar />
        </Stack>
        <HeroSection />
      </div>
      <Stack>
        <PlatformShowcase />
        <EventSection />
        <ServicesSection />
        <StatsSection />
        <HelpSection />
        <FAQSection />
      </Stack>
      <CustomFooter />
    </Stack>
  );
}
