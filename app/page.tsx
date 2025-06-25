import { Stack } from "@mantine/core";
import HeroSection from "@/components/hero";
import CustomFooter from "@/components/Footer";
import Navbar from "@/components/navbar";
import EventSection from "@/components/TrendingEvents";
import styles from "./page.module.css";
import { QuickPage } from "@/components/QuickPass";
import PlatformShowcase from "@/components/platform";

export default function KuepassHome() {
  return (
    <Stack>
      <Stack className={styles.navStark}>
        <Navbar />
      </Stack>
      <Stack style={{ padding: "1rem" }}>
        <HeroSection />
        <PlatformShowcase />
        <EventSection/>
        <QuickPage/>
      </Stack>
        <CustomFooter />
    </Stack>
  );
}
