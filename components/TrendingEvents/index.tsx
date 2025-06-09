"use client";
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  Stack,
  Flex,
  Text,
  Container,
  Button as MantineButton,
  Center,
} from "@mantine/core";
import { FaArrowRight } from "react-icons/fa";
import Link from "next/link";
import EventCard, { EventCardProps } from "./cardsPromps";
import { authenticatedRequest } from "@/app/services/auth";
import { useLoadingState } from "@/store/loadingHook";

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
  const [events, setEvents] = useState<EventCardProps[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const { withLoading } = useLoadingState();

  useEffect(() => {
    const fetchEvents = async () => {
      setError(null);
      try {
        await withLoading(async () => {
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
          const mappedEvents: EventCardProps[] = fetchedEventsData.map(
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

          setEvents(mappedEvents);
        });
      } catch (err: any) {
        console.error("EventSection: Failed to fetch events:", err);
        setError(err.message || "Could not load events at this time.");
      }
    };

    fetchEvents();
  }, []);

  const eventsToDisplay = showAll
    ? events
    : events.slice(0, initialDisplayLimit);

  return (
    <SectionWrapper id={id}>
      <Container size="xl" px="md">
        <SectionContent>
          <SectionHeader>
            <SectionTitle>{title}</SectionTitle>
          </SectionHeader>

          {error && (
            <Center style={{ padding: "2rem" }}>
              <Text color="red">{error}</Text>
            </Center>
          )}

          {!error && (
            <>
              <EventsGrid>
                {eventsToDisplay.map((event, index) => (
                  <EventCardWrapper key={event.eventId || `event-${index}`}>
                    <Link
                      href={`/eventSchedule/eventDetails/${event.eventId}`}
                      style={{ textDecoration: "none" }}
                    >
                      <EventCard {...event} />
                    </Link>
                  </EventCardWrapper>
                ))}
              </EventsGrid>
              {events.length > initialDisplayLimit && !showAll && (
                <Center mt="xl">
                  <ViewMoreButton onClick={() => setShowAll(true)}>
                    See More Events <ArrowIcon style={{ marginLeft: "8px" }} />
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

// Styled Components
const SectionWrapper = styled.section`
  padding: 4rem 0;
  background: linear-gradient(135deg, #f8fffe 0%, #e6f7f1 100%);
`;

const SectionContent = styled(Stack)`
  gap: 2rem;
`;

const SectionHeader = styled(Flex)`
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const SectionTitle = styled(Text)`
  font-size: 2rem;
  font-weight: 700;
  color: #025a3a;
  margin: 0;
`;

const EventsGrid = styled(Flex)`
  gap: 1.5rem;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    gap: 1rem;
    justify-content: center;
  }
`;

const EventCardWrapper = styled.div`
  /* flex: 1 1 300px; */
  max-width: 400px;
  min-width: 280px;
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
