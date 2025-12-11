"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export const dynamic = "force-dynamic";
import {
  Container,
  Title,
  Text,
  Button,
  Paper,
  Center,
  Stack,
  Group,
  Box,
  Divider,
  ThemeIcon,
  Grid,
  Card,
  Badge,
  Anchor,
  Loader,
} from "@mantine/core";
import Link from "next/link";
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconCalendarEvent,
  IconSearch,
  IconHome,
  IconClock,
  IconMapPin,
} from "@tabler/icons-react";

function EventUnavailablePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const eventTitle = searchParams.get("title");

  const quickActions = [
    {
      icon: IconCalendarEvent,
      title: "Browse Events",
      description: "Discover upcoming events",
      href: "/eventSchedule/exploreEvent",
      color: "blue",
    },
    {
      icon: IconSearch,
      title: "Search Events",
      description: "Find specific events",
      href: "/eventSchedule/search",
      color: "green",
    },
    {
      icon: IconHome,
      title: "Go Home",
      description: "Return to homepage",
      href: "/",
      color: "violet",
    },
  ];

  return (
    <Box
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <Container size="md" style={{ width: "100%" }}>
        <Paper
          shadow="xl"
          radius="xl"
          p={{ base: "md", sm: "xl", md: "2rem" }}
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative background elements */}
          <Box
            style={{
              position: "absolute",
              top: "-50px",
              right: "-50px",
              width: "100px",
              height: "100px",
              background: "linear-gradient(45deg, #1a472a, #2d5a27)",
              borderRadius: "50%",
              opacity: 0.1,
              zIndex: 0,
            }}
          />
          <Box
            style={{
              position: "absolute",
              bottom: "-30px",
              left: "-30px",
              width: "60px",
              height: "60px",
              background: "linear-gradient(45deg, #f093fb, #f5576c)",
              borderRadius: "50%",
              opacity: 0.1,
              zIndex: 0,
            }}
          />

          <Stack gap="xl" style={{ position: "relative", zIndex: 1 }}>
            {/* Header Section */}
            <Center>
              <ThemeIcon
                size={80}
                radius="xl"
                variant="gradient"
                gradient={{ from: "orange", to: "red" }}
                style={{
                  boxShadow: "0 8px 32px rgba(255, 165, 0, 0.3)",
                }}
              >
                <IconAlertTriangle size={40} />
              </ThemeIcon>
            </Center>

            <Stack gap="md" align="center">
              <Badge
                size="lg"
                variant="light"
                color="orange"
                radius="xl"
                style={{
                  textTransform: "none",
                  fontSize: "0.875rem",
                  padding: "0.5rem 1rem",
                }}
              >
                Event Not Available
              </Badge>

              <Title
                order={1}
                ta="center"
                size={{ base: "h2", sm: "h1" }}
                style={{
                  background: "linear-gradient(45deg, #1a472a, #2d5a27)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontWeight: 700,
                  lineHeight: 1.2,
                }}
              >
                Oops! Event Not Found
              </Title>

              <Text
                ta="center"
                size="lg"
                c="dark.6"
                maw={500}
                style={{ lineHeight: 1.6 }}
              >
                The event{" "}
                <Text component="span" fw={600} c="dark.8">
                  "{eventTitle || "you were looking for"}"
                </Text>{" "}
                is no longer available or may have been moved.
              </Text>

              <Group gap="xs" justify="center">
                <IconClock size={16} color="#868e96" />
                <Text size="sm" c="dimmed">
                  This might be a historical event or the link has expired
                </Text>
              </Group>
            </Stack>

            <Divider
              label="What would you like to do next?"
              labelPosition="center"
              style={{
                "& .mantine-Divider-label": {
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "#495057",
                },
              }}
            />

            {/* Quick Actions */}
            <Grid gutter="md">
              {quickActions.map((action, index) => (
                <Grid.Col key={index} span={{ base: 12, sm: 4 }}>
                  <Card
                    component={Link}
                    href={action.href}
                    padding="lg"
                    radius="lg"
                    style={{
                      textDecoration: "none",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                      border: "1px solid #e9ecef",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 8px 25px rgba(0, 0, 0, 0.1)",
                      },
                    }}
                  >
                    <Stack gap="sm" align="center">
                      <ThemeIcon
                        size={50}
                        radius="xl"
                        variant="light"
                        color={action.color}
                      >
                        <action.icon size={24} />
                      </ThemeIcon>
                      <Text fw={600} ta="center" size="sm">
                        {action.title}
                      </Text>
                      <Text size="xs" c="dimmed" ta="center">
                        {action.description}
                      </Text>
                    </Stack>
                  </Card>
                </Grid.Col>
              ))}
            </Grid>

            {/* Primary Action */}
            <Center>
              <Button
                component={Link}
                href="/eventSchedule/exploreEvent"
                size="lg"
                radius="xl"
                variant="gradient"
                gradient={{ from: "dark.4", to: "green.9" }}
                leftSection={<IconCalendarEvent size={20} />}
                style={{
                  boxShadow: "0 4px 15px rgba(0, 100, 0, 0.3)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 20px rgba(0, 100, 0, 0.4)",
                  },
                }}
              >
                Explore Available Events
              </Button>
            </Center>

            {/* Footer */}
            <Stack gap="xs" align="center">
              <Text size="sm" c="dimmed" ta="center">
                Need help finding a specific event?
              </Text>
              <Group gap="xs">
                <Anchor
                  component={Link}
                  href="/contact"
                  size="sm"
                  style={{ textDecoration: "none" }}
                >
                  Contact Support
                </Anchor>
                <Text size="sm" c="dimmed">
                  •
                </Text>
                <Anchor
                  component={Link}
                  href="/faq"
                  size="sm"
                  style={{ textDecoration: "none" }}
                >
                  FAQ
                </Anchor>
              </Group>
            </Stack>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}

export default function EventUnavailablePage() {
  return (
    <Suspense
      fallback={
        <Center style={{ height: "100vh" }}>
          <Loader size="xl" />
        </Center>
      }
    >
      <EventUnavailablePageContent />
    </Suspense>
  );
}
