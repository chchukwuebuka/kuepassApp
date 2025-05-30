"use client";

import React, { useState, useEffect } from "react";
import { Button, Group, Image, Text, Badge, Tooltip } from "@mantine/core";
import { Share2, Calendar, MapPin, Clock } from "lucide-react";
import Link from "next/link";
import styles from "./styles.module.css";
import { authenticatedRequest } from "../../app/services/auth";

interface Customization {
  id: string;
  banner_url: string;
  card_color: string;
  is_active: boolean;
  event: string;
}

interface EventData {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  banner_url: string;
  location: string;
  is_active: boolean;
  creator: { id: number; username: string };
}

interface TopBannerProps {
  event: EventData;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://keupass-48c2ae65f897.herokuapp.com/api";

const TopBanner: React.FC<TopBannerProps> = ({ event }) => {
  const [copied, setCopied] = useState(false);
  const [customization, setCustomization] = useState<Customization | null>(null);

  useEffect(() => {
    console.log("Event ID:", event.id); // Log event ID for debugging
    (async () => {
      try {
        const res = await authenticatedRequest(
          `${API_BASE_URL}/event-customizations/?event=${event.id}`,
          "GET",
          { headers: { "Cache-Control": "no-cache" } }
        );
        console.log("Raw response:", res); // Log raw response
        // Handle both { success, message, data } and direct array responses
        const list = res.success !== undefined ? res.data : res;
        console.log("Parsed data:", list); // Log parsed data
        if (Array.isArray(list) && list.length > 0) {
          console.log("Setting customization:", list[0]); // Log customization
          setCustomization(list[0]);
        } else {
          console.log("No customization data found");
        }
      } catch (err) {
        console.error("Failed to load customization:", err); // Log error
      }
    })();
  }, [event.id]);

  useEffect(() => {
    console.log("Current customization state:", customization); // Log state changes
    const bannerImage =
      customization?.banner_url || event.banner_url || "/images/placeholder.png";
    console.log("Banner image URL:", bannerImage); // Log final image URL
  }, [customization, event.banner_url]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  const bannerImage =
    customization?.banner_url || event.banner_url || "/images/placeholder.png";

  // Add 50% opacity to the card color for overlay
  const overlayColor = customization
    ? customization.card_color + "80"
    : "rgba(0,0,0,0.5)";

  const handleShare = async () => {
    const url = `${window.location.origin}/eventSchedule/events/${event.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: event.title, text: event.title, url });
        return;
      } catch {}
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUpcoming = new Date(event.start_date) > new Date();

  return (
    <div className={styles.header}>
      <div
        className={styles.bannerContainer}
        style={{ backgroundColor: overlayColor }}
      >
        <Image
          src={bannerImage}
          alt={event.title}
          className={styles.bannerImage}
          fallbackSrc="/images/placeholder.png"
          onError={(e) => console.error("Image load error:", e)} // Log image errors
        />
        <div className={styles.bannerOverlay} />
      </div>

      {isUpcoming && (
        <div className={styles.badgeContainer}>
          <Badge color="green" size="lg">
            Upcoming Event
          </Badge>
        </div>
      )}
      {!event.is_active && (
        <div className={styles.inactiveBadgeContainer}>
          <Badge color="red" size="lg">
            Inactive
          </Badge>
        </div>
      )}

      <div className={styles.headerContent}>
        <Text className={styles.eventTitle}>{event.title}</Text>

        <div className={styles.eventDetails}>
          <div className={styles.eventDetail}>
            <Calendar size={18} />
            <Text className={styles.eventdate}>
              {formatDate(event.start_date)}
            </Text>
          </div>
          <div className={styles.eventDetail}>
            <Clock size={18} />
            <Text className={styles.eventdate}>
              {formatTime(event.start_date)}
            </Text>
          </div>
          {event.location && (
            <div className={styles.eventDetail}>
              <MapPin size={18} />
              <Text className={styles.eventLocation}>
                {event.location}
              </Text>
            </div>
          )}
        </div>

        <Group className={styles.eventBTN}>
          {/* <Tooltip label="Register for this event" withArrow>
            <Link
              href={`/eventSchedule/registerEvent?eventId=${event.id}`}
              style={{ textDecoration: "none" }}
            >
              <button className={styles.registerButton}>Register</button>
            </Link>
          </Tooltip> */}

          <Tooltip label={copied ? "Copied!" : "Share this event"} withArrow>
            <Button
              variant="outline"
              leftSection={<Share2 size={16} />}
              onClick={handleShare}
              className={styles.registerButton}
            >
              {copied ? "Link Copied!" : "Share Event"}
            </Button>
          </Tooltip>
        </Group>
      </div>
    </div>
  );
};

export default TopBanner;