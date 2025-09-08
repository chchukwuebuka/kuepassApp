"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Text,
  Group,
  Stack,
  TextInput,
  Alert,
  CopyButton,
  Tooltip,
} from "@mantine/core";
import {
  IconQrcode,
  IconCopy,
  IconDownload,
  IconShare,
} from "@tabler/icons-react";
import QRCode from "qrcode.react";
import styles from "./styles.module.css";

interface QRCodeGeneratorProps {
  userId?: string;
  baseUrl?: string;
  onQRGenerated?: (qrData: string) => void;
}

export default function QRCodeGenerator({
  userId,
  baseUrl = typeof window !== "undefined"
    ? window.location.origin
    : "https://kuepass.com",
  onQRGenerated,
}: QRCodeGeneratorProps) {
  const [qrData, setQrData] = useState<string>("");
  const [customUserId, setCustomUserId] = useState<string>(userId || "");
  const [showQR, setShowQR] = useState<boolean>(false);

  useEffect(() => {
    if (userId) {
      generateQRCode(userId);
    }
  }, [userId]);

  const generateQRCode = (userIdValue: string) => {
    if (!userIdValue.trim()) {
      setShowQR(false);
      return;
    }

    const url = `${baseUrl}/user/${userIdValue}`;
    setQrData(url);
    setShowQR(true);

    if (onQRGenerated) {
      onQRGenerated(url);
    }
  };

  const handleGenerateQR = () => {
    generateQRCode(customUserId);
  };

  const handleDownloadQR = () => {
    if (!showQR) return;

    const canvas = document.getElementById(
      "qr-code-canvas"
    ) as HTMLCanvasElement;
    if (canvas) {
      const link = document.createElement("a");
      link.download = `kuepass-qr-${customUserId || "user"}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const handleShare = async () => {
    if (!qrData) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Kuepass User Profile",
          text: "Check out this user profile on Kuepass",
          url: qrData,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(qrData);
    }
  };

  return (
    <Card shadow="sm" padding="xl" radius="md" className={styles.qrCard}>
      <Stack gap="lg">
        <Group gap="sm">
          <IconQrcode size="1.5rem" className={styles.icon} />
          <Text size="xl" fw={700} className={styles.title}>
            Generate QR Code
          </Text>
        </Group>

        <Text size="sm" c="dimmed" className={styles.description}>
          Generate a QR code that links directly to a user's profile page. When
          scanned, it will navigate to the user's profile.
        </Text>

        <Stack gap="md">
          <TextInput
            label="User ID"
            placeholder="Enter user ID (e.g., WNH5VG)"
            value={customUserId}
            onChange={(event) => setCustomUserId(event.currentTarget.value)}
            className={styles.input}
          />

          <Group gap="sm">
            <Button
              onClick={handleGenerateQR}
              disabled={!customUserId.trim()}
              className={styles.generateButton}
            >
              Generate QR Code
            </Button>

            {showQR && (
              <>
                <Button
                  variant="outline"
                  onClick={handleDownloadQR}
                  leftSection={<IconDownload size="1rem" />}
                  className={styles.downloadButton}
                >
                  Download
                </Button>

                <Button
                  variant="outline"
                  onClick={handleShare}
                  leftSection={<IconShare size="1rem" />}
                  className={styles.shareButton}
                >
                  Share
                </Button>
              </>
            )}
          </Group>
        </Stack>

        {showQR && qrData && (
          <Card padding="lg" radius="md" className={styles.qrDisplayCard}>
            <Stack gap="md" align="center">
              <div className={styles.qrContainer}>
                <QRCode
                  id="qr-code-canvas"
                  value={qrData}
                  size={200}
                  level="M"
                  includeMargin={true}
                  className={styles.qrCode}
                />
              </div>

              <Text size="sm" c="dimmed" ta="center" className={styles.qrUrl}>
                {qrData}
              </Text>

              <CopyButton value={qrData}>
                {({ copied, copy }) => (
                  <Tooltip label={copied ? "Copied!" : "Copy URL"}>
                    <Button
                      variant="light"
                      size="sm"
                      leftSection={<IconCopy size="1rem" />}
                      onClick={copy}
                      className={styles.copyButton}
                    >
                      {copied ? "Copied!" : "Copy URL"}
                    </Button>
                  </Tooltip>
                )}
              </CopyButton>
            </Stack>
          </Card>
        )}

        {!showQR && customUserId && (
          <Alert color="blue" variant="light" className={styles.infoAlert}>
            <Text size="sm">
              Click "Generate QR Code" to create a QR code for user ID:{" "}
              <strong>{customUserId}</strong>
            </Text>
          </Alert>
        )}
      </Stack>
    </Card>
  );
}
