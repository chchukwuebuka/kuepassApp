"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Modal,
  Container,
  Text,
  Group,
  Stack,
  Loader,
  Center,
  Alert,
  Button,
  Image,
  Card,
  Divider,
  Badge,
} from "@mantine/core";
import {
  IconX,
  IconQrcode,
  IconDownload,
  IconCheck,
  IconAlertCircle,
} from "@tabler/icons-react";
import html2canvas from "html2canvas";
import styles from "./styles.module.css";

interface QRCodeData {
  attendee_id: string;
  name: string;
  email: string;
  title?: string;
  institution?: string;
  event_title: string;
  event_id: string;
  qr_code_base64: string;
  check_in_url: string;
  ticket_code: string;
  registration_date: string;
  is_validated: boolean;
  validated_at?: string;
  seats?: string[];
}

interface QRCodePopupProps {
  show: boolean;
  onClose: () => void;
  attendeeId?: string;
  email?: string;
  eventId?: string;
  onRetry?: () => void;
}

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://api.kuepass.com/api/"
).replace(/\/$/, "");

export default function QRCodePopup({
  show,
  onClose,
  attendeeId,
  email,
  eventId,
  onRetry,
}: QRCodePopupProps) {
  const [qrData, setQrData] = useState<QRCodeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);

  const fetchQRCode = useCallback(async () => {
    console.log("QRCodePopup: Starting fetchQRCode with params:", {
      attendeeId,
      email,
      eventId,
    });
    setLoading(true);
    setError(null);

    try {
      let url = `${API_BASE_URL}/attendee-qr-code/`;

      // Build query parameters with priority order
      const params = new URLSearchParams();

      // Priority 1: If we have attendeeId, use it directly
      if (attendeeId) {
        params.append("attendee_id", attendeeId);
        console.log("QRCodePopup: Using attendeeId for lookup");
      }
      // Priority 2: If we have email and eventId, use them
      else if (email && eventId) {
        params.append("email", email);
        params.append("event_id", eventId);
        console.log("QRCodePopup: Using email and eventId for lookup");
      }
      // Priority 3: If we only have eventId, try to find the most recent registration
      else if (eventId) {
        params.append("event_id", eventId);
        console.log("QRCodePopup: Using only eventId for lookup");
      } else {
        throw new Error("Insufficient parameters to fetch QR code");
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      console.log("QRCodePopup: Fetching from URL:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      console.log("QRCodePopup: Response status:", response.status);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(
            "QR code not found for this attendee. Please check your registration details."
          );
        }
        if (response.status === 400) {
          throw new Error("Invalid parameters provided for QR code lookup");
        }
        if (response.status === 500) {
          throw new Error(
            "Server error occurred while fetching QR code. Please try again later."
          );
        }
        throw new Error(`Failed to fetch QR code: ${response.status}`);
      }

      const data = await response.json();
      console.log("QRCodePopup: Response data:", data);

      if (data.success && data.data) {
        setQrData(data.data);
        console.log("QRCodePopup: QR data set successfully");
      } else {
        throw new Error(data.message || "Failed to retrieve QR code data");
      }
    } catch (err: any) {
      console.error("QRCodePopup: Error fetching QR code:", err);
      setError(err.message || "Failed to load QR code");
    } finally {
      setLoading(false);
    }
  }, [attendeeId, email, eventId]);

  useEffect(() => {
    // Check if we have sufficient parameters to fetch QR code
    const hasValidParams = attendeeId || (email && eventId) || eventId;

    if (show && hasValidParams) {
      console.log("QRCodePopup: Fetching QR code with params:", {
        attendeeId,
        email,
        eventId,
      });
      fetchQRCode();
    } else {
      console.log("QRCodePopup: Not fetching QR code. Show:", show, "Params:", {
        attendeeId,
        email,
        eventId,
        hasValidParams,
      });
    }
  }, [show, attendeeId, email, eventId, fetchQRCode]);

  const downloadModalAsImage = async () => {
    if (!modalContentRef.current || !qrData) return;

    try {
      // Detect if mobile device
      const isMobile = window.innerWidth <= 768;
      const containerWidth = isMobile ? "350px" : "600px";

      // Create a temporary container with better styling for the image
      const tempContainer = document.createElement("div");
      tempContainer.style.position = "absolute";
      tempContainer.style.left = "-9999px";
      tempContainer.style.top = "0";
      tempContainer.style.width = containerWidth;
      tempContainer.style.backgroundColor = "white";
      tempContainer.style.padding = isMobile ? "20px" : "40px";
      tempContainer.style.borderRadius = "16px";
      tempContainer.style.fontFamily = "system-ui, -apple-system, sans-serif";

      // Clone the modal content
      const clonedContent = modalContentRef.current.cloneNode(
        true
      ) as HTMLElement;

      // Clean up the cloned content for better image rendering
      const buttons = clonedContent.querySelectorAll("button");
      buttons.forEach((button) => {
        button.style.display = "none";
      });

      tempContainer.appendChild(clonedContent);
      document.body.appendChild(tempContainer);

      // Capture the image
      const canvas = await html2canvas(tempContainer, {
        backgroundColor: "#ffffff",
        scale: isMobile ? 1.5 : 2,
        useCORS: true,
        allowTaint: true,
        width: parseInt(containerWidth),
        height: tempContainer.scrollHeight,
      });

      // Clean up
      document.body.removeChild(tempContainer);

      // Download the image
      const link = document.createElement("a");
      link.download = `ticket-confirmed-${qrData.attendee_id}.png`;
      link.href = canvas.toDataURL("image/png");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error capturing modal:", error);
      alert("Failed to download ticket. Please try again.");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Modal
      opened={show}
      onClose={onClose}
      title={
        <Group gap="sm">
          <IconQrcode size={24} />
          <Text fw={600} size="lg">
            Ticket confirmed!
          </Text>
        </Group>
      }
      size="lg"
      centered
      closeOnClickOutside={false}
      closeOnEscape={false}
      withCloseButton={false}
      styles={{
        content: {
          maxHeight: "90vh",
          overflow: "auto",
        },
        body: {
          padding: "1rem",
        },
      }}
    >
      <div className={styles.container} ref={modalContentRef}>
        {loading && (
          <Center style={{ height: "300px" }}>
            <Stack align="center" gap="md">
              <Loader size="xl" />
              <Text size="lg" c="dimmed">
                Generating your QR code...
              </Text>
            </Stack>
          </Center>
        )}

        {error && (
          <Center style={{ height: "300px" }}>
            <Stack align="center" gap="md" style={{ maxWidth: 400 }}>
              <Alert
                icon={<IconAlertCircle size="1rem" />}
                title="Unable to Load QR Code"
                color="red"
                variant="light"
              >
                {error}
              </Alert>
              {onRetry && (
                <Button
                  onClick={onRetry}
                  variant="outline"
                  color="red"
                  leftSection={<IconCheck size={16} />}
                >
                  Try Again
                </Button>
              )}
            </Stack>
          </Center>
        )}

        {qrData && !loading && (
          <Stack gap="lg">
            {/* Modal Title for Image Capture */}
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <Text fw={700} size="xl" style={{ marginBottom: "10px" }}>
                Ticket confirmed!
              </Text>
            </div>

            {/* Success Message */}
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <Text size="md" style={{ marginBottom: "10px" }}>
                A confirmation receipt and your e-ticket have been sent to{" "}
                <Text component="span" c="green" fw={500}>
                  {qrData?.email || "your email"}
                </Text>
              </Text>
              <Text size="sm" c="dimmed" style={{ marginBottom: "15px" }}>
                Be sure to check your spam folder if you don&apos;t see it.
              </Text>
              <Text size="sm" c="dimmed">
                If you did not receive your ticket, please email us at{" "}
                <Text component="span" c="green" fw={500}>
                  support@kuepass.com
                </Text>
              </Text>
            </div>

            {/* QR Code Display */}
            <Card className={styles.qrCard}>
              <Stack align="center" gap="md">
                <Text fw={600} size="lg" ta="center">
                  Your Event QR Code
                </Text>
                <div className={styles.qrContainer}>
                  <Image
                    src={`data:image/png;base64,${qrData.qr_code_base64}`}
                    alt="QR Code"
                    className={styles.qrImage}
                  />
                </div>
                <Text size="sm" c="dimmed" ta="center">
                  Present this QR code at the event for check-in
                </Text>
              </Stack>
            </Card>

            {/* Attendee Details */}
            <Card className={styles.detailsCard}>
              <Stack gap="md">
                <Text fw={600} size="lg">
                  Registration Details
                </Text>
                <Divider />

                <Group justify="space-between">
                  <Text fw={500}>Name:</Text>
                  <Text>{qrData.name}</Text>
                </Group>

                <Group justify="space-between">
                  <Text fw={500}>Email:</Text>
                  <Text>{qrData.email}</Text>
                </Group>

                {qrData.title && (
                  <Group justify="space-between">
                    <Text fw={500}>Title:</Text>
                    <Text>{qrData.title}</Text>
                  </Group>
                )}

                {qrData.institution && (
                  <Group justify="space-between">
                    <Text fw={500}>Institution:</Text>
                    <Text>{qrData.institution}</Text>
                  </Group>
                )}

                <Group justify="space-between">
                  <Text fw={500}>Event:</Text>
                  <Text>{qrData.event_title}</Text>
                </Group>

                {qrData.seats && qrData.seats.length > 0 && (
                  <Group justify="space-between">
                    <Text fw={500}>Seat{qrData.seats.length > 1 ? 's' : ''}:</Text>
                    <Badge color="grape" variant="light" size="lg">
                      {qrData.seats.join(', ')}
                    </Badge>
                  </Group>
                )}

                <Group justify="space-between">
                  <Text fw={500}>Ticket Code:</Text>
                  <Badge color="blue" variant="light">
                    {qrData.ticket_code}
                  </Badge>
                </Group>

                <Group justify="space-between">
                  <Text fw={500}>Registration Date:</Text>
                  <Text size="sm">{formatDate(qrData.registration_date)}</Text>
                </Group>

                <Group justify="space-between">
                  <Text fw={500}>Status:</Text>
                  <Badge
                    color={qrData.is_validated ? "green" : "orange"}
                    variant="light"
                  >
                    {qrData.is_validated ? "Verified" : "Pending"}
                  </Badge>
                </Group>
              </Stack>
            </Card>

            {/* Action Buttons */}
            <Group justify="center" gap="md" style={{ flexWrap: "wrap" }}>
              <Button
                leftSection={<IconDownload size={16} />}
                onClick={downloadModalAsImage}
                style={{
                  backgroundColor: "#F9C76F",
                  color: "#000",
                  borderRadius: "12px",
                  fontWeight: 500,
                  minWidth: "120px",
                }}
                fullWidth
              >
                Download
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                style={{
                  backgroundColor: "#FDF2E0",
                  color: "#000",
                  borderColor: "#F9C76F",
                  borderRadius: "12px",
                  fontWeight: 500,
                  minWidth: "120px",
                }}
                fullWidth
              >
                Return to home
              </Button>
            </Group>
          </Stack>
        )}
      </div>
    </Modal>
  );
}
