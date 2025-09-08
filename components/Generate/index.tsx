"use client";

import { useState, useEffect } from "react";
import { authenticatedRequest } from "@/app/services/auth";
import {
  Stack,
  Loader,
  Center,
  Text,
  Button,
  Tabs,
  Card,
  Group,
  Code,
  Textarea,
  Title,
  Alert,
  Badge,
  Paper,
  ThemeIcon,
  Progress,
  ActionIcon,
  Tooltip,
  Grid,
  Container,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconSparkles,
  IconBrandInstagram,
  IconBrandFacebook,
  IconBrandX,
  IconMail,
  IconCalendar,
  IconTargetArrow,
  IconCopy,
  IconShare,
  IconCurrencyDollar,
  IconClock,
  IconRocket,
} from "@tabler/icons-react";
import styles from "./styles.module.css";

// API base URL configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://keupass-48c2ae65f897.herokuapp.com/api";

// Interfaces for type safety
interface MarketingPlan {
  socialMediaStrategy: {
    platforms: string[];
    postFrequency: string;
    captionTemplates: {
      theme: string;
      caption: string;
    }[];
  };
  emailSequence: {
    name: string;
    subject: string;
    body: string;
    send_timing: string;
  }[];
  advertisingPlan: {
    suggestedPlatforms: string[];
    budgetBreakdown: {
      platform: string;
      suggested_allocation_percent: number;
      target_audience_suggestion: string;
    }[];
  };
  marketingCalendar: {
    day: number;
    task_category: string;
    task_description: string;
  }[];
}

interface EventResponse {
  id: string;
  title: string;
  description: string;
  location: string;
  address: string;
  start_date: string;
  end_date: string;
  price: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  creator: {
    id: number;
    username: string;
    email: string;
    banner_url: string;
    profile_url: string;
    country: string;
    currency: string;
    language: string;
    active: boolean;
    phone_number: string | null;
  };
  customization: {
    id: string;
    banner_url: string;
    font: string;
    card_color: string;
    event: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    marketing_plan: MarketingPlan | null;
  };
}

interface PromotionKitProps {
  eventId: string;
}

// Sub-component for social media sharing buttons
const ShareButtons = ({
  caption,
  eventId,
}: {
  caption: string;
  eventId: string;
}) => {
  const eventUrl = `https://kuepass.com/events/${eventId}`;
  const textToShare = caption.replace(/\[EVENT_URL\]/g, eventUrl);
  const encodedText = encodeURIComponent(textToShare);
  const encodedUrl = encodeURIComponent(eventUrl);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
  };

  const [copied, setCopied] = useState(false);

  const copyForInstagram = () => {
    navigator.clipboard.writeText(textToShare);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Group spacing="xs" mt="md">
      <Button
        component="a"
        href={shareLinks.twitter}
        target="_blank"
        rel="noopener noreferrer"
        size="xs"
        variant="light"
        color="blue"
        leftIcon={<IconBrandX size={16} />}
      >
        Share on X
      </Button>
      <Button
        component="a"
        href={shareLinks.facebook}
        target="_blank"
        rel="noopener noreferrer"
        size="xs"
        variant="light"
        color="indigo"
        leftIcon={<IconBrandFacebook size={16} />}
      >
        Share on Facebook
      </Button>
      <Tooltip label={copied ? "Copied!" : "Copy for Instagram"}>
        <Button
          onClick={copyForInstagram}
          size="xs"
          variant="light"
          color="pink"
          leftIcon={<IconBrandInstagram size={16} />}
        >
          {copied ? "Copied" : "Copy for Instagram"}
        </Button>
      </Tooltip>
    </Group>
  );
};

export default function YourPromotionKitComponent({
  eventId,
}: PromotionKitProps) {++
  // State management
  const [event, setEvent] = useState<any>(null);
  const [plan, setPlan] = useState<MarketingPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Fetch event data and extract marketing plan
  useEffect(() => {
    const fetchEventAndPlan = async () => {
      if (!eventId) {
        setIsLoading(false);
        setPlan(null);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        // Fetch the event
        const eventResponse = await authenticatedRequest<any>(
          `${API_BASE_URL}/events/${eventId}/`,
          "GET"
        );
        setEvent(eventResponse.data || eventResponse); // adjust if your API wraps in .data
        // Check for marketing plan in customization
        const planFromEvent =
          eventResponse.data?.customization?.marketing_plan ||
          eventResponse.customization?.marketing_plan;
        setPlan(planFromEvent || null);
      } catch (err: any) {
        setError("Failed to fetch event or marketing plan.");
        setPlan(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEventAndPlan();
  }, [eventId]);

  // Generate a new marketing plan
  const handleGeneratePlan = async () => {
    if (!eventId) {
      setError(
        "No event is selected. Please choose an event from the sidebar first."
      );
      return;
    }

    setError(null);
    setIsLoading(true);
    setPlan(null);

    try {
      const response = await authenticatedRequest<MarketingPlan>(
        `${API_BASE_URL}/events/${eventId}/generate-marketing-plan/`,
        "POST",
        { marketing_budget: 50000 }
      );
      setPlan(response);
    } catch (err: any) {
      console.error("Failed to generate marketing plan:", err);
      setError(
        err.message || "An unknown error occurred while generating the plan."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Copy text to clipboard
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(type);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  // Get platform-specific icon
  const getPlatformIcon = (platform: string) => {
    const platformLower = platform.toLowerCase();
    if (platformLower.includes("instagram"))
      return <IconBrandInstagram size={20} />;
    if (platformLower.includes("facebook"))
      return <IconBrandFacebook size={20} />;
    if (platformLower.includes("twitter") || platformLower.includes("x"))
      return <IconBrandX size={20} />;
    return <IconShare size={20} />;
  };

  // Get platform-specific color
  const getPlatformColor = (platform: string) => {
    const platformLower = platform.toLowerCase();
    if (platformLower.includes("instagram")) return "pink";
    if (platformLower.includes("facebook")) return "blue";
    if (platformLower.includes("twitter") || platformLower.includes("x"))
      return "cyan";
    return "gray";
  };

  // Get task category color
  const getTaskCategoryColor = (category: string) => {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes("social")) return "blue";
    if (categoryLower.includes("email")) return "green";
    if (categoryLower.includes("ad")) return "orange";
    if (categoryLower.includes("content")) return "purple";
    return "gray";
  };

  return (
    <Container size="xl" className={styles.container}>
      <div className={styles.fadeIn}>
        {/* Loading state */}
        {isLoading && (
          <Paper
            className={styles.loadingCard}
            p="xl"
            radius="xl"
            withBorder
            mt="xl"
          >
            <Center>
              <Stack align="center" spacing="xl">
                <Loader size="xl" />
                <Text size="lg" weight={600}>
                  Loading Promotion Kit...
                </Text>
              </Stack>
            </Center>
          </Paper>
        )}

        {/* Error state */}
        {!isLoading && error && (
          <Alert
            icon={<IconAlertCircle size="1rem" />}
            title="An Error Occurred"
            color="red"
            radius="lg"
            mt="xl"
            withCloseButton
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {/* No marketing plan - show generate button */}
        {!isLoading && !error && !plan && (
          <Paper className={styles.headerCard} p="xl" radius="xl" withBorder>
            <Group position="apart" align="flex-start">
              <Stack spacing="md" style={{ flex: 1 }}>
                <Group spacing="sm">
                  <ThemeIcon
                    size="xl"
                    radius="xl"
                    className={styles.headerIcon}
                  >
                    <IconSparkles size={28} />
                  </ThemeIcon>
                  <div>
                    <Title order={1} className={styles.mainTitle}>
                      AI-Powered Promotion Kit
                    </Title>
                    <Text className={styles.subtitle}>
                      Generate a complete marketing strategy with intelligent
                      automation
                    </Text>
                  </div>
                </Group>
                <Text className={styles.description}>
                  Transform your event promotion with a single click. Our AI
                  will generate social media strategies, email campaigns,
                  advertising plans, and a daily task calendar tailored to your
                  event.
                </Text>
                <Group spacing="md">
                  <Button
                    onClick={handleGeneratePlan}
                    size="lg"
                    className={styles.generateButton}
                    leftIcon={<IconRocket size={20} />}
                  >
                    Generate Your Free Marketing Plan
                  </Button>
                </Group>
              </Stack>
            </Group>
          </Paper>
        )}

        {/* Marketing plan exists - show tabs */}
        {!isLoading && !error && plan && (
          <Paper
            className={styles.tabsContainer}
            p="xl"
            radius="xl"
            withBorder
            mt="xl"
          >
            <Tabs
              defaultValue="social"
              variant="pills"
              radius="xl"
              className={styles.tabs}
            >
              <Tabs.List className={styles.tabsList}>
                <Tabs.Tab
                  value="social"
                  icon={<IconBrandInstagram size={18} />}
                  className={styles.tab}
                >
                  Social Media
                </Tabs.Tab>
                <Tabs.Tab
                  value="email"
                  icon={<IconMail size={18} />}
                  className={styles.tab}
                >
                  Email Campaigns
                </Tabs.Tab>
                <Tabs.Tab
                  value="ads"
                  icon={<IconTargetArrow size={18} />}
                  className={styles.tab}
                >
                  Advertising
                </Tabs.Tab>
                <Tabs.Tab
                  value="calendar"
                  icon={<IconCalendar size={18} />}
                  className={styles.tab}
                >
                  Calendar
                </Tabs.Tab>
              </Tabs.List>

              {/* Social Media Tab */}
              <Tabs.Panel value="social" pt="xl">
                <Stack spacing="xl">
                  <Title order={3} className={styles.sectionTitle}>
                    Social Media Strategy
                  </Title>
                  <Grid>
                    {plan.socialMediaStrategy.captionTemplates.map(
                      (template, index) => (
                        <Grid.Col key={index} span={12} md={6}>
                          <Card
                            className={styles.templateCard}
                            p="lg"
                            radius="lg"
                          >
                            <Group position="apart" mb="md">
                              <Badge variant="dot" size="lg">
                                {template.theme}
                              </Badge>
                            </Group>
                            <Textarea
                              value={template.caption}
                              autosize
                              minRows={4}
                              readOnly
                              className={styles.textarea}
                            />
                            <ShareButtons
                              caption={template.caption}
                              eventId={eventId}
                            />
                          </Card>
                        </Grid.Col>
                      )
                    )}
                  </Grid>
                </Stack>
              </Tabs.Panel>

              {/* Email Campaigns Tab */}
              <Tabs.Panel value="email" pt="xl">
                <Stack spacing="xl">
                  <Title order={3} className={styles.sectionTitle}>
                    Email Campaign Sequence
                  </Title>
                  <Grid>
                    {plan.emailSequence.map((email, index) => (
                      <Grid.Col key={index} span={12}>
                        <Card className={styles.emailCard} p="lg" radius="lg">
                          <Group position="apart" mb="md">
                            <Group spacing="md">
                              <ThemeIcon
                                size="lg"
                                color="green"
                                variant="light"
                              >
                                <IconMail size={20} />
                              </ThemeIcon>
                              <div>
                                <Text weight={600} size="lg">
                                  {email.name}
                                </Text>
                                <Group spacing="xs">
                                  <IconClock size={14} />
                                  <Text size="sm" color="dimmed">
                                    {email.send_timing}
                                  </Text>
                                </Group>
                              </div>
                            </Group>
                            <Tooltip
                              label={
                                copiedText === `email-${index}`
                                  ? "Copied!"
                                  : "Copy email"
                              }
                            >
                              <ActionIcon
                                variant="light"
                                onClick={() =>
                                  copyToClipboard(
                                    `Subject: ${email.subject}\n\n${email.body}`,
                                    `email-${index}`
                                  )
                                }
                                color={
                                  copiedText === `email-${index}`
                                    ? "green"
                                    : "blue"
                                }
                              >
                                <IconCopy size={16} />
                              </ActionIcon>
                            </Tooltip>
                          </Group>
                          <Stack spacing="md" mt="md">
                            <div>
                              <Text weight={500} mb="xs">
                                Subject Line:
                              </Text>
                              <Code block className={styles.subjectCode}>
                                {email.subject}
                              </Code>
                            </div>
                            <div>
                              <Text weight={500} mb="xs">
                                Email Body:
                              </Text>
                              <Textarea
                                value={email.body}
                                autosize
                                minRows={4}
                                readOnly
                                className={styles.textarea}
                              />
                            </div>
                          </Stack>
                        </Card>
                      </Grid.Col>
                    ))}
                  </Grid>
                </Stack>
              </Tabs.Panel>

              {/* Advertising Tab */}
              <Tabs.Panel value="ads" pt="xl">
                <Stack spacing="xl">
                  <Title order={3} className={styles.sectionTitle}>
                    Advertising Strategy
                  </Title>
                  <Card className={styles.platformCard} p="lg" radius="lg">
                    <Group spacing="md" mb="md">
                      <ThemeIcon size="lg" color="orange" variant="light">
                        <IconCurrencyDollar size={20} />
                      </ThemeIcon>
                      <div>
                        <Text weight={600}>Recommended Ad Platforms</Text>
                      </div>
                    </Group>
                    <Group spacing="sm">
                      {plan.advertisingPlan.suggestedPlatforms.map(
                        (platform, index) => (
                          <Badge
                            key={index}
                            leftSection={getPlatformIcon(platform)}
                            color={getPlatformColor(platform)}
                            variant="light"
                            size="lg"
                          >
                            {platform}
                          </Badge>
                        )
                      )}
                    </Group>
                  </Card>
                  <Grid>
                    {plan.advertisingPlan.budgetBreakdown.map((item, index) => (
                      <Grid.Col key={index} span={12} md={6}>
                        <Card className={styles.budgetCard} p="lg" radius="lg">
                          <Group position="apart" mb="md">
                            <Group spacing="sm">
                              {getPlatformIcon(item.platform)}
                              <Text weight={600}>{item.platform}</Text>
                            </Group>
                            <Badge size="lg" color="orange" variant="light">
                              {item.suggested_allocation_percent}%
                            </Badge>
                          </Group>
                          <Progress
                            value={item.suggested_allocation_percent}
                            size="lg"
                            radius="xl"
                            mb="md"
                          />
                          <div>
                            <Text size="sm" weight={500} mb="xs">
                              Target Audience:
                            </Text>
                            <Text size="sm" color="dimmed">
                              {item.target_audience_suggestion}
                            </Text>
                          </div>
                        </Card>
                      </Grid.Col>
                    ))}
                  </Grid>
                </Stack>
              </Tabs.Panel>

              {/* Calendar Tab */}
              <Tabs.Panel value="calendar" pt="xl">
                <Stack spacing="xl">
                  <Title order={3} className={styles.sectionTitle}>
                    Marketing Calendar
                  </Title>
                  <Grid>
                    {plan.marketingCalendar.map((task, index) => (
                      <Grid.Col key={index} span={12} md={6} lg={4}>
                        <Card className={styles.taskCard} p="md" radius="lg">
                          <Group position="apart" mb="sm">
                            <Badge
                              size="lg"
                              variant="filled"
                              color="blue"
                              className={styles.dayBadge}
                            >
                              Day {task.day}
                            </Badge>
                            <Badge
                              size="sm"
                              color={getTaskCategoryColor(task.task_category)}
                              variant="light"
                            >
                              {task.task_category}
                            </Badge>
                          </Group>
                          <Text size="sm" className={styles.taskDescription}>
                            {task.task_description}
                          </Text>
                        </Card>
                      </Grid.Col>
                    ))}
                  </Grid>
                </Stack>
              </Tabs.Panel>
            </Tabs>
          </Paper>
        )}
      </div>
    </Container>
  );
}
