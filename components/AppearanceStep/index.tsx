

'use strict';

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

interface AppearanceStepProps {
  formData: EventFormData;
  updateFormData: (update: Partial<EventFormData>) => void;
  onFileSelect: (file: File | null) => void;
  previewOnly?: boolean;
  showCountdown?: boolean;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://keupass-48c2ae65f897.herokuapp.com/api";

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
    console.log("Processing cardColor:", hex);
    const rgb = hexToRgb(hex);
    if (rgb) {
      const [r, g, b] = rgb;
      const opacity = hex.toLowerCase() === "#ffffff" ? 0.8 : 0.5;
      const rgba = `rgba(${r}, ${g}, ${b}, ${opacity})`;
      console.log("Converted to RGBA:", rgba);
      return rgba;
    }
    console.warn("Invalid hex color, using default teal");
    return "rgba(2, 90, 58, 0.5)"; // Teal
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync backgroundImage with formData.appearance
  useEffect(() => {
    console.log("formData.appearance:", formData.appearance);
    setBackgroundImage(formData.appearance || null);
  }, [formData.appearance]);

  // Update rgbaColor when formData.cardColor changes
  useEffect(() => {
    console.log("formData.cardColor changed:", formData.cardColor);
    const newRgbaColor = getRgbaColor(formData.cardColor || "#025a3a");
    console.log("Updating rgbaColor:", newRgbaColor);
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
              const target = new Date(`${formData.startDate}T${formData.startTime}:00Z`);
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
            const target = new Date(`${formData.startDate}T${formData.startTime}:00Z`);
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
        console.log("Checking if countdown creation is needed for eventId:", eventId);
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

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Url = reader.result as string;
      console.log("Base64 URL:", base64Url);
      setBackgroundImage(base64Url);
    };
    reader.readAsDataURL(file);

    onFileSelect(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const colors = [
    { name: "Red", color: "#FF0000" },
    { name: "Green", color: "#00FF00" },
    { name: "Blue", color: "#0000FF" },
    { name: "Yellow", color: "#FFFF00" },
    { name: "Purple", color: "#800080" },
    { name: "Orange", color: "#FFA500" },
    { name: "Teal", color: "#008080" },
    { name: "Pink", color: "#FFC0CB" },
    { name: "Cyan", color: "#00FFFF" },
    { name: "Magenta", color: "#FF00FF" },
    { name: "White", color: "#FFFFFF" },
  ];

  const sendCountdownRequest = async (eventId: string) => {
    if (
      !eventId ||
      !eventId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
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

  const handleColorSelect = (color: string) => {
    console.log("Color selected:", color);
    updateFormData({ cardColor: color });
  };

  return (
    <div>
      <Flex className={styles.flex}>
        <Stack>
          <Text>Event Description Preview</Text>
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
                onError={(e) => console.error("Banner image error:", e)}
                style={{ width: "100%", height: "100px", objectFit: "cover" }}
              />
              <Card
                className={styles.cardDetails}
                style={{
                  backgroundColor: rgbaColor,
                }}
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
          </Card>
        </Stack>
        <Stack>
          <Text>Event Sub-page Preview</Text>
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
                onError={(e) => console.error("Banner image error:", e)}
                style={{ width: "100%", height: "100px", objectFit: "cover" }}
              />
              <Card
                className={styles.cardDetails}
                style={{
                  backgroundColor: rgbaColor,
                }}
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
                style={{
                  backgroundColor: rgbaColor,
                }}
                onClick={handleViewQR}
              >
                View Your QR
              </Button>
              <Button
                className={styles.youSchedule}
                style={{
                  backgroundColor: rgbaColor,
                }}
                onClick={handleViewSchedule}
              >
                View Event Schedule
              </Button>
            </Flex>
          </Card>
        </Stack>
      </Flex>

      {!previewOnly && (
        <>
          <Flex
            className={styles.eventsShow}
            gap="md"
            style={{ marginTop: "20px" }}
          >
            <Group>
              <Button
                variant="outline"
                radius="xl"
                color="teal"
                onClick={handleSetEventImage}
                type="button"
              >
                Set Event Image
              </Button>
              <Button
                variant="outline"
                radius="xl"
                color="teal"
                type="button"
              >
                Set Event Schedule
              </Button>
              <Button
                variant="outline"
                radius="xl"
                color="teal"
                onClick={handleRetryCountdown}
                disabled={!formData.eventURL}
                type="button"
              >
                Retry Countdown
              </Button>
            </Group>
            <Flex align="center">
              <span style={{ marginRight: "10px", fontWeight: "500" }}>
                Start Countdown
              </span>
              <Switch
                checked={isCountingDown}
                onChange={(event) =>
                  handleToggleCountdown(event.currentTarget.checked)
                }
                disabled={!formData.eventURL}
              />
            </Flex>
          </Flex>

          <div className={styles.eventColor} style={{ marginTop: "20px" }}>
            <Text className={styles.textColor}>Select Card Background Color:</Text>
            <Group>
              {colors.map((color) => (
                <Tooltip label={color.name} key={color.name}>
                  <ActionIcon
                    size={32}
                    radius="xl"
                    color="transparent"
                    style={{
                      backgroundColor: color.color,
                      border:
                        formData.cardColor === color.color
                          ? "2px solid #000"
                          : "2px solid transparent",
                    }}
                    onClick={() => handleColorSelect(color.color)}
                  >
                    {formData.cardColor === color.color && (
                      <IconCheck size={16} color="#fff" />
                    )}
                  </ActionIcon>
                </Tooltip>
              ))}
            </Group>
          </div>
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