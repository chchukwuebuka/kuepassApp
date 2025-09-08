"use client";

import React, { useState } from "react";
import {
  Container,
  Card,
  Text,
  Group,
  Stack,
  TextInput,
  Button,
  Alert,
} from "@mantine/core";
import { IconQrcode, IconCopy } from "@tabler/icons-react";
import QRCode from "qrcode.react";
import styles from "./styles.module.css";

export default function GenerateQRPage() {
  const [userId, setUserId] = useState<string>("");
  const [qrUrl, setQrUrl] = useState<string>("");
  const [showQR, setShowQR] = useState<boolean>(false);

  const generateQR = () => {
    if (!userId.trim()) return;

    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://kuepass.com";
    const url = `${baseUrl}/user/${userId}`;
    setQrUrl(url);
    setShowQR(true);
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(qrUrl);
  };

  return (
    <Container size="md" className={styles.container}>
      <Card shadow="sm" padding="xl" radius="md" className={styles.card}>
        <Stack gap="lg">
          <Group gap="sm">
            <IconQrcode size="2rem" className={styles.icon} />
            <Text size="xl" fw={700} className={styles.title}>
              Generate User Profile QR Code
            </Text>
          </Group>

          <Text size="md" c="dimmed" className={styles.description}>
            Enter a user ID to generate a QR code that links directly to their
            profile page. When scanned, it will navigate to the user's profile
            displaying their information.
          </Text>

          <Stack gap="md">
            <TextInput
              label="User ID"
              placeholder="Enter user ID (e.g., WNH5VG)"
              value={userId}
              onChange={(event) => setUserId(event.currentTarget.value)}
              className={styles.input}
            />

            <Button
              onClick={generateQR}
              disabled={!userId.trim()}
              className={styles.generateButton}
            >
              Generate QR Code
            </Button>
          </Stack>

          {showQR && qrUrl && (
            <Card padding="lg" radius="md" className={styles.qrCard}>
              <Stack gap="md" align="center">
                <div className={styles.qrContainer}>
                  <QRCode
                    value={qrUrl}
                    size={200}
                    level="M"
                    includeMargin={true}
                  />
                </div>

                <Text
                  size="sm"
                  c="dimmed"
                  ta="center"
                  className={styles.urlText}
                >
                  {qrUrl}
                </Text>

                <Button
                  variant="light"
                  size="sm"
                  leftSection={<IconCopy size="1rem" />}
                  onClick={copyUrl}
                  className={styles.copyButton}
                >
                  Copy URL
                </Button>
              </Stack>
            </Card>
          )}

          <Alert color="blue" variant="light" className={styles.infoAlert}>
            <Text size="sm">
              <strong>Example:</strong> For user ID "WNH5VG", the QR code will
              link to:
              <br />
              <code>/user/WNH5VG</code>
            </Text>
          </Alert>
        </Stack>
      </Card>
    </Container>
  );
}
