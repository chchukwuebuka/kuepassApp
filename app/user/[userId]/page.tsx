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
  Button,
} from "@mantine/core";
import { IconX, IconHome } from "@tabler/icons-react";
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
    text_response?: string;
    selected_options?: Array<{ option: string }>;
    question_text?: string; // The actual question text
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

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "https://keupass-48c2ae65f897.herokuapp.com/api"
).replace(/\/$/, "");

export default function UserProfilePage() {
  const params = useParams<{ userId: string }>();
  const searchParams = useSearchParams();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get userId from either URL params or query string (for QR code compatibility)
  const userId = params.userId || searchParams.get("userId");

  useEffect(() => {
    const fetchUserProfile = async () => {
      console.log("UserProfilePage: Full URL =", window.location.href);
      console.log("UserProfilePage: userId =", userId);
      console.log("UserProfilePage: params.userId =", params.userId);
      console.log(
        "UserProfilePage: searchParams.get('userId') =",
        searchParams.get("userId")
      );

      if (!userId) {
        console.log("UserProfilePage: No userId found, setting error");
        setError("User ID is missing");
        setLoading(false);
        return;
      }

      try {
        console.log(
          "UserProfilePage: Starting to fetch profile for userId:",
          userId
        );
        setLoading(true);
        setError(null);

        // Use local API route which handles public access
        const apiUrl = `/api/users/${userId}`;
        console.log("UserProfilePage: Fetching from API URL:", apiUrl);

        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        console.log("UserProfilePage: API response status:", response.status);
        console.log("UserProfilePage: API response ok:", response.ok);

        if (!response.ok) {
          if (response.status === 404) {
            console.log("UserProfilePage: Attendee not found (404)");
            throw new Error("Attendee not found");
          }
          if (response.status === 401) {
            console.log("UserProfilePage: Access denied (401)");
            throw new Error("Access denied - authentication required");
          }
          console.log("UserProfilePage: API error status:", response.status);
          throw new Error(`Failed to fetch attendee: ${response.status}`);
        }

        const responseData = await response.json();
        console.log("UserProfilePage: API response data:", responseData);

        // Handle the new response format with data wrapper
        const userData = responseData.data || responseData;
        console.log("UserProfilePage: Extracted user data:", userData);

        // Process the API response to match our display format
        const processedData: UserProfile = {
          ...userData,
          // Use actual fields from the API
          title: userData.title || "Attendee", // Use API title or default
          institution: userData.institution || "Not specified",
          status: userData.is_validated ? "VERIFIED" : "PENDING",
        };

        console.log("UserProfilePage: Processed data:", processedData);
        setUserProfile(processedData);
      } catch (err: any) {
        console.error("UserProfilePage: Error fetching user profile:", err);
        console.error("UserProfilePage: Error message:", err.message);
        setError(err.message || "Failed to load attendee profile");
      } finally {
        console.log("UserProfilePage: Setting loading to false");
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId, params.userId, searchParams]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not available";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderResponse = (response: any) => {
    // Handle text responses
    if (response.text_response) {
      return (
        <div className={styles.responseItem}>
          <Text className={styles.responseLabel}>
            {response.question_text || `Question ${response.question}`}
          </Text>
          <Text className={styles.responseValue}>{response.text_response}</Text>
        </div>
      );
    }

    // Handle selected options (for select, checkbox, radio)
    if (response.selected_options && response.selected_options.length > 0) {
      const optionsText = response.selected_options
        .map((option: any) => option.option)
        .join(", ");
      return (
        <div className={styles.responseItem}>
          <Text className={styles.responseLabel}>
            {response.question_text || `Question ${response.question}`}
          </Text>
          <Text className={styles.responseValue}>{optionsText}</Text>
        </div>
      );
    }

    // Fallback for empty responses
    return (
      <div className={styles.responseItem}>
        <Text className={styles.responseLabel}>
          {response.question_text || `Question ${response.question}`}
        </Text>
        <Text className={styles.responseValue} c="dimmed">
          No response provided
        </Text>
      </div>
    );
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
          Register For Small chops festival Season 2 - The Igbo Heritage
          </Text>

          <div className={styles.logoContainer}>
            <div className={styles.logoBox}>
              <Image
                src="/images/life.png"
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

          {/* <div className={styles.infoRow}>
            <Text className={styles.label}>AFFILIATED</Text>
            <Text className={styles.value}>
              {userProfile.institution || "Not specified"}
            </Text>
          </div> */}

          {/* Registration Responses Section */}
          {userProfile.responses && userProfile.responses.length > 0 && (
            <div className={styles.responsesSection}>
              <Text className={styles.sectionTitle}>
                REGISTRATION RESPONSES
              </Text>
              <div className={styles.responsesContainer}>
                {userProfile.responses.map((response, index) => (
                  <div key={response.id || index}>
                    {renderResponse(response)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Home Button */}
      <div className={styles.homeButtonContainer}>
        <Button
          leftSection={<IconHome size={20} />}
          size="lg"
          variant="filled"
          color="green"
          onClick={() => (window.location.href = "/")}
          className={styles.homeButton}
        >
          Go to Home
        </Button>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <Text className={styles.footerText}>@ 2025 GOLDEN AGE</Text>
      </div>
    </div>
  );
}
