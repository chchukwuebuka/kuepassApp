"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"

export const dynamic = 'force-dynamic';
import {
  Center,
  Text,
  Title,
  Paper,
  Button,
  Group,
  Alert,
  Loader,
  Stack,
  ThemeIcon,
  Box,
  Badge,
  Divider,
  Card,
  Grid,
  Anchor,
  Container,
} from "@mantine/core"
import {
  IconAlertCircle,
  IconHome,
  IconRefresh,
  IconMail,
  IconCreditCard,
  IconPhone,
  IconArrowLeft,
} from "@tabler/icons-react"
import Link from "next/link"

function PaymentFailedContent() {
  const searchParams = useSearchParams()
  const [reference, setReference] = useState<string | null>(null)
  const [errorReason, setErrorReason] = useState<string | null>(null)

  useEffect(() => {
    const ref = searchParams.get("reference")
    const err = searchParams.get("error") || searchParams.get("reason")

    setReference(ref)
    setErrorReason(err)

    console.error("Payment failed or was cancelled. Reference:", ref, "Reason:", err)
  }, [searchParams])

  let message = "Your payment could not be processed or was cancelled."
  let errorType = "general"

  if (errorReason) {
    if (errorReason === "paystack_declined") {
      message = "The payment was not successful via Paystack. Please try again or use a different payment method."
      errorType = "declined"
    } else if (
      errorReason === "server_error" ||
      errorReason === "internal_payment_not_found" ||
      errorReason === "attendee_missing"
    ) {
      message =
        "There was an issue verifying your payment. Please contact support with your transaction reference if payment was made."
      errorType = "server"
    } else if (errorReason === "missing_reference" || errorReason === "metadata_issue") {
      message = "There was an issue with the payment details. Please contact support."
      errorType = "data"
    }
  }

  const supportOptions = [
    {
      icon: IconMail,
      title: "Email Support",
      description: "Get help via email",
      action: "mailto:support@yourapp.com",
      color: "blue",
    },
    {
      icon: IconPhone,
      title: "Call Support",
      description: "Speak with our team",
      action: "tel:+1234567890",
      color: "green",
    },
    {
      icon: IconRefresh,
      title: "Try Again",
      description: "Retry your payment",
      action: "/payment/retry",
      color: "orange",
    },
  ]

  return (
    <Box
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
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
          {/* Decorative elements */}
          <Box
            style={{
              position: "absolute",
              top: "-50px",
              right: "-50px",
              width: "100px",
              height: "100px",
              background: "linear-gradient(45deg, #ff6b6b, #ee5a24)",
              borderRadius: "50%",
              opacity: 0.1,
              zIndex: 0,
            }}
          />

          <Stack gap="xl" style={{ position: "relative", zIndex: 1 }}>
            {/* Header */}
            <Center>
              <ThemeIcon
                size={80}
                radius="xl"
                variant="gradient"
                gradient={{ from: "red", to: "orange" }}
                style={{
                  boxShadow: "0 8px 32px rgba(255, 107, 107, 0.3)",
                }}
              >
                <IconAlertCircle size={40} />
              </ThemeIcon>
            </Center>

            <Stack gap="md" align="center">
              <Badge
                size="lg"
                variant="light"
                color="red"
                radius="xl"
                style={{
                  textTransform: "none",
                  fontSize: "0.875rem",
                  padding: "0.5rem 1rem",
                }}
              >
                Payment Failed
              </Badge>

              <Title
                order={1}
                ta="center"
                size={{ base: "h2", sm: "h1" }}
                style={{
                  background: "linear-gradient(45deg, #ff6b6b, #ee5a24)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontWeight: 700,
                  lineHeight: 1.2,
                }}
              >
                Payment Unsuccessful
              </Title>
            </Stack>

            {/* Error Alert */}
            <Alert
              icon={<IconAlertCircle size="1.2rem" />}
              title="Transaction Issue"
              color="red"
              radius="lg"
              style={{
                border: "1px solid rgba(255, 107, 107, 0.2)",
                background: "rgba(255, 107, 107, 0.05)",
              }}
            >
              <Text size="sm" style={{ lineHeight: 1.6 }}>
                {message}
              </Text>
            </Alert>

            {/* Transaction Reference */}
            {reference && (
              <Card
                padding="md"
                radius="lg"
                style={{
                  background: "rgba(108, 117, 125, 0.05)",
                  border: "1px solid rgba(108, 117, 125, 0.1)",
                }}
              >
                <Group gap="xs">
                  <IconCreditCard size={16} color="#6c757d" />
                  <Text size="sm" c="dimmed">
                    Transaction Reference:
                  </Text>
                </Group>
                <Text size="sm" fw={600} mt="xs" style={{ fontFamily: "monospace" }}>
                  {reference}
                </Text>
              </Card>
            )}

            <Divider
              label="What would you like to do?"
              labelPosition="center"
              style={{
                "& .mantine-Divider-label": {
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "#495057",
                },
              }}
            />

            {/* Support Options */}
            <Grid gutter="md">
              {supportOptions.map((option, index) => (
                <Grid.Col key={index} span={{ base: 12, sm: 4 }}>
                  <Card
                    component={option.action.startsWith("http") || option.action.startsWith("/") ? Link : "a"}
                    href={option.action}
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
                      <ThemeIcon size={50} radius="xl" variant="light" color={option.color}>
                        <option.icon size={24} />
                      </ThemeIcon>
                      <Text fw={600} ta="center" size="sm">
                        {option.title}
                      </Text>
                      <Text size="xs" c="dimmed" ta="center">
                        {option.description}
                      </Text>
                    </Stack>
                  </Card>
                </Grid.Col>
              ))}
            </Grid>

            {/* Primary Actions */}
            <Group justify="center" gap="md">
              <Button
                component={Link}
                href="/"
                variant="light"
                leftSection={<IconHome size={16} />}
                radius="xl"
                size="md"
              >
                Go to Homepage
              </Button>
              <Button
                onClick={() => window.history.back()}
                variant="outline"
                leftSection={<IconArrowLeft size={16} />}
                radius="xl"
                size="md"
              >
                Go Back
              </Button>
            </Group>

            {/* Footer */}
            <Stack gap="xs" align="center">
              <Text size="sm" c="dimmed" ta="center">
                If funds were deducted, please contact support immediately
              </Text>
              <Group gap="xs">
                <Anchor href="mailto:support@yourapp.com" size="sm">
                  support@yourapp.com
                </Anchor>
                <Text size="sm" c="dimmed">
                  •
                </Text>
                <Anchor href="/help" size="sm">
                  Help Center
                </Anchor>
              </Group>
            </Stack>
          </Stack>
        </Paper>
      </Container>
    </Box>
  )
}

export default function PaymentFailedPage() {
  return (
    <Suspense
      fallback={
        <Center style={{ height: "100vh" }}>
          <Loader size="lg" />
        </Center>
      }
    >
      <PaymentFailedContent />
    </Suspense>
  )
}
