"use client";

import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  Container,
  Text,
  Group,
  Stack,
  Loader,
  Center,
  Alert,
} from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import styles from "./styles.module.css";

interface UserProfile {
  id: string;
  event: string;
  user: string;
  email: string;
  name: string;
  phone_number?: string;
  registration_date?: string;
  responses?: Array<{
    id: string;
    question: string;
    text_response: string;
    selected_options: string[];
  }>;
  is_validated?: boolean;
  validated_at?: string;
  ticket_type?: string;
  payment_status?: string;
  ticket_code?: string;
  // Additional fields for display
  title?: string;
  institution?: string;
  status?: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://keupass-48c2ae65f897.herokuapp.com/api";

export default function UserProfilePage() {
  const params = useParams<{ userId: string }>();
  const searchParams = useSearchParams();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!params.userId) {
        setError("User ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Try to fetch attendee profile by ID using the attendees API endpoint
        const response = await fetch(
          `${API_BASE_URL}/attendees/${params.userId}/`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Attendee not found");
          }
          if (response.status === 401) {
            throw new Error("Access denied - authentication required");
          }
          throw new Error(`Failed to fetch attendee: ${response.status}`);
        }

        const userData = await response.json();

        // Process the API response to match our display format
        const processedData: UserProfile = {
          ...userData,
          // Use actual fields from the API
          title: userData.title || "Attendee", // Use API title or default
          institution: userData.institution || "Not specified",
          status: userData.is_validated ? "VERIFIED" : "PENDING",
        };

        setUserProfile(processedData);
      } catch (err: any) {
        console.error("Error fetching user profile:", err);
        setError(err.message || "Failed to load attendee profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [params.userId]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not available";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <Container size="md" className={styles.container}>
        <Center style={{ height: "50vh" }}>
          <Stack align="center" gap="md">
            <Loader size="xl" />
            <Text size="lg" c="dimmed">
              Loading attendee profile...
            </Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="md" className={styles.container}>
        <Center style={{ height: "50vh" }}>
          <Alert
            icon={<IconX size="1rem" />}
            title="Error"
            color="red"
            variant="light"
            style={{ maxWidth: 400 }}
          >
            {error}
          </Alert>
        </Center>
      </Container>
    );
  }

  if (!userProfile) {
    return (
      <Container size="md" className={styles.container}>
        <Center style={{ height: "50vh" }}>
          <Text size="lg" c="dimmed">
            No attendee data available
          </Text>
        </Center>
      </Container>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <div className={styles.header}>
        <div className={styles.decorativeShape1}></div>
        <div className={styles.decorativeShape2}></div>

        <div className={styles.headerContent}>
          <Text className={styles.conferenceTitle}>
            8TH ANNUAL SCIENTIFIC CONFERENCE AND AGM
          </Text>

          <div className={styles.logoContainer}>
            <div className={styles.logoBox}>
              <Image
                src="/images/arcon.png"
                alt="ARCON Logo"
                width={200}
                height={100}
                className={styles.arconImage}
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={styles.mainContent}>
        <div className={styles.userInfo}>
          <div className={styles.infoRow}>
            <Text className={styles.label}>NAME</Text>
            <Text className={styles.value}>
              {userProfile.name || "Unknown User"}
            </Text>
          </div>

          <div className={styles.infoRow}>
            <Text className={styles.label}>EMAIL</Text>
            <Text className={styles.value}>
              {userProfile.email || "Not provided"}
            </Text>
          </div>

          <div className={styles.infoRow}>
            <Text className={styles.label}>TITLE</Text>
            <Text className={styles.value}>
              {userProfile.title || "Not specified"}
            </Text>
          </div>

          <div className={styles.infoRow}>
            <Text className={styles.label}>INSTITUTION</Text>
            <Text className={styles.value}>
              {userProfile.institution || "Not specified"}
            </Text>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <Text className={styles.footerText}>@ 2025 ARCON</Text>
      </div>
    </div>
  );
}
