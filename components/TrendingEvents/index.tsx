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

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://api.kuepass.com/api/"
).replace(/\/$/, "");

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
  title = "Discover Events That Inspire You",
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
            <SectionSubtitle>Discover Events</SectionSubtitle>
            <SectionTitle>
              Discover Events That <HighlightedText>Inspire</HighlightedText>{" "}
              You
            </SectionTitle>
            <SectionDescription>
              From local meetups to big festivals, explore events created by
              passionate hosts and communities. Find what excites you and be
              part of the experience.
            </SectionDescription>
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
                <ViewMoreContainer>
                  <ViewMoreButton onClick={() => setShowAll(true)}>
                    See More Events <ArrowIcon style={{ color: "#F5B645" }} />
                  </ViewMoreButton>
                </ViewMoreContainer>
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
  background: #f5f5f5;
`;

const SectionContent = styled(Stack)`
  gap: 3rem;
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const SectionSubtitle = styled(Text)`
  font-size: 1rem;
  font-weight: 500;
  color: #666;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const SectionTitle = styled(Text)`
  font-size: 40px;
  font-weight: 600;
  color: #000;
  margin: 0 0 1rem 0;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const HighlightedText = styled.span`
  background-color: #ffd700;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
`;

const SectionDescription = styled(Text)`
  font-size: 1.1rem;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.5;
`;

const EventsGrid = styled(Flex)`
  gap: 2rem;
  flex-wrap: wrap;
  align-items: stretch;
  justify-content: center;

  @media (max-width: 768px) {
    gap: 1.5rem;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }

  @media (max-width: 480px) {
    gap: 1rem;
    padding: 0 1rem;
  }
`;

const EventCardWrapper = styled.div`
  flex: 1 1 300px;
  max-width: 350px;
  min-width: 280px;

  @media (max-width: 768px) {
    flex: none;
    width: 100%;
    max-width: 400px;
    min-width: auto;
    display: flex;
    justify-content: center;
  }

  @media (max-width: 480px) {
    max-width: 100%;
    padding: 0 0.5rem;
  }
`;

const ViewMoreContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const ViewMoreButton = styled.button`
  background: none;
  border: none;
  color: #000;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: color 0.2s ease;

  &:hover {
    color: #ff6b35;
  }
`;

const ArrowIcon = styled(FaArrowRight)`
  color: #ff6b35;
  font-size: 0.875rem;
`;

export default EventSection;
