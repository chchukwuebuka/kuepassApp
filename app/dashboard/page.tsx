"use client";

import React from "react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Roboto } from "next/font/google";
import styles from "./styles.module.css";
import Sidebar from "@/components/Sidebar";
import TopBanner from "@/components/TopBanner";
import StatsCard from "@/components/StatsCard";
import UserTable from "@/components/UserTable";
import { Stack, Loader, Center, Text } from "@mantine/core";
import { authenticatedRequest } from "@/app/services/auth";
import dynamic from "next/dynamic";

// Lazy load heavy components
const Customization = dynamic(() => import("@/components/Customization"), {
  loading: () => (
    <Center>
      <Loader />
    </Center>
  ),
});
const TicketDashboard = dynamic(() => import("@/components/UserManagement"), {
  loading: () => (
    <Center>
      <Loader />
    </Center>
  ),
});
const Finance = dynamic(() => import("@/components/Finance"), {
  loading: () => (
    <Center>
      <Loader />
    </Center>
  ),
});
const YourPromotionKitComponent = dynamic(
  () => import("@/components/Generate"),
  {
    loading: () => (
      <Center>
        <Loader />
      </Center>
    ),
  }
);
const SalesAnalyticsPage = dynamic(
  () => import("@/components/SalesAnalytics"),
  {
    loading: () => (
      <Center>
        <Loader />
      </Center>
    ),
  }
);

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://keupass-48c2ae65f897.herokuapp.com/api";

interface Customization {
  banner_url: string;
  card_color: string;
}

interface EventData {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  banner_url: string;
  location: string;
  is_active: boolean;
  creator: { id: number; username: string };
  customizations: Customization[];
}

interface AttendeeData {
  id: string;
  event: string;
  user: number | null;
  email: string;
  name: string;
  phone_number: string;
  registration_date: string;
  responses: any[];
  is_validated: boolean;
  validated_at: string | null;
}

type PageKey =
  | "overview"
  | "customization"
  | "userManagement"
  | "salesAnalytics"
  | "finance"
  | "Generate Promotion Kit"
  | "store"
  | "support"
  | "logout";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
});

export default function Dashboard() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");
  const [event, setEvent] = useState<EventData | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<number>(0);
  const [validatedUsers, setValidatedUsers] = useState<number>(0);
  const [totalBalance, setTotalBalance] = useState<string>("₦0");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activePage, setActivePage] = useState<PageKey>("overview");

  useEffect(() => {
    if (!eventId) {
      setEvent(null);
      setRegisteredUsers(0);
      setValidatedUsers(0);
      setTotalBalance("₦0");
      setLoading(false);
      return;
    }

    const fetchEventData = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1) Fetch the single event
        const eventResponse = await authenticatedRequest<{ data: EventData }>(
          `${API_BASE_URL}/events/${eventId}/`,
          "GET"
        );
        setEvent(eventResponse.data);

        // 2) Fetch all attendees (the endpoint is returning everyone, not just this event)
        const attendeesResponse = await authenticatedRequest<any>(
          `${API_BASE_URL}/attendees/?event=${eventId}`,
          "GET"
        );

        // 3) Extract the array (could be wrapped in data or results)
        let allAttendees: AttendeeData[] = [];
        if (Array.isArray(attendeesResponse)) {
          allAttendees = attendeesResponse;
        } else if (Array.isArray(attendeesResponse.data)) {
          allAttendees = attendeesResponse.data;
        } else if (Array.isArray(attendeesResponse.results)) {
          allAttendees = attendeesResponse.results;
        } else {
          console.warn(
            "Unable to find attendees array in response, defaulting to empty",
            attendeesResponse
          );
          allAttendees = [];
        }

        // 4) Filter down to only those whose `event` property exactly matches our eventId
        const filteredForThisEvent = allAttendees.filter(
          (att) => att.event === eventId
        );

        // 5) Now count how many remain after filtering
        setRegisteredUsers(filteredForThisEvent.length);

        // 6) If you also need "validated" count, filter again on is_validated
        const validatedCount = filteredForThisEvent.filter(
          (att) => att.is_validated
        ).length;
        setValidatedUsers(validatedCount);

        // 7) (Optional) Total balance logic goes here; for now we leave it as ₦0
        setTotalBalance("₦0");
      } catch (err: any) {
        console.error("Failed to fetch event or attendees:", err);
        setError(err.message || "Could not load event/attendee data.");
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [eventId]);

  const handleNavClick = (pageKey: PageKey) => {
    setActivePage(pageKey);
  };

  const contentMapping: Record<PageKey, React.ReactElement> = {
    overview: (
      <>
        {loading ? (
          <Center style={{ height: "200px" }}>
            <Loader size="xl" />
          </Center>
        ) : error ? (
          <Center style={{ height: "200px" }}>
            <Text color="red" size="xl">
              {error}
            </Text>
          </Center>
        ) : event ? (
          <TopBanner event={event} />
        ) : (
          <div className={styles.placeholderBanner}>
            <h2>Select an event to view details</h2>
          </div>
        )}
        <div className={styles.statsGrid}>
          <StatsCard
            title="Total Registered Users"
            value={registeredUsers.toString()}
          />
          <StatsCard
            title="Total Validated Users"
            value={validatedUsers.toString()}
          />
          <StatsCard
            title="Total Balance"
            value={totalBalance}
            btnValue="View Details"
            onClick={() => console.log("Total Balance button clicked!")}
          />
        </div>
        <UserTable eventId={eventId || ""} searchQuery="" filter="all" />
      </>
    ),
    customization: <Customization />,
    userManagement: <TicketDashboard eventId={eventId || ""} />,
    finance: <Finance />,
    salesAnalytics: <SalesAnalyticsPage eventId={eventId || ""} />,
    store: (
      <>
        <h1>Store</h1>
        <p>Store information goes here.</p>
      </>
    ),
    "Generate Promotion Kit": (
      <YourPromotionKitComponent eventId={eventId || ""} />
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
      <div className={styles.dashboardLayout}>
        <Sidebar activePage={activePage} onNavClick={handleNavClick} />
        <div className={`${styles.container} ${roboto.className}`}>
          <div className={styles.mainContent}>{contentMapping[activePage]}</div>
        </div>
      </div>
    </div>
  );
}
