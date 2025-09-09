"use client";

import React, { useState, useEffect } from "react";
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
}

interface QRCodePopupProps {
  show: boolean;
  onClose: () => void;
  attendeeId?: string;
  email?: string;
  eventId?: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://keupass-48c2ae65f897.herokuapp.com/api";

export default function QRCodePopup({
  show,
  onClose,
  attendeeId,
  email,
  eventId,
}: QRCodePopupProps) {
  const [qrData, setQrData] = useState<QRCodeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (show && (attendeeId || (email && eventId))) {
      fetchQRCode();
    }
  }, [show, attendeeId, email, eventId]);

  const fetchQRCode = async () => {
    setLoading(true);
    setError(null);

    try {
      let url = `${API_BASE_URL}/attendee-qr-code/`;

      // Build query parameters
      const params = new URLSearchParams();
      if (attendeeId) {
        params.append("attendee_id", attendeeId);
      }
      if (email) {
        params.append("email", email);
      }
      if (eventId) {
        params.append("event_id", eventId);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("QR code not found for this attendee");
        }
        if (response.status === 400) {
          throw new Error("Missing required parameters");
        }
        throw new Error(`Failed to fetch QR code: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        setQrData(data.data);
      } else {
        throw new Error(data.message || "Failed to retrieve QR code data");
      }
    } catch (err: any) {
      console.error("Error fetching QR code:", err);
      setError(err.message || "Failed to load QR code");
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrData?.qr_code_base64) return;

    const link = document.createElement("a");
    link.href = `data:image/png;base64,${qrData.qr_code_base64}`;
    link.download = `qr-code-${qrData.attendee_id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            Registration Successful!
          </Text>
        </Group>
      }
      size="lg"
      centered
      closeOnClickOutside={false}
      closeOnEscape={false}
      withCloseButton={false}
    >
      <div className={styles.container}>
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
            <Alert
              icon={<IconAlertCircle size="1rem" />}
              title="Error"
              color="red"
              variant="light"
              style={{ maxWidth: 400 }}
            >
              {error}
            </Alert>
          </Center>
        )}

        {qrData && !loading && (
          <Stack gap="lg">
            {/* Success Message */}
            <Alert
              icon={<IconCheck size="1rem" />}
              title="Registration Complete!"
              color="green"
              variant="light"
            >
              You have been successfully registered for the event. Your QR code
              is ready!
            </Alert>

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
            <Group justify="center" gap="md">
              <Button
                leftSection={<IconDownload size={16} />}
                onClick={downloadQRCode}
                variant="outline"
              >
                Download QR Code
              </Button>
              <Button onClick={onClose} leftSection={<IconCheck size={16} />}>
                Done
              </Button>
            </Group>
          </Stack>
        )}
      </div>
    </Modal>
  );
}
