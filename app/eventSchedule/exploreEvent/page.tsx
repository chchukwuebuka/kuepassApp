"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Image,
  Stack,
  Text,
  Button,
  Center,
  Loader,
  Paper,
  TextInput,
  Select,
  Group,
  Box,
  ActionIcon,
} from "@mantine/core";
import {
  IconSearch,
  IconMapPin,
  IconCalendar,
  IconTag,
  IconCurrencyDollar,
  IconChevronDown,
} from "@tabler/icons-react";
import Navbar from "@/components/navbar";
import styles from "./styles.module.css";
import { getAuthToken, isAuthenticated } from "@/app/services/auth";
import { useLoadingState } from "@/store/loadingHook";
import Footer from "@/components/Footer";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://keupass-48c2ae65f897.herokuapp.com/api"
).replace(/\/$/, "");

interface EventData {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  address?: string;
  location?: string;
  creator?: { id: number; username: string };
  customization?: {
    banner_url: string;
  };
  description?: string;
  price?: string;
  collaborators?: Array<{
    id: number;
    email: string;
    username?: string;
  }>;
}

interface AttendeeData {
  id: string;
  event: string;
  user: number;
  email: string;
  name: string;
  registration_date: string;
}

interface ApiUserResponse {
  success: boolean;
  data: {
    id: number;
    username: string;
    email: string;
  };
  message?: string;
}

interface MappedEvent {
  id: string;
  title: string;
  category: "Upcoming" | "Ongoing" | "Ended";
  image: string;
  date: string;
  address: string;
  name: string;
  ownership: "Created" | "Registered" | "None";
  price?: string;
}

type CategoryFilter = "All" | MappedEvent["category"];
type OwnershipFilter = "All" | "Created" | "Registered";

const ExploreEvents: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("Enugu Nigeria");
  const [dateFilter, setDateFilter] = useState("All dates");
  const [eventTypeFilter, setEventTypeFilter] = useState("All Events");
  const [priceFilter, setPriceFilter] = useState("Price");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("All");
  const [ownershipFilter, setOwnershipFilter] =
    useState<OwnershipFilter>("All");
  const [events, setEvents] = useState<MappedEvent[]>([]);
  const [featuredEvent, setFeaturedEvent] = useState<MappedEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { withLoading } = useLoadingState();

  const formatDateRange = (start: string, end: string): string => {
    const s = new Date(start),
      e = new Date(end);
    const opts: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
    };
    return s.toDateString() === e.toDateString()
      ? s.toLocaleDateString("en-US", opts)
      : `${s.toLocaleDateString("en-US", opts)} - ${e.toLocaleDateString(
          "en-US",
          opts
        )}`;
  };

  const getEventCategory = (
    start: string,
    end: string
  ): MappedEvent["category"] => {
    const now = new Date(),
      s = new Date(start),
      e = new Date(end);
    if (now < s) return "Upcoming";
    if (now <= e) return "Ongoing";
    return "Ended";
  };

  const onOwnershipChange = (newFilter: OwnershipFilter) => {
    setOwnershipFilter(newFilter);
    setCategoryFilter("All");
  };

  useEffect(() => {
    const fetchAllEventsAndUserData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        await withLoading(async () => {
          // 1) Fetch events publicly (no auth token needed)
          const eventsRes = await fetch(`${API_BASE_URL}/events/`);
          if (!eventsRes.ok) {
            throw new Error(`Failed to fetch events: ${eventsRes.status}`);
          }
          const eventsJson = await eventsRes.json();
          const allEvents: EventData[] = eventsJson.data || [];

          // Debug: Check if events have collaborator data
          console.log("Events data from API:", allEvents);
          allEvents.forEach((event) => {
            console.log(
              `Event "${event.title}" - Has collaborators:`,
              !!event.collaborators,
              "Collaborators:",
              event.collaborators
            );
          });

          // 2) Check if we have a token; if so, fetch user data and attendees in parallel
          const token = getAuthToken();
          let userId: number | null = null;
          let userEmail: string | null = null;
          let allAttendees: AttendeeData[] = [];

          console.log("Auth token exists:", !!token);
          console.log("Is authenticated:", isAuthenticated());

          if (token) {
            try {
              // 2a & 2b) Fetch user data and attendees in parallel for faster loading
              const [userRes, attendeeRes] = await Promise.all([
                fetch(`${API_BASE_URL}/users/me/`, {
                  headers: { Authorization: `Bearer ${token}` },
                }),
                fetch(`${API_BASE_URL}/attendees/`, {
                  headers: { Authorization: `Bearer ${token}` },
                }),
              ]);

              console.log("User API response status:", userRes.status);
              console.log("Attendees API response status:", attendeeRes.status);

              // Process user response
              if (userRes.ok) {
                const userJson: ApiUserResponse = await userRes.json();
                console.log("User API response:", userJson);
                if (userJson.success && userJson.data.id) {
                  userId = userJson.data.id;
                  userEmail = userJson.data.email;
                  console.log("User ID:", userId, "User Email:", userEmail);
                }
              } else {
                console.error(
                  "User API failed:",
                  userRes.status,
                  await userRes.text()
                );
                // If authentication fails, clear the token and redirect to login
                if (userRes.status === 401 || userRes.status === 404) {
                  console.log("Authentication failed, clearing token");
                  localStorage.removeItem("auth_token");
                  // You might want to redirect to login here
                  // window.location.href = '/auth/signin';
                }
              }

              // Process attendees response
              if (attendeeRes.ok) {
                const attendeeJson = await attendeeRes.json();
                allAttendees = attendeeJson.data || [];
              } else {
                console.error(
                  "Attendees API failed:",
                  attendeeRes.status,
                  await attendeeRes.text()
                );
              }
            } catch (error) {
              console.error("Error fetching user data:", error);
            }
          }

          // Build a set of event IDs the user has registered for
          const registeredEventIds = new Set<string>();
          if (userId !== null) {
            allAttendees
              .filter((a) => a.user === userId)
              .forEach((a) => registeredEventIds.add(a.event));
          }

          console.log("User ID:", userId);
          console.log("Registered event IDs:", Array.from(registeredEventIds));

          // Map events into the shape the UI needs
          const mappedEvents: MappedEvent[] = allEvents.map((e) => {
            const bannerImage =
              e.customization?.banner_url || "/images/placeholder.jpg";

            let ownershipStatus: MappedEvent["ownership"] = "None";

            // Check if user is the creator
            if (userId !== null && e.creator && e.creator.id === userId) {
              ownershipStatus = "Created";
              console.log(
                `Event "${e.title}" is owned by current user (ID: ${userId})`
              );
            }
            // Check if user is a collaborator (by email)
            else if (
              userEmail &&
              e.collaborators &&
              e.collaborators.some((collab) => collab.email === userEmail)
            ) {
              ownershipStatus = "Created"; // Treat collaborators the same as creators for dashboard access
              console.log(
                `Event "${e.title}" - user is a collaborator (email: ${userEmail})`
              );
            }
            // Check if user is registered for the event
            else if (userId !== null && registeredEventIds.has(e.id)) {
              ownershipStatus = "Registered";
            }

            // Debug: Show all events and their creators/collaborators
            console.log(
              `Event "${e.title}" - Creator ID: ${
                e.creator?.id
              }, Current User ID: ${userId}, User Email: ${userEmail}, Collaborators: ${
                e.collaborators?.map((c) => c.email).join(", ") || "None"
              }, Ownership: ${ownershipStatus}`
            );

            return {
              id: e.id,
              title: e.title,
              category: getEventCategory(e.start_date, e.end_date),
              image: bannerImage,
              date: formatDateRange(e.start_date, e.end_date),
              address: e.address || e.location || "Location not specified",
              name: e.creator?.username || "Unknown Host",
              ownership: ownershipStatus,
              price: e.price || "Free",
            };
          });

          setEvents(mappedEvents);

          // Set the first upcoming event as featured
          const upcomingEvent = mappedEvents.find(
            (e) => e.category === "Upcoming"
          );
          if (upcomingEvent) {
            setFeaturedEvent(upcomingEvent);
          }
        });
      } catch (err: any) {
        console.error("[ExploreEvents] Error:", err);
        setError(
          err.message || "Failed to load events. Please try again later."
        );
        setEvents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllEventsAndUserData();
  }, []);

  const filteredEvents = events.filter((ev) => {
    const searchMatch =
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.address.toLowerCase().includes(searchQuery.toLowerCase());
    const categoryMatch =
      categoryFilter === "All" || ev.category === categoryFilter;
    const ownershipMatch =
      ownershipFilter === "All" || ev.ownership === ownershipFilter;
    return searchMatch && categoryMatch && ownershipMatch;
  });

  const FilterDropdown: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
  }> = ({ icon, label, value, onChange, options }) => (
    <Select
      leftSection={icon}
      rightSection={<IconChevronDown size={16} />}
      placeholder={label}
      value={value}
      onChange={(val) => onChange(val || "")}
      data={options}
      styles={{
        input: {
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          backgroundColor: "#f9fafb",
          fontSize: "14px",
          fontWeight: 500,
          color: "#374151",
          minWidth: "140px",
        },
      }}
    />
  );

  const EventCardDisplay: React.FC<{ eventData: MappedEvent }> = ({
    eventData,
  }) => {
    const [imageSrc, setImageSrc] = useState(eventData.image);
    const handleImageError = () => setImageSrc("/images/placeholder.jpg");

    useEffect(() => {
      setImageSrc(eventData.image);
    }, [eventData.image]);

    return (
      <div className={styles.eventCard}>
        <div className={styles.eventImageContainer}>
          <Image
            src={imageSrc}
            alt={eventData.title}
            className={styles.eventImage}
            onError={handleImageError}
            fallbackSrc="/images/placeholder.jpg"
          />
        </div>
        <div className={styles.eventContent}>
          <div style={{ borderBottom: "1px solid #E6E6E6" }}>
            <h3 className={styles.eventTitle}>{eventData.title}</h3>
          </div>
          <div className={styles.eventDetails}>
            <div className={styles.eventDetail}>
              <Image
                src="/images/location.png"
                alt="Location"
                width="30"
                height="30"
                style={{ width: "30px", height: "30x", objectFit: "contain" }}
              />
              <span>{eventData.address}</span>
            </div>
            <div className={styles.eventDetail}>
              <Image
                src="/images/Edate.png"
                alt="Location"
                width="30"
                height="30"
                style={{ width: "30px", height: "30x", objectFit: "contain" }}
              />
              <span>{eventData.date}</span>
            </div>
          </div>
          <div className={styles.eventType}>
            {eventData.price === "Free" || eventData.price === "0.00000000"
              ? "Free"
              : "Paid"}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.pageContainer}>
      <Stack className={styles.navStack}>
        <Navbar />
      </Stack>

      {/* Search Bar */}
      <div className={styles.searchSection}>
        <TextInput
          leftSection={<IconSearch size={20} color="#F5B645" />}
          placeholder="Search events, artists, teams, and more"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
          styles={{
            input: {
              borderRadius: "40px",
              color: "#A1A1A1",
              border: "1px solid #a9a9a9",
              backgroundColor: "white",
              fontSize: "16px",
              height: "48px",
              width: "100%",
            },
          }}
        />
      </div>

      {/* Title Page Banner */}
      {/* <div className={styles.titlePageContainer}>Featured Events</div>
      <div className={styles.titlePage}>
        <h2 className={styles.title}>
          FLAVOUR N&apos;BANIA: The <br /> Awakening{" "}
        </h2>
        <p className={styles.titlePageSubtitle}>SEP 25 </p>
      </div> */}

      {/* Featured Events Section */}
      {featuredEvent && (
        <div className={styles.featuredSection}>
          <h2 className={styles.titlePageContainer}>Featured Events</h2>
          <div className={styles.titlePage}>
            <div className={styles.featuredImageContainer}>
              <Image
                src={featuredEvent.image}
                alt={featuredEvent.title}
                className={styles.featuredImage}
                fallbackSrc="/images/placeholder.jpg"
              />
              <div className={styles.featuredOverlay} />
            </div>
            <div className={styles.featuredContent}>
              <h3 className={styles.featuredEventTitle}>
                {featuredEvent.title}
              </h3>
              <p className={styles.featuredEventDate}>SEP 25</p>
              <Button className={styles.getTicketsBtn}>
                Get your tickets now
              </Button>
            </div>
            <div className={styles.paginationDots}>
              <div
                className={styles.dot}
                style={{ backgroundColor: "#f97316" }}
              />
              <div className={styles.dot} />
              <div className={styles.dot} />
              <div className={styles.dot} />
            </div>
          </div>
        </div>
      )}

      {/* Filter Section */}
      <div className={styles.filtersSection}>
        <Group gap="md" justify="center" wrap="wrap">
          <FilterDropdown
            icon={<IconMapPin size={16} color="#6b7280" />}
            label="Enugu Nigeria"
            value={locationFilter}
            onChange={setLocationFilter}
            options={[
              { value: "Enugu Nigeria", label: "Enugu Nigeria" },
              { value: "Lagos Nigeria", label: "Lagos Nigeria" },
              { value: "Abuja Nigeria", label: "Abuja Nigeria" },
            ]}
          />
          <FilterDropdown
            icon={<IconCalendar size={16} color="#6b7280" />}
            label="All dates"
            value={dateFilter}
            onChange={setDateFilter}
            options={[
              { value: "All dates", label: "All dates" },
              { value: "Today", label: "Today" },
              { value: "This week", label: "This week" },
              { value: "This month", label: "This month" },
            ]}
          />
          <FilterDropdown
            icon={<IconTag size={16} color="#6b7280" />}
            label="All Events"
            value={eventTypeFilter}
            onChange={setEventTypeFilter}
            options={[
              { value: "All Events", label: "All Events" },
              { value: "Concert", label: "Concert" },
              { value: "Conference", label: "Conference" },
              { value: "Workshop", label: "Workshop" },
            ]}
          />
          <FilterDropdown
            icon={<IconCurrencyDollar size={16} color="#6b7280" />}
            label="Price"
            value={priceFilter}
            onChange={setPriceFilter}
            options={[
              { value: "Price", label: "Price" },
              { value: "Free", label: "Free" },
              { value: "Paid", label: "Paid" },
            ]}
          />
        </Group>
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <Center style={{ padding: "2rem" }}>
          <Loader />
        </Center>
      ) : error ? (
        <Paper
          p="lg"
          m="lg"
          withBorder
          shadow="xs"
          style={{ textAlign: "center" }}
        >
          <Text color="red">{error}</Text>
          {error.toLowerCase().includes("log in") && (
            <Button component={Link} href="/auth/signin" mt="md">
              Go to Login
            </Button>
          )}
        </Paper>
      ) : filteredEvents.length === 0 ? (
        <Paper
          p="lg"
          m="lg"
          withBorder
          shadow="xs"
          style={{ textAlign: "center" }}
        >
          <Text>
            No events match your filters or you haven&apos;t created/registered
            for any events yet.
          </Text>
        </Paper>
      ) : (
        <div className={styles.eventsGrid}>
          {filteredEvents.map((eventItem) => (
            <div key={eventItem.id} className={styles.eventCardWrapper}>
              <Link
                href={
                  eventItem.ownership === "Created"
                    ? `/dashboard?eventId=${eventItem.id}`
                    : `/eventSchedule/eventDetails/${eventItem.id}`
                }
                className={styles.eventLink}
                onClick={() => {
                  console.log(
                    `Clicking on event "${eventItem.title}" with ownership: ${eventItem.ownership}`
                  );
                  if (eventItem.ownership === "Created") {
                    console.log(
                      `Redirecting to dashboard with eventId: ${eventItem.id}`
                    );
                  } else {
                    console.log(
                      `Redirecting to event details: ${eventItem.id}`
                    );
                  }
                }}
              >
                <EventCardDisplay eventData={eventItem} />
              </Link>
            </div>
          ))}
        </div>
      )}
      <Footer />
    </div>
  );
};

export default ExploreEvents;
