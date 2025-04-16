"use client";
import { useState } from "react";
import { Roboto } from "next/font/google";
import styles from "./styles.module.css";
import Sidebar from "@/components/Sidebar";
import TopBanner from "@/components/TopBanner";
import StatsCard from "@/components/StatsCard";
import UserTable from "@/components/UserTable";
import Navbar from "@/components/navbar";
import Customization from "@/components/Customization";
import TicketDashboard from "@/components/UserManagement";
import Finance from "@/components/Finance";
import { Stack } from "@mantine/core";

type PageKey =
  | "overview"
  | "customization"
  |  "userManagement"
  | "finance"
  | "store"
  | "support"
  | "logout";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
});

export default function Dashboard() {
  const [activePage, setActivePage] = useState<PageKey>("overview");

  const handleNavClick = (pageKey: PageKey) => {
    setActivePage(pageKey);
  };

  const contentMapping: Record<PageKey, JSX.Element> = {
    overview: (
      <>
        <TopBanner />
        <div className={styles.statsGrid}>
          <StatsCard title="Total Registered Users" value="150" />
          <StatsCard title="Total Validated Users" value="145" />
          <StatsCard
            title="Total Balance"
            value="₦505,000"
            btnValue="View Details"
            onClick={() => console.log("Total Balance button clicked!")}
          />
        </div>
        <UserTable />
      </>
    ),
    customization: (
      <>
      <Customization/>
      </>
    ),
    userManagement: (
      <>
      <TicketDashboard/>
      </>
    ),
    finance: (
      <>
       <Finance/>
      </>
    ),
    store: (
      <>
        <h1>Store</h1>
        <p>Store information goes here.</p>
      </>
    ),
    support: (
      <>
        <h1>Support</h1>
        <p>Support content goes here.</p>
      </>
    ),
    logout: (
      <>
        <h1>Log Out</h1>
        <p>You have been logged out.</p>
      </>
    ),
  };

  return (
    <div>
      <Stack className={styles.navStark}>
        <Navbar />
      </Stack>
      <div className={styles.dashboardLayout}>
        {/* Sidebar receives activePage and callback */}
        <Sidebar activePage={activePage} onNavClick={handleNavClick} />
        <div className={`${styles.container} ${roboto.className}`}>
          <div className={styles.mainContent}>{contentMapping[activePage]}</div>
        </div>
      </div>
    </div>
  );
}
