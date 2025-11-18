"use strict";

import React, { useState, useRef, useEffect } from "react";
import { EventFormData } from "@/store/types";
import {
  Button,
  Card,
  Flex,
  Group,
  Image,
  Stack,
  Switch,
  Text,
  ActionIcon,
  Tooltip,
  Modal,
} from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import styles from "./styles.module.css";
import CountdownTimer from "../CountdownTimer";
import QRCode from "react-qr-code";
import { authenticatedRequest } from "../../app/services/auth";
import { FileX2 } from "lucide-react";

interface AppearanceStepProps {
  formData: EventFormData;
  updateFormData: (update: Partial<EventFormData>) => void;
  onFileSelect: (file: File | null) => void;
  previewOnly?: boolean;
  showCountdown?: boolean;
}

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://api.kuepass.com/api/"
).replace(/\/$/, "");

const AppearanceStep: React.FC<AppearanceStepProps> = ({
  formData,
  updateFormData,
  onFileSelect,
  previewOnly = false,
  showCountdown = true,
}) => {
  // Helper functions
  const hexToRgb = (hex: string): [number, number, number] | null => {
    hex = hex.replace("#", "");
    let r, g, b;
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    } else {
      return null;
    }
    return [r, g, b];
  };

  const getRgbaColor = (hex: string): string => {
    const rgb = hexToRgb(hex);
    if (rgb) {
      const [r, g, b] = rgb;
      const opacity = hex.toLowerCase() === "#ffffff" ? 0.8 : 0.7;
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    return "rgba(2, 90, 58, 0.7)";
  };

  const [backgroundImage, setBackgroundImage] = useState<string | null>(
    formData.appearance || null
  );
  const [targetDate, setTargetDate] = useState<Date | undefined>(undefined);
  const [isCountingDown, setIsCountingDown] = useState<boolean>(false);
  const [autoStartCountdown, setAutoStartCountdown] = useState<boolean>(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState<boolean>(false);
  const [rgbaColor, setRgbaColor] = useState<string>(
    getRgbaColor(formData.cardColor || "#025a3a")
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync backgroundImage with formData.appearance
  useEffect(() => {
    setBackgroundImage(formData.appearance || null);
  }, [formData.appearance]);

  // Update rgbaColor when formData.cardColor changes
  useEffect(() => {
    const newRgbaColor = getRgbaColor(formData.cardColor || "#025a3a");
    setRgbaColor(newRgbaColor);
  }, [formData.cardColor]);

  // Fetch existing countdown
  useEffect(() => {
    if (!formData.eventURL) {
      console.log("No eventURL, skipping countdown fetch");
      return;
    }

    const eventId = formData.eventURL.split("/").pop();
    if (!eventId) {
      console.log("Invalid eventId from eventURL:", formData.eventURL);
      return;
    }

    const fetchCountdown = async () => {
      try {
        console.log("Fetching countdown for eventId:", eventId);
        const response = await authenticatedRequest(
          `${API_BASE_URL}/event-countdowns/?event=${eventId}`,
          "GET"
        );
        console.log("Countdown response:", response);
        const countdowns = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response)
          ? response
          : [];
        if (countdowns.length > 0) {
          // Take the most recent active countdown
          const activeCountdown = countdowns.find(
            (c) => c.is_active && new Date(c.target_date) > new Date()
          );
          if (activeCountdown) {
            console.log("Found active countdown:", activeCountdown);
            const target = new Date(activeCountdown.target_date);
            setTargetDate(target);
            setIsCountingDown(true);
            setAutoStartCountdown(false);
            localStorage.setItem(`countdown_${eventId}`, "active");
          } else {
            console.log("No active future countdowns, setting default");
            // Set fallback to event start date/time if available
            if (formData.startDate && formData.startTime) {
              const target = new Date(
                `${formData.startDate}T${formData.startTime}:00Z`
              );
              if (target > new Date()) {
                setTargetDate(target);
                setIsCountingDown(true);
                localStorage.setItem(`countdown_${eventId}`, "active");
              } else {
                setIsCountingDown(false);
                setAutoStartCountdown(false);
                localStorage.setItem(`countdown_${eventId}`, "completed");
              }
            } else {
              setIsCountingDown(false);
              setAutoStartCountdown(false);
              localStorage.setItem(`countdown_${eventId}`, "completed");
            }
          }
        } else {
          // No countdowns exist; set default if event has start date/time
          if (formData.startDate && formData.startTime) {
            const target = new Date(
              `${formData.startDate}T${formData.startTime}:00Z`
            );
            if (target > new Date()) {
              setTargetDate(target);
              setIsCountingDown(true);
              localStorage.setItem(`countdown_${eventId}`, "active");
            } else {
              setIsCountingDown(false);
              setAutoStartCountdown(false);
              localStorage.setItem(`countdown_${eventId}`, "completed");
            }
          }
        }
      } catch (error) {
        console.error("Error fetching countdown:", error);
      }
    };

    const countdownStatus = localStorage.getItem(`countdown_${eventId}`);
    console.log("Countdown status:", countdownStatus);
    if (countdownStatus !== "active" && countdownStatus !== "completed") {
      fetchCountdown();
    } else if (countdownStatus === "completed") {
      setIsCountingDown(false);
      setAutoStartCountdown(false);
    }
  }, [formData.eventURL, formData.startDate, formData.startTime]);

  // Trigger countdown creation only if no active countdown exists
  useEffect(() => {
    if (
      formData.eventURL &&
      isCountingDown &&
      !localStorage.getItem(`countdown_${formData.eventURL.split("/").pop()}`)
    ) {
      const eventId = formData.eventURL.split("/").pop();
      if (eventId) {
        console.log(
          "Checking if countdown creation is needed for eventId:",
          eventId
        );
        authenticatedRequest(
          `${API_BASE_URL}/event-countdowns/?event=${eventId}`,
          "GET"
        )
          .then((response) => {
            const countdowns = Array.isArray(response.data)
              ? response.data
              : Array.isArray(response)
              ? response
              : [];
            const activeCountdown = countdowns.find(
              (c) => c.is_active && new Date(c.target_date) > new Date()
            );
            if (!activeCountdown) {
              console.log("No active countdown found, creating new one");
              sendCountdownRequest(eventId);
            } else {
              console.log("Active countdown exists, skipping creation");
              setTargetDate(new Date(activeCountdown.target_date));
              localStorage.setItem(`countdown_${eventId}`, "active");
            }
          })
          .catch((error) => {
            console.error("Error checking countdowns:", error);
          });
      }
    }
  }, [formData.eventURL, isCountingDown]);

  const handleSetEventImage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.target.files?.[0];
    console.log("Selected file:", file);
    if (!file) {
      console.log("No file selected");
      alert("No file selected. Please choose an image.");
      onFileSelect(null);
      setBackgroundImage(formData.appearance || null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      console.log("Invalid file type:", file.type);
      alert("Please select a valid image file (e.g., PNG, JPEG).");
      onFileSelect(null);
      setBackgroundImage(formData.appearance || null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      console.log("File too large:", file.size);
      alert("Image size must be less than 5MB.");
      onFileSelect(null);
      setBackgroundImage(formData.appearance || null);
      return;
    }

    setIsLoading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Url = reader.result as string;
      console.log("Base64 URL:", base64Url);
      setBackgroundImage(base64Url);
      setIsLoading(false);
    };
    reader.readAsDataURL(file);

    onFileSelect(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const sendCountdownRequest = async (eventId: string) => {
    if (
      !eventId ||
      !eventId.match(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      )
    ) {
      console.error("Invalid event UUID:", eventId);
      setIsCountingDown(false);
      setAutoStartCountdown(false);
      return;
    }

    let target = targetDate;
    if (!target && formData.startDate && formData.startTime) {
      target = new Date(`${formData.startDate}T${formData.startTime}:00Z`);
      console.log("Using event start_date:", target.toISOString());
    }
    if (!target) {
      target = new Date();
      target.setDate(target.getDate() + 7);
      console.log("Using default target_date:", target.toISOString());
    }
    setTargetDate(target);

    const countdownData = {
      event: eventId,
      target_date: target.toISOString(),
      is_active: true,
    };

    console.log("Sending countdown data:", countdownData);

    try {
      const response = await authenticatedRequest(
        `${API_BASE_URL}/event-countdowns/`,
        "POST",
        countdownData
      );
      console.log("Countdown created:", response);
      localStorage.setItem(`countdown_${eventId}`, "active");
    } catch (error) {
      console.error("Error creating countdown:", error);
      setIsCountingDown(false);
      setAutoStartCountdown(false);
    }
  };

  const handleToggleCountdown = (checked: boolean) => {
    console.log("Countdown toggle:", checked);
    if (!formData.eventURL && checked) {
      console.warn("No eventURL");
      return;
    }

    setIsCountingDown(checked);
    setAutoStartCountdown(checked);

    if (checked && formData.eventURL) {
      const eventId = formData.eventURL.split("/").pop();
      if (eventId) {
        localStorage.removeItem(`countdown_${eventId}`);
        authenticatedRequest(
          `${API_BASE_URL}/event-countdowns/?event=${eventId}`,
          "GET"
        )
          .then((response) => {
            const countdowns = Array.isArray(response.data)
              ? response.data
              : Array.isArray(response)
              ? response
              : [];
            const activeCountdown = countdowns.find(
              (c) => c.is_active && new Date(c.target_date) > new Date()
            );
            if (!activeCountdown) {
              sendCountdownRequest(eventId);
            } else {
              setTargetDate(new Date(activeCountdown.target_date));
              localStorage.setItem(`countdown_${eventId}`, "active");
            }
          })
          .catch((error) => {
            console.error("Error checking countdowns:", error);
          });
      }
    } else {
      console.log("Stopping countdown");
      setTargetDate(undefined);
      const eventId = formData.eventURL?.split("/").pop();
      if (eventId) {
        localStorage.setItem(`countdown_${eventId}`, "completed");
      }
    }
  };

  const handleRetryCountdown = () => {
    if (!formData.eventURL) {
      return;
    }
    const eventId = formData.eventURL.split("/").pop();
    if (eventId) {
      console.log("Retrying countdown for eventId:", eventId);
      localStorage.removeItem(`countdown_${eventId}`);
      sendCountdownRequest(eventId);
    }
  };

  const handleCountdownComplete = () => {
    console.log("Countdown completed");
    setIsCountingDown(false);
    setAutoStartCountdown(false);
    setTargetDate(undefined);
    const eventId = formData.eventURL?.split("/").pop();
    if (eventId) {
      localStorage.setItem(`countdown_${eventId}`, "completed");
    }
  };

  const handleViewQR = () => {
    if (!formData.eventURL) {
      alert("Event URL not available.");
      return;
    }
    setIsQRModalOpen(true);
  };

  const handleViewSchedule = () => {
    alert("View Event Schedule functionality not yet implemented.");
  };

  const generateQRData = (): string => {
    return formData.eventURL || "https://example.com/event";
  };

  const colors = [
    { name: "Teal", color: "#025a3a" },
    { name: "Red", color: "#dc2626" },
    { name: "Blue", color: "#2563eb" },
    { name: "Green", color: "#16a34a" },
    { name: "Purple", color: "#9333ea" },
    { name: "Orange", color: "#ea580c" },
    { name: "Pink", color: "#db2777" },
    { name: "Indigo", color: "#4f46e5" },
    { name: "Yellow", color: "#ca8a04" },
    { name: "Emerald", color: "#059669" },
    { name: "Gray", color: "#6b7280" },
  ];

  const handleColorSelect = (color: string) => {
    updateFormData({ cardColor: color });
  };

  const PreviewCard = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <Stack>
      <Text className={styles.previewLabel}>{title}</Text>
      <Card className={styles.card}>
        <Flex className={styles.cardFlex}>
          <Image
            src="/images/Kuepass.svg"
            alt="KueLogo"
            className={styles.cardIMG}
          />
          <Flex gap={16}>
            <Image
              src="/images/faith.png"
              alt="Faith Image"
              className={styles.cardIMG}
            />
            <Image
              src="/images/parent.png"
              alt="Parent Image"
              className={styles.cardIMG}
            />
          </Flex>
        </Flex>
        <Stack className={styles.cardevent}>
          <Image
            src={backgroundImage || "/images/placeholder.png"}
            alt="Event Banner"
            className={styles.bannerImage}
            fallbackSrc="/images/placeholder.png"
            style={{ width: "100%", height: "220px", objectFit: "cover" }}
          />
          <Card
            className={styles.cardDetails}
            style={{ backgroundColor: rgbaColor }}
          >
            <Text className={styles.cardCooking}>
              {formData.title || "Event Title"}
            </Text>
            <Text className={styles.cardTime}>
              {formData.startDate && formData.startTime
                ? `${new Date(
                    `${formData.startDate}T${formData.startTime}`
                  ).toLocaleString()}`
                : "Event Date and Time"}
            </Text>
            <Text className={styles.cardAddress}>
              {formData.location === "Physical"
                ? formData.address || "Event Address"
                : "Virtual Event"}
            </Text>
          </Card>
        </Stack>
        <div className={styles.description}>
          <Text className={styles.cardDescription}>Description</Text>
          <Text className={styles.cardText}>
            {formData.description || "Event Description will appear here."}
          </Text>
        </div>
        {children}
      </Card>
    </Stack>
  );

  return (
    <div className={styles.container}>
      <div className={styles.sectionHeader}>
        <Text className={styles.sectionTitle}>Event Appearance</Text>
        <Text className={styles.sectionSubtitle}>
          Customize how your event will look to attendees
        </Text>
      </div>

      <Flex className={styles.flex}>
        <PreviewCard title="Event Card Preview">
          <></>
        </PreviewCard>

        <PreviewCard title="Event Page Preview">
          <>
            {showCountdown && targetDate && (
              <Flex className={styles.cardCountdown}>
                {targetDate > new Date() ? (
                  <CountdownTimer
                    targetDate={targetDate}
                    size="small"
                    onComplete={handleCountdownComplete}
                  />
                ) : (
                  <Text>Event has started!</Text>
                )}
              </Flex>
            )}
            <Flex className={styles.flexQRSchedule}>
              <Button
                className={styles.yourQR}
                style={{ backgroundColor: rgbaColor }}
                onClick={handleViewQR}
              >
                View Your QR
              </Button>
              <Button
                className={styles.youSchedule}
                style={{ backgroundColor: rgbaColor }}
                onClick={handleViewSchedule}
              >
                View Schedule
              </Button>
            </Flex>
          </>
        </PreviewCard>
      </Flex>

      {!previewOnly && (
        <>
          <Flex className={styles.eventsFlex}>
            <div className={styles.eventsShow}>
              <Group className={styles.controlGroup}>
                <Button
                  className={styles.controlButton}
                  onClick={handleSetEventImage}
                  disabled={isLoading}
                >
                  {isLoading && <span className={styles.loadingSpinner}></span>}
                  Set Event Image
                </Button>
                <Button className={styles.controlButton} disabled={isLoading}>
                  Set Event Schedule
                </Button>
                <Button
                  className={styles.controlButton}
                  onClick={handleRetryCountdown}
                  disabled={!formData.eventURL || isLoading}
                >
                  Retry Countdown
                </Button>
              </Group>

              <div className={styles.switchContainer}>
                <Text className={styles.switchLabel}>Start Countdown</Text>
                <Switch
                  checked={isCountingDown}
                  onChange={(event) =>
                    handleToggleCountdown(event.currentTarget.checked)
                  }
                  disabled={!formData.eventURL}
                />
              </div>
            </div>

            <div className={styles.eventColor}>
              <Text className={styles.textColor}>
                Select Card Background Color
              </Text>
              <div className={styles.colorGrid}>
                {colors.map((color) => (
                  <Tooltip label={color.name} key={color.name}>
                    <div
                      className={`${styles.colorOption} ${
                        formData.cardColor === color.color
                          ? styles.selected
                          : ""
                      }`}
                      style={{ backgroundColor: color.color }}
                      onClick={() => handleColorSelect(color.color)}
                    >
                      {formData.cardColor === color.color && (
                        <IconCheck
                          size={20}
                          color="#fff"
                          style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                          }}
                        />
                      )}
                    </div>
                  </Tooltip>
                ))}
              </div>
            </div>
          </Flex>

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleImageSelect}
          />
        </>
      )}

      <Modal
        opened={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        title={<Text className={styles.modalTitle}>Your Event QR Code</Text>}
        centered
        size="md"
      >
        <Flex className={styles.QRflex}>
          <QRCode value={generateQRData()} size={256} />
          <Text className={styles.QRflexText}>
            Scan this QR code to access your event!
          </Text>
        </Flex>
      </Modal>
    </div>
  );
};

export default AppearanceStep;
