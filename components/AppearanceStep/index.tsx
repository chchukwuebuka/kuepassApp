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

interface AppearanceStepProps {
  formData: EventFormData;
  updateFormData: (update: Partial<EventFormData>) => void;
}

const AppearanceStep: React.FC<AppearanceStepProps> = ({
  formData,
  updateFormData,
}) => {
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [cardDetailsColor, setCardDetailsColor] = useState<string>("#FF0000");
  const [targetDate, setTargetDate] = useState<Date | undefined>(undefined);
  const [isCountingDown, setIsCountingDown] = useState<boolean>(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (formData.appearance) {
      setBackgroundImage(formData.appearance);
    }
  }, [formData.appearance]);

  const handleSetEventImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          setBackgroundImage(result);
          updateFormData({
            appearance: result,
          });
        };
        reader.readAsDataURL(file);
      } else {
        alert("Please select a valid image file.");
      }
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

  const rgbaColor = getRgbaColor(cardDetailsColor);

  const handleToggleCountdown = (checked: boolean) => {
    if (checked) {
      const durationInSeconds = 3600;
      const newTargetDate = new Date(
        new Date().getTime() + durationInSeconds * 1000
      );
      setTargetDate(newTargetDate);
      setIsCountingDown(true);
    } else {
      setTargetDate(undefined);
      setIsCountingDown(false);
    }
  };

  const handleCountdownComplete = () => {
    setIsCountingDown(false);
    setTargetDate(undefined);
    alert("Countdown has completed!");
  };

  const handleViewQR = () => {
    setIsQRModalOpen(true);
  };

  const generateQRData = (): string => {
    return formData.eventURL || "https://example.com/event";
  };

  return (
    <div>
      <Flex className={styles.flex}>
        {/* Event Description Preview */}
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
        {/* Event Sub-page Preview */}
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
                    ? formData.address || "Event Address"
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
          >
            Set Event Image
          </Button>
          <Button variant="outline" radius="xl" color="teal">
            Set Event Schedule
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
                    cardDetailsColor === color.color
                      ? "2px solid #000"
                      : "2px solid transparent",
                }}
                onClick={() => setCardDetailsColor(color.color)}
              >
                {cardDetailsColor === color.color && (
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
        onChange={handleImageUpload}
      />
      {/* QR Code Modal */}
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
