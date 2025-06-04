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
} from "@mantine/core";
import Navbar from "@/components/navbar";
import styles from "./styles.module.css";
import {
  getAuthToken,
  isAuthenticated,
} from "@/app/services/auth"; // Remove authenticatedRequest import

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://keupass-48c2ae65f897.herokuapp.com/api";

interface EventData {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  location: string;
  creator?: { id: number; username: string };
  customization?: {
    banner_url: string;
  };
  description?: string;
  price?: string;
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
  location: string;
  name: string;
  ownership: "Created" | "Registered" | "None";
}

type CategoryFilter = "All" | MappedEvent["category"];
type OwnershipFilter = "All" | "Created" | "Registered";

const ExploreEvents: React.FC = () => {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("All");
  const [ownershipFilter, setOwnershipFilter] =
    useState<OwnershipFilter>("All");
  const [events, setEvents] = useState<MappedEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        // 1) Fetch events publicly (no auth token needed)
        const eventsRes = await fetch(`${API_BASE_URL}/events/`);
        if (!eventsRes.ok) {
          throw new Error(`Failed to fetch events: ${eventsRes.status}`);
        }
        const eventsJson = await eventsRes.json();
        const allEvents: EventData[] = eventsJson.data || []; // adjust if your API returns differently

        // 2) Check if we have a token; if so, fetch /users/me and /attendees/
        const token = getAuthToken(); // returns string|null
        let userId: number | null = null;
        let allAttendees: AttendeeData[] = [];

        if (token) {
          // 2a) Fetch current user
          const userRes = await fetch(`${API_BASE_URL}/users/me/`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (userRes.ok) {
            const userJson: ApiUserResponse = await userRes.json();
            if (userJson.success && userJson.data.id) {
              userId = userJson.data.id;
            }
          }

          // 2b) Fetch attendees (only if user is logged in)
          const attendeeRes = await fetch(`${API_BASE_URL}/attendees/`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (attendeeRes.ok) {
            const attendeeJson = await attendeeRes.json();
            allAttendees = attendeeJson.data || [];
          }
        }

        // If not logged in, userId === null and allAttendees remains empty

        // Build a set of event IDs the user has registered for
        const registeredEventIds = new Set<string>();
        if (userId !== null) {
          allAttendees
            .filter((a) => a.user === userId)
            .forEach((a) => registeredEventIds.add(a.event));
        }

        // Map events into the shape the UI needs
        const mappedEvents: MappedEvent[] = allEvents.map((e) => {
          const bannerImage =
            e.customization?.banner_url || "/images/placeholder.jpg";

          let ownershipStatus: MappedEvent["ownership"] = "None";
          if (userId !== null && e.creator && e.creator.id === userId) {
            ownershipStatus = "Created";
          } else if (userId !== null && registeredEventIds.has(e.id)) {
            ownershipStatus = "Registered";
          }

          return {
            id: e.id,
            title: e.title,
            category: getEventCategory(e.start_date, e.end_date),
            image: bannerImage,
            date: formatDateRange(e.start_date, e.end_date),
            location: e.location,
            name: e.creator?.username || "Unknown Host",
            ownership: ownershipStatus,
          };
        });

        setEvents(mappedEvents);
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
    const categoryMatch =
      categoryFilter === "All" || ev.category === categoryFilter;
    const ownershipMatch =
      ownershipFilter === "All" || ev.ownership === ownershipFilter;
    return categoryMatch && ownershipMatch;
  });

  const FilterBtn: React.FC<{
    label: string;
    active: boolean;
    onClick: () => void;
  }> = ({ label, active, onClick }) => (
    <button
      className={`${styles.avatarButton} ${active ? styles.activeButton : ""}`}
      onClick={onClick}
    >
      {label}
    </button>
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
      <div className={styles.card}>
        <div className={styles.imageContainer}>
          <Image
            src={imageSrc}
            alt={eventData.title}
            className={styles.cardImage}
            onError={handleImageError}
            fallbackSrc="/images/placeholder.jpg"
          />
          <div className={styles.categoryBadge}>
            <span
              className={`${styles.cardSubtitles} ${
                styles[`category${eventData.category}`]
              }`}
            >
              {eventData.category}
            </span>
          </div>
        </div>
        <div className={styles.cardDetails}>
          <h3 className={styles.cardTitle}>{eventData.title}</h3>
          <p className={styles.cardSubtitle}>
            <span className={styles.iconText}>📅</span> {eventData.date}
          </p>
          <p className={styles.cardSubtitle}>
            <span className={styles.iconText}>📍</span> {eventData.location}
          </p>
          <div className={styles.cardFooter}>
            <p className={styles.cardHost}>
              <span className={styles.hostLabel}>Host:</span> {eventData.name}
            </p>
            {eventData.ownership !== "None" && (
              <div className={styles.ownershipBadge}>
                {eventData.ownership}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <Stack className={styles.navStark}>
        <Navbar />
      </Stack>

      <div className={styles.titlePage}>
        <h2 className={styles.title}>Explore Events</h2>
      </div>

      <div className={styles.filterContainer}>
        <div className={styles.filters}>
          {(["All", "Created", "Registered"] as OwnershipFilter[]).map(
            (f) => (
              <FilterBtn
                key={f}
                label={f}
                active={ownershipFilter === f}
                onClick={() => onOwnershipChange(f)}
              />
            )
          )}
        </div>
        <div className={styles.filters}>
          {(["All", "Upcoming", "Ongoing", "Ended"] as CategoryFilter[]).map(
            (f) => (
              <FilterBtn
                key={f}
                label={f}
                active={categoryFilter === f}
                onClick={() => setCategoryFilter(f)}
              />
            )
          )}
        </div>
      </div>

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
            No events match your filters or you haven't created/registered for
            any events yet.
          </Text>
        </Paper>
      ) : (
        <div className={styles.cardsGrid}>
          {filteredEvents.map((eventItem) => (
            <div key={eventItem.id} className={styles.cardWrapper}>
              <Link
                href={
                  eventItem.ownership === "Created"
                    ? `/dashboard?eventId=${eventItem.id}`
                    : `/eventSchedule/eventDetails/${eventItem.id}`
                }
                className={styles.eventLink}
              >
                <EventCardDisplay eventData={eventItem} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExploreEvents;
