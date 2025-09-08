"use client";

import React from "react";
import { Container, Stack, Title, Text, Group, Card } from "@mantine/core";
import { IconQrcode, IconUser } from "@tabler/icons-react";
import QRCodeGenerator from "@/components/QRCodeGenerator";
import styles from "./styles.module.css";

export default function QRDemoPage() {
  return (
    <Container size="lg" className={styles.container}>
      <Stack gap="xl">
        {/* Header */}
        <Group gap="md" justify="center" className={styles.header}>
          <IconQrcode size="2rem" className={styles.headerIcon} />
          <div>
            <Title order={1} className={styles.title}>
              QR Code Generator
            </Title>
            <Text size="lg" c="dimmed" className={styles.subtitle}>
              Create QR codes for user profiles
            </Text>
          </div>
        </Group>

        {/* Instructions */}
        <Card padding="lg" radius="md" className={styles.instructionsCard}>
          <Stack gap="md">
            <Title order={3} className={styles.instructionsTitle}>
              How it works
            </Title>
            <Stack gap="sm">
              <Group gap="sm">
                <div className={styles.stepNumber}>1</div>
                <Text>
                  Enter a user ID (like "WNH5VG") in the input field below
                </Text>
              </Group>
              <Group gap="sm">
                <div className={styles.stepNumber}>2</div>
                <Text>Click "Generate QR Code" to create a QR code</Text>
              </Group>
              <Group gap="sm">
                <div className={styles.stepNumber}>3</div>
                <Text>Scan the QR code with any QR scanner app</Text>
              </Group>
              <Group gap="sm">
                <div className={styles.stepNumber}>4</div>
                <Text>
                  It will navigate to the user's profile page at /user/[userId]
                </Text>
              </Group>
            </Stack>
          </Stack>
        </Card>

        {/* QR Generator Component */}
        <QRCodeGenerator />

        {/* Example */}
        <Card padding="lg" radius="md" className={styles.exampleCard}>
          <Stack gap="md">
            <Title order={3} className={styles.exampleTitle}>
              Example
            </Title>
            <Text>
              Try generating a QR code for user ID: <strong>WNH5VG</strong>
            </Text>
            <Text size="sm" c="dimmed">
              This will create a QR code that links to:{" "}
              <code>https://kuepass.com/user/WNH5VG</code>
            </Text>
          </Stack>
        </Card>

        {/* Footer */}
        <Text size="sm" c="dimmed" ta="center" className={styles.footer}>
          <Group gap="xs" justify="center">
            <IconUser size="1rem" />
            <span>Powered by Kuepass - User Profile QR Codes</span>
          </Group>
        </Text>
      </Stack>
    </Container>
  );
}
