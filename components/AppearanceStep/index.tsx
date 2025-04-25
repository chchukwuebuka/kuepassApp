

"use client";
import React, { useState, useRef, useEffect } from "react";
import { EventFormData } from "../../store/types";
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
import { Check } from "tabler-icons-react";
import styles from "./styles.module.css";
import CountdownTimer from "../CountdownTimer";
import QRCode from "react-qr-code";
import { authenticatedRequest, getAuthToken } from "../../app/services/auth";

interface AppearanceStepProps {
  formData: EventFormData;
  updateFormData: (update: Partial<EventFormData>) => void;
  onFileSelect: (file: File | null) => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://keupass-48c2ae65f897.herokuapp.com/api";

const AppearanceStep: React.FC<AppearanceStepProps> = ({
  formData,
  updateFormData,
  onFileSelect,
}) => {
  const [backgroundImage, setBackgroundImage] = useState<string | null>(formData.appearance || null);
  const [targetDate, setTargetDate] = useState<Date | undefined>(undefined);
  const [isCountingDown, setIsCountingDown] = useState<boolean>(false);
  const [autoStartCountdown, setAutoStartCountdown] = useState<boolean>(true);
  const [isQRModalOpen, setIsQRModalOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setBackgroundImage(formData.appearance || null);
  }, [formData.appearance]);

  // Monitor formData.eventURL changes to trigger countdown if enabled
  useEffect(() => {
    console.log("formData.eventURL changed:", formData.eventURL);
    if (formData.eventURL && (isCountingDown || autoStartCountdown)) {
      const eventId = formData.eventURL.split("/").pop();
      console.log("Triggering countdown for eventId:", eventId);
      setIsCountingDown(true);
      sendCountdownRequest(eventId);
    }
  }, [formData.eventURL, autoStartCountdown]);

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
    if (!file) {
      alert("No file selected. Please choose an image.");
      onFileSelect(null);
      setBackgroundImage(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file (e.g., PNG, JPEG).");
      onFileSelect(null);
      setBackgroundImage(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB.");
      onFileSelect(null);
      setBackgroundImage(null);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Url = reader.result as string;
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
  ];

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
      return `rgba(${r}, ${g}, ${b}, 0.5)`;
    }
    return "rgba(255, 0, 0, 0.5)";
  };

  const rgbaColor = getRgbaColor(formData.cardColor || "#FF0000");

  const sendCountdownRequest = async (eventId: string) => {
    if (!eventId || !eventId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      console.error("Invalid event UUID:", eventId);
      alert("Invalid event ID. Please ensure the event is created.");
      setIsCountingDown(false);
      setAutoStartCountdown(false);
      return;
    }

    let target = targetDate;
    if (!target && formData.startDate && formData.startTime) {
      target = new Date(`${formData.startDate}T${formData.startTime}:00Z`);
      console.log("Using event start_date as target_date:", target.toISOString());
    }
    if (!target) {
      target = new Date();
      target.setDate(target.getDate() + 7); // Fallback: 7 days from now
      console.log("Using default target_date (7 days from now):", target.toISOString());
    }
    setTargetDate(target);

    const countdownData = {
      event: eventId,
      target_date: target.toISOString(),
      is_active: true,
    };

    console.log("Sending countdown data:", JSON.stringify(countdownData, null, 2));

    try {
      const response = await authenticatedRequest(
        `${API_BASE_URL}/event-countdowns/`,
        "POST",
        countdownData
      );
      console.log("Countdown created successfully:", response);
      alert("Countdown started successfully!");
    } catch (error: any) {
      console.error("Error creating countdown:", {
        message: error.message,
        status: error.status,
        data: error.data,
      });
      alert(`Failed to start countdown: ${error.data?.message || "Please try again."}`);
      setIsCountingDown(false);
      setAutoStartCountdown(false);
    }
  };

  const handleToggleCountdown = (checked: boolean) => {
    console.log("Countdown toggle changed:", checked);
    if (!formData.eventURL && checked) {
      console.warn("Cannot start countdown: eventURL not set");
      alert("Cannot start countdown: Event not yet created.");
      return;
    }

    setIsCountingDown(checked);
    setAutoStartCountdown(checked);

    if (checked && formData.eventURL) {
      const eventId = formData.eventURL.split("/").pop();
      console.log("Initiating countdown for eventId:", eventId);
      sendCountdownRequest(eventId);
    } else {
      console.log("Stopping countdown");
      setTargetDate(undefined);
    }
  };

  const handleRetryCountdown = () => {
    if (!formData.eventURL) {
      alert("Cannot retry countdown: Event not yet created.");
      return;
    }
    const eventId = formData.eventURL.split("/").pop();
    console.log("Retrying countdown for eventId:", eventId);
    sendCountdownRequest(eventId);
  };

  const handleCountdownComplete = () => {
    console.log("Countdown completed");
    setIsCountingDown(false);
    setAutoStartCountdown(false);
    setTargetDate(undefined);
    alert("Countdown has completed!");
  };

  const handleViewQR = () => {
    if (!formData.eventURL) {
      alert("Event URL not available. Please create the event first.");
      return;
    }
    setIsQRModalOpen(true);
  };

  const generateQRData = (): string => {
    return formData.eventURL || "https://example.com/event";
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
            <Stack
              className={styles.cardevent}
              style={{
                backgroundImage: backgroundImage
                  ? `url(${backgroundImage})`
                  : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
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
            <Stack
              className={styles.cardevent}
              style={{
                backgroundImage: backgroundImage
                  ? `url(${backgroundImage})`
                  : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
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
                    ? formData.address || " coronel Address"
                    : "Virtual Event"}
                </Text>
              </Card>
            </Stack>
            <Flex className={styles.cardCountdown}>
              <CountdownTimer
                targetDate={targetDate}
                size="small"
                onComplete={handleCountdownComplete}
              />
            </Flex>
            <Flex className={styles.flexQRSchedule}>
              <Button
                className={styles.yourQR}
                style={{
                  backgroundColor: rgbaColor,
                  padding: "10px",
                  borderRadius: "5px",
                }}
                onClick={handleViewQR}
              >
                View Your QR
              </Button>
              <Button
                className={styles.youSchedule}
                style={{
                  backgroundColor: rgbaColor,
                  padding: "10px",
                  borderRadius: "5px",
                }}
              >
                View Event Schedule
              </Button>
            </Flex>
          </Card>
        </Stack>
      </Flex>

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
          <Button variant="outline" radius="xl" color="teal" type="button">
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
                onClick={() => updateFormData({ cardColor: color.color })}
              >
                {formData.cardColor === color.color && (
                  <Check size={16} color="#fff" />
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