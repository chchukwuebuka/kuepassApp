"use client";

import React, { Suspense } from "react";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

export const dynamic = "force-dynamic";
import { Roboto } from "next/font/google";
import styles from "./styles.module.css";
import Sidebar, { type PageKey } from "@/components/Sidebar";
import TopBanner from "@/components/TopBanner";
import StatsCard from "@/components/StatsCard";
import UserTable from "@/components/UserTable";
import { Stack, Loader, Center, Text } from "@mantine/core";
import { authenticatedRequest } from "@/app/services/auth";
import nextDynamic from "next/dynamic";

// Lazy load heavy components
const Customization = nextDynamic(() => import("@/components/Customization"), {
  loading: () => (
    <Center>
      <Loader />
    </Center>
  ),
});
const TicketDashboard = nextDynamic(
  () => import("@/components/UserManagement"),
  {
    loading: () => (
      <Center>
        <Loader />
      </Center>
    ),
  }
);
const BulkPreRegistration = nextDynamic(
  () => import("@/components/BulkPreRegistration"),
  {
    loading: () => (
      <Center>
        <Loader />
      </Center>
    ),
  }
);
const Finance = nextDynamic(() => import("@/components/Finance"), {
  loading: () => (
    <Center>
      <Loader />
    </Center>
  ),
});
const YourPromotionKitComponent = nextDynamic(
  () => import("@/components/Generate"),
  {
    loading: () => (
      <Center>
        <Loader />
      </Center>
    ),
  }
);
const SalesAnalyticsPage = nextDynamic(
  () => import("@/components/SalesAnalytics"),
  {
    loading: () => (
      <Center>
        <Loader />
      </Center>
    ),
  }
);
const CreateEventPage = nextDynamic(
  () => import("@/components/CreateEventPage"),
  {
    loading: () => (
      <Center>
        <Loader />
      </Center>
    ),
  }
);
const VendorMarketplace = nextDynamic(
  () => import("@/components/VendorMarketplace"),
  {
    loading: () => (
      <Center>
        <Loader />
      </Center>
    ),
  }
);
const RefundDashboard = nextDynamic(
  () => import("@/components/RefundDashboard"),
  {
    loading: () => (
      <Center>
        <Loader />
      </Center>
    ),
  }
);
const EventToolsDashboard = nextDynamic(
  () => import("@/components/EventTools"),
  {
    loading: () => (
      <Center>
        <Loader />
      </Center>
    ),
  }
);
const SponsorDashboard = nextDynamic(
  () => import("@/components/SponsorDashboard"),
  {
    loading: () => (
      <Center>
        <Loader />
      </Center>
    ),
  }
);
const SessionManager = nextDynamic(
  () => import("@/components/SessionManager"),
  {
    loading: () => (
      <Center>
        <Loader />
      </Center>
    ),
  }
);
const SurveyDashboard = nextDynamic(
  () => import("@/components/SurveyDashboard"),
  {
    loading: () => (
      <Center>
        <Loader />
      </Center>
    ),
  }
);
const SeatingDashboard = nextDynamic(
  () => import("@/components/SeatingDashboard"),
  {
    loading: () => (
      <Center>
        <Loader />
      </Center>
    ),
  }
);
const AIEventPlanning = nextDynamic(
  () => import("@/components/AIEventPlanning"),
  {
    loading: () => (
      <Center>
        <Loader />
      </Center>
    ),
  }
);
const VendorDashboard = nextDynamic(
  () => import("@/components/VendorDashboard"),
  {
    loading: () => (
      <Center>
        <Loader />
      </Center>
    ),
  }
);
const OverviewDashboard = nextDynamic(
  () => import("@/components/OverviewDashboard"),
  {
    loading: () => (
      <Center>
        <Loader />
      </Center>
    ),
  }
);


const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.kuepass.com/api/"
).replace(/\/$/, "");

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

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
});

function DashboardContent() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");
  const mode = searchParams.get("mode");
  const page = searchParams.get("page");
  const [activeEventId, setActiveEventId] = useState<string>(eventId || "");
  const [event, setEvent] = useState<EventData | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<number>(0);
  const [validatedUsers, setValidatedUsers] = useState<number>(0);
  const [totalBalance, setTotalBalance] = useState<string>("₦0");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [activePage, setActivePage] = useState<PageKey>(() => {
    if (mode === "createEvent") return "createEvent";
    if (page) return page as PageKey;
    if (eventId) return "overview";
    return "createEvent";
  });
  const [isVendor, setIsVendor] = useState(false);

  // Check if user is a vendor (has vendor profile)
  useEffect(() => {
    const checkVendorStatus = async () => {
      try {
        await authenticatedRequest<any>(
          `${API_BASE_URL}/vendor/profile/`,
          "GET"
        );
        setIsVendor(true);
      } catch {
        setIsVendor(false);
      }
    };
    checkVendorStatus();
  }, []);

  // Sync activeEventId to URL if it changes and is not already in URL
  useEffect(() => {
    if (activeEventId && activeEventId !== eventId) {
      const params = new URLSearchParams(searchParams?.toString() || "");
      params.set("eventId", activeEventId);
      if (mode) params.set("mode", mode);
      if (page) params.set("page", page);
      
      const newUrl = `${pathname}?${params.toString()}`;
      router.replace(newUrl, { scroll: false });
    }
  }, [activeEventId, eventId, searchParams, pathname, router, mode, page]);

  // Auto-fetch the most recent event when no eventId is in the URL
  // But NOT when in createEvent mode — we want a fresh form
  useEffect(() => {
    if (eventId) {
      setActiveEventId(eventId);
      return;
    }

    // Don't auto-set an eventId when creating a new event
    if (mode === "createEvent") {
      setActiveEventId("");
      return;
    }

    // We no longer auto-fetch the latest event automatically
    // The dashboard will now load cleanly unless an event is specifically selected
    return;
  }, [eventId, mode]);

  useEffect(() => {
    if (!activeEventId) {
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
          `${API_BASE_URL}/events/${activeEventId}/`,
          "GET"
        );
        setEvent(eventResponse.data);

        // 2) Fetch all attendees (the endpoint is returning everyone, not just this event)
        const attendeesResponse = await authenticatedRequest<any>(
          `${API_BASE_URL}/attendees/?event=${activeEventId}`,
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
          (att) => att.event === activeEventId
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
  }, [activeEventId]);

  const handleNavClick = (pageKey: PageKey) => {
    setActivePage(pageKey);
  };

  const contentMapping: Record<PageKey, React.ReactElement> = {
    customization: <Customization />,
    userManagement: <TicketDashboard eventId={activeEventId} />,
    bulkPreRegister: <BulkPreRegistration eventId={activeEventId} />,
    finance: <Finance />,
    salesAnalytics: <SalesAnalyticsPage eventId={activeEventId} />,
    vendorMarketplace: <VendorMarketplace onBecomeVendor={() => setActivePage("vendorDashboard")} />,
    refunds: <RefundDashboard eventId={activeEventId} />,
    eventTools: <EventToolsDashboard eventId={activeEventId} />,
    sponsors: <SponsorDashboard eventId={activeEventId} />,
    sessions: <SessionManager eventId={activeEventId} />,
    surveys: <SurveyDashboard eventId={activeEventId} />,
    seating: <SeatingDashboard eventId={activeEventId} />,
    aiPlanning: <AIEventPlanning eventId={activeEventId} />,
    vendorDashboard: <VendorDashboard />,
    store: (
      <>
        <h1>Store</h1>
        <p>Store information goes here.</p>
      </>
    ),
    "Generate Promotion Kit": (
      <YourPromotionKitComponent eventId={activeEventId} />
    ),
    support: (
      <>
        <h1>Support</h1>
        <p>Support content goes here.</p>
      </>
    ),
    createEvent: <CreateEventPage />,
    overview: <OverviewDashboard 
      eventId={activeEventId} 
      event={event} 
      registeredUsers={registeredUsers} 
      validatedUsers={validatedUsers} 
      totalBalance={totalBalance} 
      onNavigateToCreate={() => setActivePage("createEvent")}
    />,
  };

  return (
    <div>
      <div className={styles.dashboardLayout}>
        <Sidebar activePage={activePage} onNavClick={handleNavClick} isVendor={isVendor} hasEvent={!!activeEventId} />
        <div className={`${styles.container} ${roboto.className}`}>
          <div className={styles.mainContent}>{contentMapping[activePage]}</div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense
      fallback={
        <div className={styles.dashboardLayout}>
          <Center style={{ height: "100vh" }}>
            <Loader size="xl" />
          </Center>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
