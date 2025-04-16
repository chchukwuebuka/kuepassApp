"use client";
import { useState } from "react";
import Link from "next/link";
import { Image, Stack } from "@mantine/core";
import Navbar from "@/components/navbar";
import styles from "./styles.module.css";

interface Event {
  id: number;
  title: string;
  category: "Past" | "Upcoming" | "Ongoing" | "Ended";
  image: string;
  date: string;
  location: string;
  name: string;
  ownership: "Registered" | "Created";
}

// Sample events data with the new `ownership` property.
const eventsData: Event[] = [
  {
    id: 1,
    title: "Cinco de Mayo Event",
    category: "Ongoing",
    image: "/images/cinco.png",
    date: "Feb 5 - Feb 10, 2025",
    name: "Cinco de Mayo Event",
    location: "Abuja, Nigeria",
    ownership: "Registered",
  },
  {
    id: 2,
    title: "Osi-Ite Cooking Competition",
    category: "Upcoming",
    image: "/images/osiite.png",
    date: "Feb 10, 2025",
    name: "Osi-ite",
    location: "Lagos, Nigeria",
    ownership: "Created",
  },
  {
    id: 3,
    title: "Cinco de Mayo Event",
    category: "Ongoing",
    image: "/images/cinco.png",
    date: "Feb 5 - Feb 10, 2025",
    name: "Cinco de Mayo Event",
    location: "Abuja, Nigeria",
    ownership: "Registered",
  },
  {
    id: 4,
    title: "Speak Like a Pro",
    category: "Ended",
    image: "/images/speak.png",
    date: "Jan 20, 2025",
    name: "Speak Like a Pro",
    location: "Online",
    ownership: "Registered",
  },
  {
    id: 5,
    title: "Speak Like a Pro",
    category: "Ended",
    image: "/images/speak.png",
    date: "Jan 20, 2025",
    name: "Speak Like a Pro",
    location: "Online",
    ownership: "Registered",
  },
  {
    id: 6,
    title: "Osi-Ite Cooking Competition",
    category: "Upcoming",
    image: "/images/osiite.png",
    date: "Feb 10, 2025",
    name: "Osi-ite",
    location: "Lagos, Nigeria",
    ownership: "Created",
  },
];

// Define filter type for better type safety
type CategoryFilter = "All" | Event["category"];
type OwnershipFilter = "All" | "Registered" | "Created";

const ExploreEvents = () => {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("All");
  const [ownershipFilter, setOwnershipFilter] =
    useState<OwnershipFilter>("All");

  // Combine filters: both category and ownership must match
  const filteredEvents = eventsData.filter((event) => {
    const categoryMatches =
      categoryFilter === "All" || event.category === categoryFilter;
    const ownershipMatches =
      ownershipFilter === "All" || event.ownership === ownershipFilter;
    return categoryMatches && ownershipMatches;
  });

  // Category style mapping for cleaner code
  const getCategoryStyle = (category: Event["category"]) => {
    const categoryMap = {
      Ongoing: styles.categoryOngoing,
      Upcoming: styles.categoryUpcoming,
      Ended: styles.categoryEnded,
      Past: "", // Fallback for Past category
    };
    return categoryMap[category] || "";
  };

  // Filter button component for DRY code
  const FilterButton = ({
    label,
    isActive,
    onClick,
  }: {
    label: string;
    isActive: boolean;
    onClick: () => void;
  }) => (
    <button
      className={`${styles.avatarButton} ${
        isActive ? styles.activeButton : ""
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );

  // Event card component for DRY code
  const EventCard = ({ event }: { event: Event }) => (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <Image
          src={event.image}
          alt={event.title}
          className={styles.cardImage}
        />
        <div className={styles.categoryBadge}>
          <span
            className={`${styles.cardSubtitles} ${getCategoryStyle(
              event.category
            )}`}
          >
            {event.category}
          </span>
        </div>
      </div>
      <div className={styles.cardDetails}>
        <h3 className={styles.cardTitle}>{event.title}</h3>
        <p className={styles.cardSubtitle}>
          <span className={styles.iconText}>📅</span> {event.date}
        </p>
        <p className={styles.cardSubtitle}>
          <span className={styles.iconText}>📍</span> {event.location}
        </p>
        <div className={styles.cardFooter}>
          <p className={styles.cardHost}>
            <span className={styles.hostLabel}>Host:</span> {event.name}
          </p>
          <div className={styles.ownershipBadge}>{event.ownership}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <Stack className={styles.navStark}>
        <Navbar />
      </Stack>

      <div className={styles.titlePage}>
        <h2 className={styles.title}>Explore Events</h2>
      </div>

      <div className={styles.filterContainer}>
        {/* Ownership Filters */}
        <div className={styles.filters}>
          {["All", "Registered", "Created"].map((own) => (
            <FilterButton
              key={own}
              label={own}
              isActive={ownershipFilter === own}
              onClick={() => setOwnershipFilter(own as OwnershipFilter)}
            />
          ))}
        </div>

        {/* Category Filters */}
        <div className={styles.filters}>
          {["All", "Upcoming", "Ongoing", "Ended"].map((cat) => (
            <FilterButton
              key={cat}
              label={cat}
              isActive={categoryFilter === cat}
              onClick={() => setCategoryFilter(cat as CategoryFilter)}
            />
          ))}
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className={styles.noEvents}>
          <p>No events match your current filters.</p>
        </div>
      ) : (
        <div className={styles.cardsGrid}>
          {filteredEvents.map((event) => (
            <div key={event.id} className={styles.cardWrapper}>
              {event.ownership === "Created" ? (
                <Link href="/dashboard" className={styles.eventLink}>
                  <EventCard event={event} />
                </Link>
              ) : (
                <Link href={`/event/${event.id}`} className={styles.eventLink}>
                  <EventCard event={event} />
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExploreEvents;
