"use client";

import { useState } from "react";
import { Button, TextInput, Stack, Text, Card, Group } from "@mantine/core";
import { IconExternalLink, IconQrcode } from "@tabler/icons-react";

export default function TestUserNavigation() {
  const [testUserId, setTestUserId] = useState("NCF9H");

  const testDirectNavigation = () => {
    const url = `/user/${testUserId}`;
    console.log("Testing direct navigation to:", url);
    window.open(url, "_blank");
  };

  const testQueryNavigation = () => {
    const url = `/?userId=${testUserId}`;
    console.log("Testing query navigation to:", url);
    window.open(url, "_blank");
  };

  const testQRRedirect = () => {
    const url = `/qr-redirect?userId=${testUserId}`;
    console.log("Testing QR redirect to:", url);
    window.open(url, "_blank");
  };

  const copyURLs = () => {
    const baseUrl = window.location.origin;
    const urls = {
      direct: `${baseUrl}/user/${testUserId}`,
      query: `${baseUrl}/?userId=${testUserId}`,
      qrRedirect: `${baseUrl}/qr-redirect?userId=${testUserId}`,
    };

    const urlText = `Direct URL: ${urls.direct}\nQuery URL: ${urls.query}\nQR Redirect URL: ${urls.qrRedirect}`;
    navigator.clipboard.writeText(urlText);
    alert("URLs copied to clipboard!");
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <Card shadow="sm" padding="xl" radius="md">
        <Stack gap="lg">
          <Group gap="sm">
            <IconQrcode size="1.5rem" />
            <Text size="xl" fw={700}>
              Test User Navigation
            </Text>
          </Group>

          <Text size="sm" c="dimmed">
            Test different navigation methods to the user profile page. This
            helps verify that the dynamic route is working correctly.
          </Text>

          <TextInput
            label="Test User ID"
            placeholder="Enter user ID to test"
            value={testUserId}
            onChange={(event) => setTestUserId(event.currentTarget.value)}
          />

          <Stack gap="md">
            <Button
              onClick={testDirectNavigation}
              leftSection={<IconExternalLink size="1rem" />}
              fullWidth
            >
              Test Direct Navigation (/user/{testUserId})
            </Button>

            <Button
              onClick={testQueryNavigation}
              leftSection={<IconExternalLink size="1rem" />}
              variant="outline"
              fullWidth
            >
              Test Query Navigation (/?userId={testUserId})
            </Button>

            <Button
              onClick={testQRRedirect}
              leftSection={<IconExternalLink size="1rem" />}
              variant="outline"
              fullWidth
            >
              Test QR Redirect (/qr-redirect?userId={testUserId})
            </Button>

            <Button onClick={copyURLs} variant="light" fullWidth>
              Copy All URLs for External QR Code
            </Button>
          </Stack>

          <Card padding="md" radius="md" style={{ backgroundColor: "#f8f9fa" }}>
            <Text size="sm" c="dimmed">
              <strong>For External QR Code Generation:</strong>
              <br />
              Use one of these URL formats in your external app:
              <br />
              <br />
              <strong>Recommended:</strong> https://kuepass.com/user/
              {testUserId}
              <br />
              <strong>Alternative 1:</strong> https://kuepass.com/?userId=
              {testUserId}
              <br />
              <strong>Alternative 2:</strong>{" "}
              https://kuepass.com/qr-redirect?userId={testUserId}
              <br />
              <br />
              <strong>Expected Results:</strong>
              <br />
              • All formats should show the user profile page
              <br />
              • Query and QR redirect formats will redirect to the direct format
              <br />• Check browser console for debugging logs
            </Text>
          </Card>
        </Stack>
      </Card>
    </div>
  );
}
