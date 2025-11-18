"use client";

import { useState, useEffect, useRef } from "react";
import { Button, Flex, Group, Image, Text, Container } from "@mantine/core";
import Link from "next/link";
import NextImage from "next/image";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://api.kuepass.com/api/"
).replace(/\/$/, "");

function HeroSection() {
  // State to toggle between words
  const [activeIndex, setActiveIndex] = useState(0);
  const [latestEvent, setLatestEvent] = useState<{
    id: string;
    title: string;
    start_date: string;
    banner_url?: string;
    price?: string;
    tickets?: Array<{
      id: string;
      name: string;
      category_name: string;
      category_price: string;
    }>;
  } | null>(null);
  const words = ["Create", "Discover", "Manage", "Enjoy"];

  // Ref for the scroll indicator
  const scrollRef = useRef(null);

  // Helper function to format date
  const formatEventDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const options: Intl.DateTimeFormatOptions = {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      };
      return date.toLocaleDateString("en-US", options);
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  // Helper function to get primary ticket type
  const getPrimaryTicketType = (
    tickets: Array<{
      name: string;
      category_name: string;
      category_price: string;
    }>
  ): string => {
    if (!tickets || tickets.length === 0) return "General";

    // Find the first ticket or prioritize based on category
    const primaryTicket =
      tickets.find((ticket) => ticket.category_name === "Paid") ||
      tickets.find((ticket) => ticket.category_name === "Free") ||
      tickets[0];

    return primaryTicket?.name || "General";
  };

  useEffect(() => {
    const fetchLatestEvent = async () => {
      try {
        console.log("Hero: Starting to fetch latest event...");

        // Use the same approach as event details page - fetch all events first
        const eventsRes = await fetch(`${API_BASE_URL}/events/`);
        console.log("Hero: Events response status:", eventsRes.status);

        if (!eventsRes.ok) {
          throw new Error(`Failed to fetch events: ${eventsRes.status}`);
        }

        const eventsJson = await eventsRes.json();
        console.log("Hero: Events response data:", eventsJson);

        // Handle different response formats like event details page
        let allEvents = [];
        if (Array.isArray(eventsJson)) {
          allEvents = eventsJson;
        } else if (eventsJson?.data && Array.isArray(eventsJson.data)) {
          allEvents = eventsJson.data;
        } else if (eventsJson?.success && Array.isArray(eventsJson.data)) {
          allEvents = eventsJson.data;
        }

        console.log("Hero: All events array:", allEvents);

        // Filter for active events and sort by start_date
        const activeEvents = allEvents
          .filter((event) => event.is_active !== false)
          .sort(
            (a, b) =>
              new Date(a.start_date).getTime() -
              new Date(b.start_date).getTime()
          );

        console.log("Hero: Active events:", activeEvents);

        // Get the first upcoming event
        const now = new Date();
        const upcomingEvent = activeEvents.find((event) => {
          const eventDate = new Date(event.start_date);
          return eventDate > now;
        });

        const eventData = upcomingEvent || activeEvents[0];
        console.log("Hero: Selected event data:", eventData);

        if (eventData && eventData.id && eventData.title) {
          // Fetch tickets for this event (same approach as event details page)
          try {
            console.log("Hero: Fetching tickets for event:", eventData.id);
            const ticketsRes = await fetch(
              `${API_BASE_URL}/tickets/?event=${eventData.id}`
            );
            console.log("Hero: Tickets response status:", ticketsRes.status);

            let tickets = [];
            if (ticketsRes.ok) {
              const ticketsData = await ticketsRes.json();
              console.log("Hero: Tickets response data:", ticketsData);

              // Handle different response formats
              let ticketsResult = [];
              if (Array.isArray(ticketsData)) {
                ticketsResult = ticketsData;
              } else if (ticketsData?.data && Array.isArray(ticketsData.data)) {
                ticketsResult = ticketsData.data;
              } else if (
                ticketsData?.results &&
                Array.isArray(ticketsData.results)
              ) {
                ticketsResult = ticketsData.results;
              }

              tickets = ticketsResult.filter(
                (ticket) => ticket.event === eventData.id
              );
              console.log("Hero: Filtered tickets:", tickets);
            }

            const eventToSet = {
              id: eventData.id,
              title: eventData.title,
              start_date: eventData.start_date,
              banner_url:
                eventData.customization?.banner_url || eventData.banner_url,
              price: eventData.price,
              tickets: tickets,
            };
            console.log("Hero: Setting event:", eventToSet);

            setLatestEvent(eventToSet);
          } catch (ticketError) {
            console.error("Hero: Failed to fetch tickets:", ticketError);
            // Still set the event without tickets
            setLatestEvent({
              id: eventData.id,
              title: eventData.title,
              start_date: eventData.start_date,
              banner_url:
                eventData.customization?.banner_url || eventData.banner_url,
              price: eventData.price,
              tickets: [],
            });
          }
        } else {
          console.log("Hero: No valid event data found, setting to null");
          setLatestEvent(null);
        }
      } catch (err) {
        console.error("Hero: Failed to fetch latest event:", err);
        setLatestEvent(null);
      }
    };

    fetchLatestEvent();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % words.length);
    }, 2500); // toggles every 2.5 seconds

    return () => clearInterval(interval);
  }, [words.length]);

  // Scroll indicator animation
  useEffect(() => {
    const handleScroll = () => {
      const scrollElement = scrollRef.current as unknown as HTMLElement;
      if (scrollElement) {
        scrollElement.style.opacity = window.scrollY > 100 ? "0" : "1";
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <HeroContainer>
      <BackgroundImage />
      <ShapeDivider />

      <ContentContainer>
        <HeroContent>
          <LeftContent>
            <MainHeading>Find Events. Host Events. Effortlessly.</MainHeading>

            <SubtitleText>
              Whether you&apos;re planning or attending an event, our platform
              gives you everything from ticketing to entry control. all in one
              place
            </SubtitleText>

            <ButtonGroup>
              <Link href="/eventSchedule/createEventForm">
                <PrimaryButton>Host an Event</PrimaryButton>
              </Link>
            </ButtonGroup>
          </LeftContent>

          <EventCard>
            <EventCardImage>
              <Image
                src={latestEvent?.banner_url || "/images/banner.png"}
                alt={latestEvent?.title || "Event thumbnail"}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </EventCardImage>
            <EventDetails>
              <EventDetaill>
                {latestEvent?.title || "Comedy night laugh off"}
              </EventDetaill>
              <EventDetaill>
                {latestEvent?.tickets
                  ? getPrimaryTicketType(latestEvent.tickets)
                  : "General"}
              </EventDetaill>
              <EventDetail>
                <span style={{ color: "#ffffff" }}>
                  {latestEvent?.start_date
                    ? formatEventDate(latestEvent.start_date)
                    : "TBD"}
                </span>
              </EventDetail>
            </EventDetails>
            <ViewsTag>
              <Link
                href={
                  latestEvent?.id
                    ? `/eventSchedule/eventDetails/${latestEvent.id}`
                    : "#"
                }
                style={{ textDecoration: "none", color: "inherit" }}
              >
                View{" "}
                <span
                  style={{
                    fontSize: "22px",
                    marginLeft: "4px",
                    fontWeight: "600",
                  }}
                >
                  →
                </span>
              </Link>
            </ViewsTag>
          </EventCard>
        </HeroContent>
      </ContentContainer>
    </HeroContainer>
  );
}

export default HeroSection;

// Styled Components
const HeroContainer = styled.div`
  position: relative;
  min-height: 115vh;
  width: 100%;
  overflow: hidden;
  padding: 0;

  @media (max-width: 992px) {
    padding: 0;
  }
`;

const BackgroundImage = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("/images/heroImage.png");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: -3;
`;

const ViewsTag = styled.div`
  position: absolute;
  bottom: 8px;
  right: 8px;
  color: #ffffff;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 20px;
  font-weight: 500;
`;

const ShapeDivider = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background-image: url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='pattern' width='40' height='40' viewBox='0 0 40 40' patternUnits='userSpaceOnUse' patternTransform='rotate(45)'%3E%3Crect width='100%25' height='100%25' fill='rgba(5, 99, 72, 0.03)'/%3E%3Ccircle cx='20' cy='20' r='1' fill='rgba(5, 99, 72, 0.05)'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23pattern)'/%3E%3C/svg%3E");
  opacity: 0.5;
  z-index: -1;
`;

const ContentContainer = styled.div`
  max-width: 1400px;
  height: 100%;
  margin: 0 auto;
  padding: 80px 20px 0 20px;

  @media (max-width: 992px) {
    padding: 60px 20px 0 20px;
  }
`;

const HeroContent = styled(Flex)`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 40px;

  @media (max-width: 992px) {
    flex-direction: column;
    text-align: center;
  }
`;

const LeftContent = styled.div`
  flex: 1;
  max-width: 700px;
  text-align: center;
  margin: 0 auto;

  @media (max-width: 992px) {
    max-width: 100%;
    order: 2;
  }
`;

const RightContent = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-end;
  position: relative;

  @media (max-width: 992px) {
    width: 100%;
    justify-content: center;
    order: 1;
    margin-bottom: 40px;
  }
`;

const MainHeading = styled.h1`
  font-size: 60px;
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: 24px;
  color: #ffffff;
  text-align: center;

  @media (max-width: 1200px) {
    font-size: 48px;
  }

  @media (max-width: 768px) {
    font-size: 36px;
  }
`;

const GradientWord = styled.span`
  background: linear-gradient(90deg, #025a3a 0%, #7465ce 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: inline-block;
`;

const HighlightSpan = styled.span`
  position: relative;
  color: #ebb734;
  display: inline-block;

  &::after {
    content: "";
    position: absolute;
    bottom: 8px;
    left: 0;
    width: 100%;
    height: 8px;
    background-color: rgba(255, 61, 0, 0.2);
    z-index: -1;
    border-radius: 4px;
  }
`;

const SubtitleText = styled(Text)`
  font-size: 18px;
  line-height: 1.6;
  color: #ffffff;
  margin-bottom: 32px;
  max-width: 600px;
  text-align: center;
  margin-left: auto;
  margin-right: auto;

  @media (max-width: 992px) {
    margin-left: auto;
    margin-right: auto;
  }
`;

const ButtonGroup = styled(Group)`
  margin-bottom: 48px;
  justify-content: center;

  @media (max-width: 992px) {
    justify-content: center;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }
`;

const PrimaryButton = styled(Button)`
  height: 3rem;
  background: #f5b645;
  color: #1f2937;
  width: auto;
  min-width: 200px;
  padding: 0 36px;
  border-radius: 46px;
  border: none;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 10px 20px rgba(245, 182, 69, 0.15);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 25px rgba(245, 182, 69, 0.2);
    background: #d97706;
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 5px 15px rgba(245, 182, 69, 0.15);
  }
`;

const SecondaryButton = styled(Button)`
  height: 3rem;
  background: transparent;
  color: #025a3a;
  width: auto;
  min-width: 180px;
  padding: 0 36px;
  border-radius: 46px;
  border: 2px solid #025a3a;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(2, 90, 58, 0.02);
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(2, 90, 58, 0.1);
    color: #025a3a;
  }

  &:active {
    transform: translateY(0);
    box-shadow: none;
  }
`;

const EventCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  padding: 20px;
  bottom: 20px;
  right: 20px;
  background: #191817;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  z-index: 3;
  width: 368px;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
  }

  @media (max-width: 992px) {
    display: none;
  }
`;

const EventCardImage = styled.div`
  width: 120px;
  height: 114px;
  border-radius: 12px;
`;

const EventBanner = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  background: #f5b645;
  color: #000000;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  z-index: 2;
`;

const EventTitle = styled.div`
  position: absolute;
  top: 30px;
  left: 8px;
  right: 8px;
  color: #025a3a;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.2;
  z-index: 2;
`;

const FreeTag = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  background: #025a3a;
  color: #ffffff;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  z-index: 2;
`;

const EventDetails = styled.div`
  padding: 12px 16px;
  align-items: center;
  justify-content: center;
`;

const EventDetail = styled.div`
  gap: 8px;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #ddb159;
`;
const EventDetaill = styled.div`
  gap: 8px;
  margin-bottom: 6px;
  font-size: 16.13px;
  font-weight: 600;
  color: #ffffff;
`;

const EventIcon = styled.span`
  font-size: 12px;
`;

const SpeakerSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  background: #ffffff;
  gap: 8px;
`;

const SpeakerProfile = styled.div`
  position: relative;
  width: 40px;
  height: 40px;
`;

const SpeakerImage = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #f5b645;
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 500px;

  @media (max-width: 1200px) {
    height: 450px;
  }

  @media (max-width: 992px) {
    height: 400px;
    width: 90%;
    max-width: 500px;
  }
`;

const MainImageWrapper = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 80%;
  height: 80%;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  transition: transform 0.5s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const MainImage = styled(Image)`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const SecondaryImageWrapper = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 50%;
  height: 60%;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  z-index: 2;
  transition: transform 0.5s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

interface ImageOverlayProps {
  $secondary?: boolean;
}

const ImageOverlay = styled.div<ImageOverlayProps>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${(props) =>
    props.$secondary
      ? "linear-gradient(135deg, rgba(116, 101, 206, 0.2) 0%, rgba(2, 90, 58, 0.2) 100%)"
      : "linear-gradient(135deg, rgba(2, 90, 58, 0.2) 0%, rgba(116, 101, 206, 0.2) 100%)"};
  z-index: 1;
`;

const FloatingCard = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  z-index: 3;
  animation: float 3s ease-in-out infinite;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
  }

  @keyframes float {
    0% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
    100% {
      transform: translateY(0px);
    }
  }
`;

const FloatingCardContent = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.02);
  }
`;

const FloatingCardIcon = styled.div`
  font-size: 24px;
`;

const FloatingCardText = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #14142b;

  small {
    font-size: 12px;
    color: #4e4b66;
    font-weight: normal;
  }
`;

const ScrollIndicator = styled.div`
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 1;
  transition: opacity 0.3s ease;
`;

const ScrollText = styled.div`
  font-size: 14px;
  color: #ffffff;
  margin-bottom: 8px;
`;

const ScrollArrow = styled.div`
  font-size: 20px;
  color: #f5b645;
  animation: bounce 2s infinite;

  @keyframes bounce {
    0%,
    20%,
    50%,
    80%,
    100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-10px);
    }
    60% {
      transform: translateY(-5px);
    }
  }
`;
