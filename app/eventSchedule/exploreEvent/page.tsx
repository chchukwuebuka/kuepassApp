"use client";

import { useState, useEffect, useMemo, memo, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  IconSparkles,
  IconX,
} from "@tabler/icons-react";
import Navbar from "@/components/navbar";
import styles from "./styles.module.css";
import { getAuthToken, isAuthenticated, authenticatedRequest } from "@/app/services/auth";
import Footer from "@/components/Footer";
import TextReveal from "@/components/TextReveal";

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
  event_type?: string;
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
  event_type?: string;
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
          <div style={{ borderBottom: "1px solid #E6E6E6", marginBottom: "0.75rem", paddingBottom: "0.5rem" }}>
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
          <div className={`${styles.eventType} ${
            !eventData.price || eventData.price === "Free" || parseFloat(eventData.price) === 0
              ? styles.eventTypeFree
              : styles.eventTypePaid
          }`}>
            {!eventData.price || eventData.price === "Free" || parseFloat(eventData.price) === 0
              ? "FREE"
              : "PAID"}
          </div>
        </div>
      </div>
    );
  }
);

EventCardDisplay.displayName = "EventCardDisplay";

const ExploreEvents: React.FC = () => {
  const searchParams = useSearchParams();
  const ownershipParam = searchParams.get("ownership");
  const initialOwnership: OwnershipFilter =
    ownershipParam === "Created" || ownershipParam === "Registered"
      ? ownershipParam
      : "All";

  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("All Locations");
  const [dateFilter, setDateFilter] = useState("All dates");
  const [eventTypeFilter, setEventTypeFilter] = useState("All Events");
  const [priceFilter, setPriceFilter] = useState("All Prices");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("All");
  const [ownershipFilter, setOwnershipFilter] =
    useState<OwnershipFilter>(initialOwnership);
  const [events, setEvents] = useState<MappedEvent[]>([]);
  const [featuredEvent, setFeaturedEvent] = useState<MappedEvent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiSearchActive, setAiSearchActive] = useState(false);
  const [aiSearchLoading, setAiSearchLoading] = useState(false);
  const [aiSearchSummary, setAiSearchSummary] = useState<string | null>(null);
  const [aiSearchResults, setAiSearchResults] = useState<MappedEvent[] | null>(null);

  const handleAISearch = useCallback(async () => {
    if (!searchQuery.trim() || searchQuery.trim().length < 3) return;
    setAiSearchLoading(true);
    setAiSearchSummary(null);
    setAiSearchResults(null);
    try {
      const res = await fetch(`${API_BASE_URL}/ai/search-events/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ query: searchQuery.trim() }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.events)) {
        // Map AI results into MappedEvent shape
        const mapped: MappedEvent[] = data.events.map((e: any) => {
          let bannerImage = "/images/placeholder.jpg";
          const bannerUrl = e.customization?.banner_url;
          if (bannerUrl) {
            if (Array.isArray(bannerUrl) && bannerUrl.length > 0) {
              const first = bannerUrl.find((u: string) => u?.startsWith("http"));
              if (first) bannerImage = first;
            } else if (typeof bannerUrl === "string" && bannerUrl.startsWith("http")) {
              bannerImage = bannerUrl;
            }
          }
          const formatDate = (start: string, end: string) => {
            const s = new Date(start), ee = new Date(end);
            const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
            return s.toDateString() === ee.toDateString()
              ? s.toLocaleDateString("en-US", opts)
              : `${s.toLocaleDateString("en-US", opts)} - ${ee.toLocaleDateString("en-US", opts)}`;
          };
          const now = new Date(), s = new Date(e.start_date), en = new Date(e.end_date);
          const category: MappedEvent["category"] = now < s ? "Upcoming" : now <= en ? "Ongoing" : "Ended";
          return {
            id: String(e.id),
            title: e.title,
            category,
            image: bannerImage,
            date: formatDate(e.start_date, e.end_date),
            start_date: e.start_date || "",
            address: e.address || e.location || "Location not specified",
            name: e.creator?.username || "Unknown Host",
            ownership: "None" as const,
            price: "Free",
            event_type: e.event_type || "",
          };
        });
        setAiSearchResults(mapped);
        setAiSearchSummary(data.summary || `Found ${mapped.length} results`);
        setAiSearchActive(true);
      } else {
        setAiSearchSummary(data.error || "No results found.");
        setAiSearchResults([]);
        setAiSearchActive(true);
      }
    } catch (err) {
      console.error("AI search error:", err);
      setAiSearchSummary("AI search failed. Please try again.");
      setAiSearchResults([]);
      setAiSearchActive(true);
    } finally {
      setAiSearchLoading(false);
    }
  }, [searchQuery]);

  const clearAISearch = useCallback(() => {
    setAiSearchActive(false);
    setAiSearchResults(null);
    setAiSearchSummary(null);
  }, []);

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
        // Fetch all data in parallel using authenticatedRequest (same as EventSection)
        const token = getAuthToken();

        // Use authenticatedRequest for events & tickets (same approach as EventSection)
        // This properly sends cookies, CSRF tokens, and Bearer auth
        const [eventsJson, ticketsJson, userJson, attendeeJson] = await Promise.all([
          // Fetch events
          authenticatedRequest<any>(
            `${API_BASE_URL}/events/?is_active=true&ordering=start_date`,
            "GET"
          ).catch((err: any) => {
            if (
              err.message?.includes("Failed to fetch") ||
              err.message?.includes("NetworkError") ||
              err.message?.includes("Network error")
            ) {
              throw new Error(
                "Unable to connect to the server. Please check your internet connection and try again."
              );
            }
            throw err;
          }),
          // Fetch tickets
          authenticatedRequest<any>(
            `${API_BASE_URL}/tickets/`,
            "GET"
          ).catch(() => []),
          // Fetch user data
          token
            ? authenticatedRequest<any>(
                `${API_BASE_URL}/users/me/`,
                "GET"
              ).catch(() => null)
            : Promise.resolve(null),
          // Fetch attendees
          token
            ? authenticatedRequest<any>(
                `${API_BASE_URL}/attendees/`,
                "GET"
              ).catch(() => null)
            : Promise.resolve(null),
        ]);

        // Process events response (same parsing as EventSection)
        let rawEvents: any[] = [];
        if (Array.isArray(eventsJson)) {
          rawEvents = eventsJson;
        } else if (eventsJson?.success && Array.isArray(eventsJson.data)) {
          rawEvents = eventsJson.data;
        } else if (eventsJson?.data && Array.isArray(eventsJson.data)) {
          rawEvents = eventsJson.data;
        } else if (Array.isArray(eventsJson?.results)) {
          rawEvents = eventsJson.results;
        } else {
          console.warn("ExploreEvents: Unexpected events response format", eventsJson);
        }

        // Filter and map events efficiently
        const allEvents: EventData[] = rawEvents
          .filter((e: any) => {
            const hasRequiredFields = e.id != null && e.title;
            return hasRequiredFields;
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
            event_type: e.event_type,
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

        // Build a map of eventId -> hasPaidTickets (same approach as EventSection)
        const ticketsList = Array.isArray(ticketsJson)
          ? ticketsJson
          : Array.isArray(ticketsJson?.data)
          ? ticketsJson.data
          : Array.isArray(ticketsJson?.results)
          ? ticketsJson.results
          : [];

        const paidEventsMap = new Map<string, boolean>();
        ticketsList.forEach((ticket: any) => {
          const eventId = String(ticket.event);
          const ticketPrice = parseFloat(ticket.category_price || ticket.price || "0");
          const categoryName = (ticket.category_name || "").toLowerCase();
          if (ticketPrice > 0 || categoryName === "paid") {
            paidEventsMap.set(eventId, true);
          }
        });

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
            price: paidEventsMap.get(e.id) ? "Paid" : "Free",
            event_type: e.event_type || "",
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

  // Build dynamic filter options from events data
  const locationOptions = useMemo(() => {
    const uniqueLocations = new Set<string>();
    events.forEach((ev) => {
      if (ev.address && ev.address !== "Location not specified") {
        uniqueLocations.add(ev.address);
      }
    });
    return [
      { value: "All Locations", label: "All Locations" },
      ...Array.from(uniqueLocations).map((loc) => ({ value: loc, label: loc })),
    ];
  }, [events]);

  const eventTypeOptions = useMemo(() => {
    const uniqueTypes = new Set<string>();
    events.forEach((ev) => {
      if (ev.event_type && ev.event_type.trim()) {
        uniqueTypes.add(ev.event_type);
      }
    });
    return [
      { value: "All Events", label: "All Events" },
      ...Array.from(uniqueTypes).map((t) => ({ value: t, label: t })),
    ];
  }, [events]);

  const filteredEvents = useMemo(() => {
    const now = new Date();
    const filtered = events.filter((ev) => {
      // Search
      const searchMatch =
        ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.address.toLowerCase().includes(searchQuery.toLowerCase());

      // Category (Upcoming/Ongoing/Ended)
      const categoryMatch =
        categoryFilter === "All" || ev.category === categoryFilter;

      // Ownership
      const ownershipMatch =
        ownershipFilter === "All" || ev.ownership === ownershipFilter;

      // Location (contains match for flexibility)
      const locationMatch =
        locationFilter === "All Locations" ||
        ev.address.toLowerCase().includes(locationFilter.toLowerCase());

      // Date
      let dateMatch = true;
      if (dateFilter !== "All dates" && ev.start_date) {
        const eventDate = new Date(ev.start_date);
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (dateFilter === "Today") {
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          dateMatch = eventDate >= today && eventDate < tomorrow;
        } else if (dateFilter === "This week") {
          const endOfWeek = new Date(today);
          endOfWeek.setDate(endOfWeek.getDate() + (7 - today.getDay()));
          dateMatch = eventDate >= today && eventDate <= endOfWeek;
        } else if (dateFilter === "This month") {
          const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          dateMatch = eventDate >= today && eventDate <= endOfMonth;
        }
      }

      // Event Type
      const eventTypeMatch =
        eventTypeFilter === "All Events" || ev.event_type === eventTypeFilter;

      // Price
      const priceMatch =
        priceFilter === "All Prices" ||
        (priceFilter === "Free" && ev.price === "Free") ||
        (priceFilter === "Paid" && ev.price === "Paid");

      return searchMatch && categoryMatch && ownershipMatch && locationMatch && dateMatch && eventTypeMatch && priceMatch;
    });

    return filtered;
  }, [events, searchQuery, categoryFilter, ownershipFilter, locationFilter, dateFilter, eventTypeFilter, priceFilter]);

  const FilterDropdown: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    searchable?: boolean;
  }> = ({ icon, label, value, onChange, options, searchable = false }) => (
    <Select
      leftSection={icon}
      rightSection={<IconChevronDown size={16} />}
      placeholder={label}
      value={value}
      onChange={(val) => onChange(val || "")}
      data={options}
      searchable={searchable}
      clearable={value !== options[0]?.value}
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
        <div className={styles.searchBarWrapper} style={{ maxWidth: "800px", width: "100%" }}>
          <TextInput
            leftSection={<IconSearch size={20} color="#F5B645" />}
            placeholder="Try: 'free concerts this weekend in Enugu'"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (aiSearchActive) clearAISearch();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchQuery.trim().length >= 3) handleAISearch();
            }}
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
          <ActionIcon
            className={styles.aiSearchBtn}
            size={40}
            radius="xl"
            loading={aiSearchLoading}
            onClick={handleAISearch}
            disabled={searchQuery.trim().length < 3}
            title="AI Search"
          >
            <IconSparkles size={20} />
          </ActionIcon>
        </div>
        {aiSearchActive && aiSearchSummary && (
          <div className={styles.aiSummaryBanner}>
            <IconSparkles size={16} color="#F5B645" />
            <Text size="sm" style={{ flex: 1 }}>{aiSearchSummary}</Text>
            <ActionIcon size="sm" variant="subtle" onClick={clearAISearch}>
              <IconX size={14} />
            </ActionIcon>
          </div>
        )}
      </div>
      {/* Featured Events Section */}
      {featuredEvent && (
        <div className={styles.featuredSection}>
          <Group justify="space-between" align="center" mb="sm">
            <TextReveal colorFinal="#151515">
              <h2 className={styles.titlePageContainer} style={{ margin: 0 }}>Featured Events</h2>
            </TextReveal>
            <Button
              component={Link}
              href="/dashboard?mode=createEvent"
              bg="#f5b645"
              c="#151515"
              radius="xl"
              fw={700}
              size="md"
              style={{ transition: "all 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
              Create Event
            </Button>
          </Group>
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
        <Group className={styles.filtersGroup} gap="md" justify="center" wrap="wrap">
          <FilterDropdown
            icon={<IconMapPin size={16} color="#6b7280" />}
            label="All Locations"
            value={locationFilter}
            onChange={setLocationFilter}
            options={locationOptions}
            searchable
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
            options={eventTypeOptions}
          />
          <FilterDropdown
            icon={<IconCurrencyDollar size={16} color="#6b7280" />}
            label="All Prices"
            value={priceFilter}
            onChange={setPriceFilter}
            options={[
              { value: "All Prices", label: "All Prices" },
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
      ) : (() => {
        const displayEvents = aiSearchActive && aiSearchResults ? aiSearchResults : filteredEvents;
        return displayEvents.length === 0 ? (
          <Paper
            p="lg"
            m="lg"
            withBorder
            shadow="xs"
            style={{ textAlign: "center" }}
          >
            <Text>
              {aiSearchActive
                ? "No events match your AI search. Try a different query."
                : "No events match your filters or you haven\u0027t created/registered for any events yet."}
            </Text>
          </Paper>
        ) : (
          <div className={styles.eventsGrid}>
            {displayEvents.map((eventItem) => (
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
        );
      })()}
      <Footer />
    </div>
  );
};

export default ExploreEvents;
