"use client";
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  Stack,
  Flex,
  Text,
  Container,
  Button as MantineButton,
  Loader,
  Center,
} from "@mantine/core";
import { FaArrowRight } from "react-icons/fa";
import Link from "next/link";
import EventCard, { EventCardProps } from "./cardsPromps";
import { authenticatedRequest } from "@/app/services/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://keupass-48c2ae65f897.herokuapp.com/api";

interface FetchedEventData {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  location: string;
  address: string;
  customization?: { banner_url?: string };
  creator?: { username?: string };
}

const staticPlaceholderEvents: EventCardProps[] = [
  {
    eventId: "static-event-1",
    image: "/images/osite.png",
    title: "Osi-ite Cooking Competition",
    date: "Dec 10, 2023",
    time: "10:00 AM",
    organizer: "Crisp Tv Media",
    location: "Enugu, Nigeria",
    address: "123 Main Street, Enugu, Nigeria",
  },
  {
    eventId: "static-event-2",
    image: "/images/speak.png",
    title: "Cico de mayo Event",
    date: "Nov 05, 2023",
    time: "10:00 AM",
    organizer: "Crisp Tv Media",
    location: "Enugu, Nigeria",
    address: "456 Event Avenue, Enugu, Nigeria",
  },
  {
    eventId: "static-event-3",
    image: "/images/cinco.png",
    title: "Speak Like a Pro",
    date: "Nov 05, 2023",
    time: "10:00 AM",
    organizer: "Crisp Tv Media",
    location: "Enugu, Nigeria",
    address: "789 Conference Road, Enugu, Nigeria",
  },
];

interface EventSectionProps {
  id?: string;
  title?: string;
  initialDisplayLimit?: number;
}

export const EventSection: React.FC<EventSectionProps> = ({
  id = "trending-events-section",
  title = "Trending & Recent Events",
  initialDisplayLimit = 3,
}) => {
  const [dynamicEvents, setDynamicEvents] = useState<EventCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllDynamic, setShowAllDynamic] = useState(false);

  useEffect(() => {
    const fetchDynamicEvents = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await authenticatedRequest<any>(
          `${API_BASE_URL}/events/?is_active=true&ordering=-start_date&limit=10`,
          "GET"
        );

        let fetchedEventsData: FetchedEventData[] = [];
        if (Array.isArray(response)) {
          fetchedEventsData = response;
        } else if (response?.success && Array.isArray(response.data)) {
          fetchedEventsData = response.data;
        } else if (response?.data && Array.isArray(response.data)) {
          fetchedEventsData = response.data;
        } else {
          console.warn(
            "EventSection: Unexpected events response format",
            response
          );
        }

        const now = new Date();
        const mappedDynamicEvents: EventCardProps[] = fetchedEventsData.map(
          (event) => ({
            eventId: event.id,
            image:
              event.customization?.banner_url ||
              "/images/default-event-banner.jpg",
            title: event.title,
            date: new Date(event.start_date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            time: new Date(event.start_date).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            organizer: event.creator?.username || "Kuepass Host",
            location: event.location,
            address: event.address,
            category:
              new Date(event.start_date) > now
                ? "Upcoming"
                : new Date(event.end_date) < now
                ? "Past"
                : "Ongoing",
            isFeatured: false,
          })
        );

        setDynamicEvents(mappedDynamicEvents);
      } catch (err: any) {
        console.error("EventSection: Failed to fetch dynamic events:", err);
        setError(err.message || "Could not load events at this time.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDynamicEvents();
  }, []);

  const eventsToDisplayInitially = showAllDynamic
    ? dynamicEvents
    : dynamicEvents.slice(0, initialDisplayLimit);

  const allDisplayedEvents = [
    ...staticPlaceholderEvents,
    ...eventsToDisplayInitially,
  ];

  return (
    <SectionWrapper id={id}>
      <Container size="xl" px="md">
        <SectionContent>
          <SectionHeader>
            <SectionTitle>{title}</SectionTitle>
          </SectionHeader>

          {isLoading && (
            <Center style={{ padding: "2rem" }}>
              <Loader /> <Text ml="sm">Loading Events...</Text>
            </Center>
          )}
          {error && !isLoading && (
            <Center style={{ padding: "2rem" }}>
              <Text color="red">{error}</Text>
            </Center>
          )}

          {!isLoading && !error && (
            <>
              <EventsGrid>
                {allDisplayedEvents.map((event, index) => (
                  <EventCardWrapper key={event.eventId || `dynamic-${index}`}>
                    <Link
                      href={
                        event.eventId &&
                        event.eventId.startsWith("static-event-")
                          ? `/event-unavailable?title=${encodeURIComponent(
                              event.title
                            )}`
                          : `/eventSchedule/eventDetails/${event.eventId}`
                      }
                      style={{ textDecoration: "none" }}
                    >
                      <EventCard {...event} />
                    </Link>
                  </EventCardWrapper>
                ))}
              </EventsGrid>
              {dynamicEvents.length > initialDisplayLimit &&
                !showAllDynamic && (
                  <Center mt="xl">
                    <ViewMoreButton onClick={() => setShowAllDynamic(true)}>
                      See More Events{" "}
                      <ArrowIcon style={{ marginLeft: "8px" }} />
                    </ViewMoreButton>
                  </Center>
                )}
            </>
          )}
        </SectionContent>
      </Container>
    </SectionWrapper>
  );
};

// Styled Components (keep these as they are)
const SectionWrapper = styled.section`
  /* ... */
`;
const SectionContent = styled(Stack)`
  /* ... */
`;
const SectionHeader = styled(Flex)`
  /* ... */
`;
const SectionTitle = styled(Text)`
  /* ... */
`;
const EventsGrid = styled(Flex)`
  gap: 1.5rem;
  flex-wrap: wrap;
  justify-content: flex-start;

  @media (max-width: 768px) {
    gap: 1rem;
    justify-content: center;
  }
`;
const EventCardWrapper = styled.div`
  /* ... */
`;
const ViewMoreButton = styled(MantineButton)`
  background-color: #056348;
  color: white;
  font-weight: 600;
  &:hover {
    background-color: #034f3a;
  }
` as typeof MantineButton;
const ArrowIcon = styled(FaArrowRight)``;

export default EventSection;
