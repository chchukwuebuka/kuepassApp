"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Image, Stack } from "@mantine/core";
import Navbar from "@/components/navbar";
import styles from "./styles.module.css";
import { authenticatedRequest } from "@/app/services/auth";
import ProtectedRoute from "@/app/components/ProtectedRoute";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://keupass-48c2ae65f897.herokuapp.com/api";

interface EventData {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  location: string;
  is_active?: boolean;
  creator?: { id: number; username: string };
  customization?: {
    id: string;
    banner_url: string;
    font: string;
    card_color: string;
    event: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
  merchandise?: Array<{
    id: string;
    name: string;
    description: string;
    price: string;
    event: string;
    created_at: string;
    updated_at: string;
  }>;
  countdowns?: Array<{
    id: string;
    title: string;
    event: string;
    countdown_date: string;
    created_at: string;
    updated_at: string;
  }>;
}

interface AttendeeData {
  id: string;
  event: string;
  user: number;
  email: string;
  name: string;
  registration_date: string;
  responses?: Array<{ [key: string]: any }>;
}

interface UserData {
  success: boolean;
  message: string;
  data: {
    id: number;
    username: string;
    email: string;
    banner_url?: string;
    profile_url?: string;
    country: string;
    currency: string;
    language: string;
    active: boolean;
    phone_number: string | null;
  };
}

interface Event {
  id: string;
  title: string;
  category: "Upcoming" | "Ongoing" | "Ended";
  image: string;
  date: string;
  location: string;
  name: string;
  ownership: "Created" | "Registered" | "None";
}

type CategoryFilter = "All" | Event["category"];
type OwnershipFilter = "All" | "Created" | "Registered";

function unwrap<T>(resp: { data: T } | T): T {
  return (resp as any).data ?? (resp as any);
}

const ExploreEvents: React.FC = () => {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("All");
  const [ownershipFilter, setOwnershipFilter] =
    useState<OwnershipFilter>("All");
  const [events, setEvents] = useState<Event[]>([]);
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

  const getEventCategory = (start: string, end: string): Event["category"] => {
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
    const fetchAll = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to view events.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const [evResp, atResp, uResp] = await Promise.all([
          authenticatedRequest<{ data: EventData[] }>(
            `${API_BASE_URL}/events/`,
            "GET"
          ),
          authenticatedRequest<AttendeeData[]>(
            `${API_BASE_URL}/attendees/`,
            "GET"
          ),
          authenticatedRequest<UserData>(`${API_BASE_URL}/users/me/`, "GET"),
        ]);

        const allEvents = unwrap(evResp) as EventData[];
        const allAttendees = unwrap(atResp) as AttendeeData[];
        const userId = uResp.data.id;
        const myRegs = allAttendees.filter((a) => a.user === userId);
        const regIds = new Set(myRegs.map((a) => a.event));

        const mapped: Event[] = allEvents.map((e) => {
          const img = e.customization?.banner_url || "/images/placeholder.jpg";
          const owner =
            e.creator && String(e.creator.id) === String(userId)
              ? "Created"
              : regIds.has(e.id)
              ? "Registered"
              : "None";
          return {
            id: e.id,
            title: e.title,
            category: getEventCategory(e.start_date, e.end_date),
            image: img,
            date: formatDateRange(e.start_date, e.end_date),
            location: e.location,
            name: e.creator?.username || "Unknown Host",
            ownership: owner,
          };
        });

        setEvents(mapped);
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err.message || "Failed to fetch events. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
  }, []);

  const filtered = events.filter((ev) => {
    const okCat = categoryFilter === "All" || ev.category === categoryFilter;
    const okOwn = ownershipFilter === "All" || ev.ownership === ownershipFilter;
    return okCat && okOwn;
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

  const EventCard: React.FC<{ e: Event }> = ({ e }) => {
    const [src, setSrc] = useState(e.image);
    const onError = () => setSrc("/images/placeholder.jpg");

    return (
      <div className={styles.card}>
        <div className={styles.imageContainer}>
          <Image
            src={src}
            alt={e.title}
            className={styles.cardImage}
            onError={onError}
            fallbackSrc="/images/placeholder.jpg"
          />
          <div className={styles.categoryBadge}>
            <span
              className={`${styles.cardSubtitles} ${
                styles[`category${e.category}`]
              }`}
            >
              {e.category}
            </span>
          </div>
        </div>
        <div className={styles.cardDetails}>
          <h3 className={styles.cardTitle}>{e.title}</h3>
          <p className={styles.cardSubtitle}>
            <span className={styles.iconText}>📅</span> {e.date}
          </p>
          <p className={styles.cardSubtitle}>
            <span className={styles.iconText}>📍</span> {e.location}
          </p>
          <div className={styles.cardFooter}>
            <p className={styles.cardHost}>
              <span className={styles.hostLabel}>Host:</span> {e.name}
            </p>
            {e.ownership !== "None" && (
              <div className={styles.ownershipBadge}>{e.ownership}</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <ProtectedRoute>
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
          <div className={styles.noEvents}>
            <p>Loading events…</p>
          </div>
        ) : error ? (
          <div className={styles.noEvents}>
            <p>{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.noEvents}>
            <p>No events match your filters.</p>
          </div>
        ) : (
          <div className={styles.cardsGrid}>
            {filtered.map((e) => (
              <div key={e.id} className={styles.cardWrapper}>
                <Link
                  href={
                    e.ownership === "Created"
                      ? `/dashboard?eventId=${e.id}`
                      : e.ownership === "Registered"
                      ? `/eventSchedule/eventDetails/${e.id}`
                      : `/eventSchedule/events/${e.id}`
                  }
                  className={styles.eventLink}
                >
                  <EventCard e={e} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default ExploreEvents;
