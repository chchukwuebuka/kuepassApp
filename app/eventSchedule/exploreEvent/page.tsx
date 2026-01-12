"use client";

import { useState, useEffect, useMemo, memo } from "react";
import Link from "next/link";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
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
import Footer from "@/components/Footer";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.kuepass.com/api/"
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
    banner_url: string | string[];
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
  banner_url?: string[]; // Array of banner URLs for carousel
  date: string;
  start_date: string; // Raw start date from backend for formatting
  address: string;
  name: string;
  ownership: "Created" | "Registered" | "None";
  price?: string;
}

type CategoryFilter = "All" | MappedEvent["category"];
type OwnershipFilter = "All" | "Created" | "Registered";

// Move EventCardDisplay outside component and memoize it for better performance
const EventCardDisplay: React.FC<{ eventData: MappedEvent }> = memo(
  ({ eventData }) => {
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
            loading="lazy"
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
                style={{ width: "30px", height: "30px", objectFit: "contain" }}
                loading="lazy"
              />
              <span>{eventData.address}</span>
            </div>
            <div className={styles.eventDetail}>
              <Image
                src="/images/Edate.png"
                alt="Date"
                width="30"
                height="30"
                style={{ width: "30px", height: "30px", objectFit: "contain" }}
                loading="lazy"
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
  }
);

EventCardDisplay.displayName = "EventCardDisplay";

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
  const [isLoading, setIsLoading] = useState(false);
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

  const formatShortDate = (dateString: string): string => {
    if (!dateString) return "TBD";

    try {
      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn("Invalid date string:", dateString);
        return "TBD";
      }

      // Use Intl.DateTimeFormat for better control over formatting
      const monthFormatter = new Intl.DateTimeFormat("en-US", {
        month: "short",
      });
      const month = monthFormatter.format(date).toUpperCase();
      const day = date.getDate();

      return `${month} ${day}`;
    } catch (error) {
      console.warn("Error formatting date:", dateString, error);
      return "TBD";
    }
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
        // Fetch all data in parallel from the start for maximum performance
        const token = getAuthToken();

        // Prepare fetch requests
        const fetchPromises: Promise<any>[] = [
          // Always fetch events
          fetch(`${API_BASE_URL}/events/`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          })
            .then(async (res) => {
              if (!res.ok) {
                if (res.status === 502 || res.status === 503) {
                  throw new Error(
                    "Server is temporarily unavailable. Please try again later."
                  );
                }
                throw new Error(`Failed to fetch events: ${res.status}`);
              }
              return res.json();
            })
            .catch((err) => {
              if (
                err.message.includes("Failed to fetch") ||
                err.message.includes("NetworkError")
              ) {
                throw new Error(
                  "Unable to connect to the server. Please check your internet connection and try again."
                );
              }
              throw err;
            }),
        ];

        // Conditionally add authenticated requests
        if (token) {
          fetchPromises.push(
            fetch(`${API_BASE_URL}/users/me/`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
              },
            })
              .then((res) => (res.ok ? res.json() : null))
              .catch(() => null), // Silently fail for user data
            fetch(`${API_BASE_URL}/attendees/`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
              },
            })
              .then((res) => (res.ok ? res.json() : null))
              .catch(() => null) // Silently fail for attendee data
          );
        } else {
          // Add nulls to maintain array structure
          fetchPromises.push(Promise.resolve(null), Promise.resolve(null));
        }

        // Fetch all data in parallel
        const [eventsJson, userJson, attendeeJson] = await Promise.all(
          fetchPromises
        );

        // Process events response (fast path - show events immediately)
        let rawEvents: any[] = [];
        if (Array.isArray(eventsJson)) {
          rawEvents = eventsJson;
        } else if (Array.isArray(eventsJson?.data)) {
          rawEvents = eventsJson.data;
        } else if (Array.isArray(eventsJson?.results)) {
          rawEvents = eventsJson.results;
        }

        // Filter and map events efficiently
        const allEvents: EventData[] = rawEvents
          .filter((e: any) => {
            // Only include events that are active (or is_active is undefined/null, which we treat as active)
            const isActive = e.is_active !== false;
            const hasRequiredFields = e.id != null && e.title;
            return isActive && hasRequiredFields;
          })
          .map((e: any) => ({
            id: String(e.id),
            title: e.title,
            start_date: e.start_date,
            end_date: e.end_date,
            address: e.address,
            location: e.location,
            creator: e.creator,
            customization: e.customization,
            description: e.description,
            price: e.price,
            collaborators: e.collaborators,
          }));

        // Process user data
        let userId: number | null = null;
        let userEmail: string | null = null;

        if (userJson?.success && userJson.data?.id) {
          userId = userJson.data.id;
          userEmail = userJson.data.email;
        } else if (userJson && (!userJson.success || !userJson.data)) {
          // If authentication fails, clear the token
          if (token) {
            localStorage.removeItem("auth_token");
          }
        }

        // Process attendees response
        let allAttendees: AttendeeData[] = [];
        if (attendeeJson) {
          if (Array.isArray(attendeeJson)) {
            allAttendees = attendeeJson;
          } else if (
            attendeeJson?.results &&
            Array.isArray(attendeeJson.results)
          ) {
            allAttendees = attendeeJson.results;
          } else if (attendeeJson?.data && Array.isArray(attendeeJson.data)) {
            allAttendees = attendeeJson.data;
          }
        }

        // Build a set of event IDs the user has registered for
        const registeredEventIds = new Set<string>();
        if (userId !== null) {
          allAttendees
            .filter((a) => a.user === userId)
            .forEach((a) => registeredEventIds.add(a.event));
        }

        // Map events into the shape the UI needs with ownership (single pass)
        const mappedEvents: MappedEvent[] = allEvents.map((e) => {
          // Handle banner_url as either array or string
          let bannerImage: string = "/images/placeholder.jpg";
          let bannerUrls: string[] = [];
          const bannerUrl = e.customization?.banner_url;
          if (bannerUrl) {
            if (Array.isArray(bannerUrl) && bannerUrl.length > 0) {
              // Filter and store all valid HTTP/HTTPS URLs
              bannerUrls = bannerUrl.filter(
                (url: any) =>
                  typeof url === "string" &&
                  url.trim() !== "" &&
                  (url.startsWith("http://") || url.startsWith("https://"))
              ) as string[];
              // Use the first valid URL as the main image
              if (bannerUrls.length > 0) {
                bannerImage = bannerUrls[0];
              }
            } else if (
              typeof bannerUrl === "string" &&
              bannerUrl.trim() !== ""
            ) {
              // If it's a string, use it directly
              bannerImage = bannerUrl;
              bannerUrls = [bannerUrl];
            }
          }

          let ownershipStatus: MappedEvent["ownership"] = "None";

          // Check if user is the creator
          if (userId !== null && e.creator && e.creator.id === userId) {
            ownershipStatus = "Created";
          }
          // Check if user is a collaborator (by email)
          else if (
            userEmail &&
            e.collaborators &&
            e.collaborators.some((collab) => collab.email === userEmail)
          ) {
            ownershipStatus = "Created";
          }
          // Check if user is registered for the event
          else if (userId !== null && registeredEventIds.has(e.id)) {
            ownershipStatus = "Registered";
          }

          return {
            id: e.id,
            title: e.title,
            category: getEventCategory(e.start_date, e.end_date),
            image: bannerImage,
            banner_url: bannerUrls.length > 0 ? bannerUrls : undefined,
            date: formatDateRange(e.start_date, e.end_date),
            start_date: e.start_date || "",
            address: e.address || e.location || "Location not specified",
            name: e.creator?.username || "Unknown Host",
            ownership: ownershipStatus,
            price: e.price || "Free",
          };
        });

        // Set events once (no double rendering)
        setEvents(mappedEvents);

        // Set featured event: prioritize upcoming, then ongoing, then first event
        const upcomingEvent = mappedEvents.find(
          (e) => e.category === "Upcoming"
        );
        if (upcomingEvent) {
          setFeaturedEvent(upcomingEvent);
        } else {
          // If no upcoming events, try to find an ongoing event
          const ongoingEvent = mappedEvents.find(
            (e) => e.category === "Ongoing"
          );
          if (ongoingEvent) {
            setFeaturedEvent(ongoingEvent);
          } else if (mappedEvents.length > 0) {
            // Fallback to first event if no upcoming or ongoing events
            setFeaturedEvent(mappedEvents[0]);
          } else {
            // No events at all
            setFeaturedEvent(null);
          }
        }
      } catch (err: any) {
        console.error("Error loading events:", err);
        setError(
          err.message || "Failed to load events. Please try again later."
        );
        setEvents([]);
        setFeaturedEvent(null); // Clear featured event on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllEventsAndUserData();
  }, []);

  const filteredEvents = useMemo(() => {
    const filtered = events.filter((ev) => {
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

    // Debug: Check if event 513 is in filtered results
    const event513Filtered = filtered.find((e) => e.id === "513");
    if (event513Filtered) {
      console.log("Event 513 is in filteredEvents:", event513Filtered);
    } else {
      const event513InEvents = events.find((e) => e.id === "513");
      if (event513InEvents) {
        console.log(
          "Event 513 is in events but filtered out. Event:",
          event513InEvents
        );
        console.log(
          "Filters - searchQuery:",
          searchQuery,
          "categoryFilter:",
          categoryFilter,
          "ownershipFilter:",
          ownershipFilter
        );
      }
    }

    return filtered;
  }, [events, searchQuery, categoryFilter, ownershipFilter]);

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

  return (
    <div className={styles.pageContainer}>
      <Stack className={styles.navStack}>
        <Navbar alwaysDark />
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
              {featuredEvent.banner_url &&
              featuredEvent.banner_url.length > 1 ? (
                <Slider
                  autoplay
                  autoplaySpeed={3000}
                  infinite
                  speed={500}
                  slidesToShow={1}
                  slidesToScroll={1}
                  dots
                  arrows={false}
                  className={styles.featuredCarousel}
                >
                  {featuredEvent.banner_url.map((url, index) => (
                    <div key={index} className={styles.carouselSlide}>
                      <Image
                        src={url}
                        alt={`${featuredEvent.title} - Banner ${index + 1}`}
                        className={styles.featuredImage}
                        fallbackSrc="/images/placeholder.jpg"
                      />
                    </div>
                  ))}
                </Slider>
              ) : (
                <Image
                  src={featuredEvent.image}
                  alt={featuredEvent.title}
                  className={styles.featuredImage}
                  fallbackSrc="/images/placeholder.jpg"
                />
              )}
              <div className={styles.featuredOverlay} />
            </div>
            <div className={styles.featuredContent}>
              <h3 className={styles.featuredEventTitle}>
                {featuredEvent.title}
              </h3>
              <p className={styles.featuredEventDate}>
                {featuredEvent.date || "TBD"}
              </p>
              <Button
                component={Link}
                href={`/eventSchedule/eventDetails/${featuredEvent.id}`}
                className={styles.getTicketsBtn}
              >
                Get your tickets now
              </Button>
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
