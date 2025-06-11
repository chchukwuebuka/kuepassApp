// "use client"

// import { useEffect, useState, Suspense } from "react"
// import { useSearchParams, useRouter } from "next/navigation"
// import {
//   Center,
//   Text,
//   Title,
//   Paper,
//   Button,
//   Group,
//   Loader,
//   Stack,
//   ThemeIcon,
//   Box,
//   Badge,
//   Divider,
//   Card,
//   Grid,
//   Anchor,
//   Container,
//   Timeline,
// } from "@mantine/core"
// import {
//   IconCheck,
//   IconHome,
//   IconMail,
//   IconCalendarEvent,
//   IconTicket,
//   IconCreditCard,
//   IconClock,
// } from "@tabler/icons-react"
// import Link from "next/link"

// function PaymentSuccessContent() {
//   const searchParams = useSearchParams()
//   const router = useRouter()
//   const [reference, setReference] = useState<string | null>(null)

//   useEffect(() => {
//     const ref = searchParams.get("reference")
//     const stat = searchParams.get("status")

//     setReference(ref)

//     if (stat === "success") {
//       console.log("Payment successful for reference:", ref)
//     } else {
//       console.warn("Landed on success page, but status is not 'success':", stat)
//     }
//   }, [searchParams, router])

//   const nextSteps = [
//     {
//       icon: IconMail,
//       title: "Check Your Email",
//       description: "Confirmation details sent",
//       color: "blue",
//     },
//     {
//       icon: IconTicket,
//       title: "Download Ticket",
//       description: "Get your event ticket",
//       color: "green",
//     },
//     {
//       icon: IconCalendarEvent,
//       title: "Add to Calendar",
//       description: "Don't miss the event",
//       color: "violet",
//     },
//   ]

//   return (
//     <Box
//       style={{
//         minHeight: "100vh",
//         background: "linear-gradient(135deg, #51cf66 0%, #40c057 100%)",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         padding: "1rem",
//       }}
//     >
//       <Container size="md" style={{ width: "100%" }}>
//         <Paper
//           shadow="xl"
//           radius="xl"
//           p={{ base: "md", sm: "xl", md: "2rem" }}
//           style={{
//             background: "rgba(255, 255, 255, 0.95)",
//             backdropFilter: "blur(10px)",
//             border: "1px solid rgba(255, 255, 255, 0.2)",
//             position: "relative",
//             overflow: "hidden",
//           }}
//         >
//           {/* Decorative elements */}
//           <Box
//             style={{
//               position: "absolute",
//               top: "-50px",
//               right: "-50px",
//               width: "100px",
//               height: "100px",
//               background: "linear-gradient(45deg, #51cf66, #40c057)",
//               borderRadius: "50%",
//               opacity: 0.1,
//               zIndex: 0,
//             }}
//           />
//           <Box
//             style={{
//               position: "absolute",
//               bottom: "-30px",
//               left: "-30px",
//               width: "60px",
//               height: "60px",
//               background: "linear-gradient(45deg, #69db7c, #51cf66)",
//               borderRadius: "50%",
//               opacity: 0.1,
//               zIndex: 0,
//             }}
//           />

//           <Stack gap="xl" style={{ position: "relative", zIndex: 1 }}>
//             {/* Header */}
//             <Center>
//               <ThemeIcon
//                 size={80}
//                 radius="xl"
//                 variant="gradient"
//                 gradient={{ from: "green", to: "teal" }}
//                 style={{
//                   boxShadow: "0 8px 32px rgba(81, 207, 102, 0.3)",
//                 }}
//               >
//                 <IconCheck size={40} />
//               </ThemeIcon>
//             </Center>

//             <Stack gap="md" align="center">
//               <Badge
//                 size="lg"
//                 variant="light"
//                 color="green"
//                 radius="xl"
//                 style={{
//                   textTransform: "none",
//                   fontSize: "0.875rem",
//                   padding: "0.5rem 1rem",
//                 }}
//               >
//                 Payment Successful
//               </Badge>

//               <Title
//                 order={1}
//                 ta="center"
//                 size={{ base: "h2", sm: "h1" }}
//                 style={{
//                   background: "linear-gradient(45deg, #51cf66, #40c057)",
//                   backgroundClip: "text",
//                   WebkitBackgroundClip: "text",
//                   WebkitTextFillColor: "transparent",
//                   fontWeight: 700,
//                   lineHeight: 1.2,
//                 }}
//               >
//                 Payment Complete!
//               </Title>

//               <Text ta="center" size="lg" c="dark.6" maw={500} style={{ lineHeight: 1.6 }}>
//                 Thank you for your payment. Your registration has been confirmed and you're all set for the event!
//               </Text>
//             </Stack>

//             {/* Transaction Details */}
//             {reference && (
//               <Card
//                 padding="lg"
//                 radius="lg"
//                 style={{
//                   background: "rgba(81, 207, 102, 0.05)",
//                   border: "1px solid rgba(81, 207, 102, 0.2)",
//                 }}
//               >
//                 <Group gap="md" align="center">
//                   <ThemeIcon size={40} radius="xl" variant="light" color="green">
//                     <IconCreditCard size={20} />
//                   </ThemeIcon>
//                   <Box style={{ flex: 1 }}>
//                     <Text size="sm" c="dimmed">
//                       Transaction Reference
//                     </Text>
//                     <Text fw={600} style={{ fontFamily: "monospace" }}>
//                       {reference}
//                     </Text>
//                   </Box>
//                   <Group gap="xs">
//                     <IconClock size={16} color="#51cf66" />
//                     <Text size="sm" c="green">
//                       Completed
//                     </Text>
//                   </Group>
//                 </Group>
//               </Card>
//             )}

//             {/* What's Next Timeline */}
//             <Box>
//               <Text fw={600} size="lg" mb="md" ta="center">
//                 What happens next?
//               </Text>
//               <Timeline active={0} bulletSize={24} lineWidth={2} color="green">
//                 <Timeline.Item bullet={<IconMail size={12} />} title="Confirmation Email">
//                   <Text c="dimmed" size="sm">
//                     You'll receive a confirmation email with your ticket and event details within the next few minutes.
//                   </Text>
//                 </Timeline.Item>
//                 <Timeline.Item bullet={<IconTicket size={12} />} title="Event Access">
//                   <Text c="dimmed" size="sm">
//                     Your ticket will include QR codes and access instructions for the event.
//                   </Text>
//                 </Timeline.Item>
//                 <Timeline.Item bullet={<IconCalendarEvent size={12} />} title="Event Day">
//                   <Text c="dimmed" size="sm">
//                     Present your ticket at the event entrance or use the provided access link for virtual events.
//                   </Text>
//                 </Timeline.Item>
//               </Timeline>
//             </Box>

//             <Divider
//               label="Quick Actions"
//               labelPosition="center"
//               style={{
//                 "& .mantine-Divider-label": {
//                   fontSize: "0.875rem",
//                   fontWeight: 500,
//                   color: "#495057",
//                 },
//               }}
//             />

//             {/* Quick Actions */}
//             <Grid gutter="md">
//               {nextSteps.map((step, index) => (
//                 <Grid.Col key={index} span={{ base: 12, sm: 4 }}>
//                   <Card
//                     padding="lg"
//                     radius="lg"
//                     style={{
//                       transition: "all 0.3s ease",
//                       cursor: "pointer",
//                       border: "1px solid #e9ecef",
//                       "&:hover": {
//                         transform: "translateY(-4px)",
//                         boxShadow: "0 8px 25px rgba(0, 0, 0, 0.1)",
//                       },
//                     }}
//                   >
//                     <Stack gap="sm" align="center">
//                       <ThemeIcon size={50} radius="xl" variant="light" color={step.color}>
//                         <step.icon size={24} />
//                       </ThemeIcon>
//                       <Text fw={600} ta="center" size="sm">
//                         {step.title}
//                       </Text>
//                       <Text size="xs" c="dimmed" ta="center">
//                         {step.description}
//                       </Text>
//                     </Stack>
//                   </Card>
//                 </Grid.Col>
//               ))}
//             </Grid>

//             {/* Action Buttons */}
//             <Group justify="center" gap="md">
//               <Button
//                 component={Link}
//                 href="/"
//                 variant="light"
//                 leftSection={<IconHome size={16} />}
//                 radius="xl"
//                 size="md"
//               >
//                 Go to Homepage
//               </Button>
//               <Button
//                 component={Link}
//                 href="/eventSchedule/eventDetails"
//                 variant="gradient"
//                 gradient={{ from: "green", to: "teal" }}
//                 leftSection={<IconTicket size={16} />}
//                 radius="xl"
//                 size="md"
//                 style={{
//                   boxShadow: "0 4px 15px rgba(81, 207, 102, 0.3)",
//                 }}
//               >
//                 View My Events
//               </Button>
//             </Group>

//             {/* Footer */}
//             <Stack gap="xs" align="center">
//               <Text size="sm" c="dimmed" ta="center">
//                 Need help or have questions about your registration?
//               </Text>
//               <Group gap="xs">
//                 <Anchor href="mailto:support@yourapp.com" size="sm">
//                   Contact Support
//                 </Anchor>
//                 <Text size="sm" c="dimmed">
//                   •
//                 </Text>
//                 <Anchor href="/help" size="sm">
//                   Help Center
//                 </Anchor>
//               </Group>
//             </Stack>
//           </Stack>
//         </Paper>
//       </Container>
//     </Box>
//   )
// }

// export default function PaymentSuccessPage() {
//   return (
//     <Suspense
//       fallback={
//         <Center style={{ height: "100vh" }}>
//           <Loader size="lg" />
//         </Center>
//       }
//     >
//       <PaymentSuccessContent />
//     </Suspense>
//   )
// }






"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
  Center,
  Text,
  Title,
  Paper,
  Button,
  Group,
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
  Timeline,
} from "@mantine/core"
import {
  IconCheck,
  IconHome,
  IconMail,
  IconCalendarEvent,
  IconTicket,
  IconCreditCard,
  IconClock,
  IconFileDownload, // --- NEW: A better icon for receipts
} from "@tabler/icons-react"
import Link from "next/link"

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // --- UPDATED: State for both reference and eventId ---
  const [reference, setReference] = useState<string | null>(null)
  const [eventId, setEventId] = useState<string | null>(null)

  useEffect(() => {
    const ref = searchParams.get("reference")
    const event = searchParams.get("eventId") // --- NEW: Get the eventId
    const stat = searchParams.get("status")

    setReference(ref)
    setEventId(event) // --- NEW: Set the eventId

    // Basic validation
    if (!ref || !event) {
        console.warn("URL is missing payment reference or event ID.");
        // Optionally, you could redirect to an error page after a timeout
        // setTimeout(() => router.push('/error'), 5000);
    }

    if (stat === "success" || stat === "verified") {
      console.log(`Payment successful for reference: ${ref}, event: ${event}`)
    } else {
      console.warn("Landed on success page, but status is not 'success':", stat)
    }
  }, [searchParams, router])

  // --- UPDATED: The next steps data array with new icons/titles ---
  const nextSteps = [
    {
      id: 'email',
      icon: IconMail,
      title: "Check Your Email",
      description: "Confirmation details sent",
      color: "blue",
    },
    {
      id: 'receipt', // Give each item a unique id for logic
      icon: IconFileDownload,
      title: "Download Receipt",
      description: "Get your payment receipt",
      color: "green",
    },
    {
      id: 'calendar',
      icon: IconCalendarEvent,
      title: "Add to Calendar",
      description: "Don't miss the event",
      color: "violet",
    },
  ]
  
  // --- NEW: Helper function to get the correct URL for an action ---
  const getActionUrl = (actionId: string): string => {
      const baseUrl = "https://keupass-48c2ae65f897.herokuapp.com";
      if (actionId === 'receipt' && reference) {
          return `${baseUrl}/api/payment-receipt/${reference}/`;
      }
      if (actionId === 'calendar' && eventId) {
          return `${baseUrl}/api/event-calendar/${eventId}/`;
      }
      return "#"; // Return a dead link if data is not available
  }
  
  // A loading state until we get the parameters from the URL
  if (!reference || !eventId) {
    return (
        <Center style={{ height: "100vh" }}>
            <Loader size="lg" />
            <Text ml="md">Finalizing your registration...</Text>
        </Center>
    );
  }

  return (
    <Box
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #51cf66 0%, #40c057 100%)",
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
              background: "linear-gradient(45deg, #51cf66, #40c057)",
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
              background: "linear-gradient(45deg, #69db7c, #51cf66)",
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
                gradient={{ from: "green", to: "teal" }}
                style={{
                  boxShadow: "0 8px 32px rgba(81, 207, 102, 0.3)",
                }}
              >
                <IconCheck size={40} />
              </ThemeIcon>
            </Center>

            <Stack gap="md" align="center">
              <Badge
                size="lg"
                variant="light"
                color="green"
                radius="xl"
                style={{
                  textTransform: "none",
                  fontSize: "0.875rem",
                  padding: "0.5rem 1rem",
                }}
              >
                Payment Successful
              </Badge>

              <Title
                order={1}
                ta="center"
                size={{ base: "h2", sm: "h1" }}
                style={{
                  background: "linear-gradient(45deg, #51cf66, #40c057)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontWeight: 700,
                  lineHeight: 1.2,
                }}
              >
                Payment Complete!
              </Title>

              <Text ta="center" size="lg" c="dark.6" maw={500} style={{ lineHeight: 1.6 }}>
                Thank you for your payment. Your registration has been confirmed and you're all set for the event!
              </Text>
            </Stack>

            {/* Transaction Details */}
            {reference && (
              <Card
                padding="lg"
                radius="lg"
                style={{
                  background: "rgba(81, 207, 102, 0.05)",
                  border: "1px solid rgba(81, 207, 102, 0.2)",
                }}
              >
                <Group gap="md" align="center">
                  <ThemeIcon size={40} radius="xl" variant="light" color="green">
                    <IconCreditCard size={20} />
                  </ThemeIcon>
                  <Box style={{ flex: 1 }}>
                    <Text size="sm" c="dimmed">
                      Transaction Reference
                    </Text>
                    <Text fw={600} style={{ fontFamily: "monospace" }}>
                      {reference}
                    </Text>
                  </Box>
                  <Group gap="xs">
                    <IconClock size={16} color="#51cf66" />
                    <Text size="sm" c="green">
                      Completed
                    </Text>
                  </Group>
                </Group>
              </Card>
            )}

            {/* What's Next Timeline */}
            <Box>
              <Text fw={600} size="lg" mb="md" ta="center">
                What happens next?
              </Text>
              <Timeline active={0} bulletSize={24} lineWidth={2} color="green">
                <Timeline.Item bullet={<IconMail size={12} />} title="Confirmation Email">
                  <Text c="dimmed" size="sm">
                    You'll receive a confirmation email with your ticket and event details within the next few minutes.
                  </Text>
                </Timeline.Item>
                <Timeline.Item bullet={<IconTicket size={12} />} title="Event Access">
                  <Text c="dimmed" size="sm">
                    Your ticket will include QR codes and access instructions for the event.
                  </Text>
                </Timeline.Item>
                <Timeline.Item bullet={<IconCalendarEvent size={12} />} title="Event Day">
                  <Text c="dimmed" size="sm">
                    Present your ticket at the event entrance or use the provided access link for virtual events.
                  </Text>
                </Timeline.Item>
              </Timeline>
            </Box>

            <Divider
              label="Quick Actions"
              labelPosition="center"
              style={{
                "& .mantine-Divider-label": {
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "#495057",
                },
              }}
            />

            {/* --- UPDATED: Quick Actions are now functional links --- */}
            <Grid gutter="md">
              {nextSteps.map((step) => (
                <Grid.Col key={step.id} span={{ base: 12, sm: 4 }}>
                  <Anchor
                    href={getActionUrl(step.id)}
                    target={step.id === 'email' ? '_self' : '_blank'}
                    download={step.id !== 'email'} // Enable download attribute for receipt and calendar
                    style={{ textDecoration: 'none' }}
                  >
                    <Card
                      padding="lg"
                      radius="lg"
                      style={{
                        transition: "all 0.3s ease",
                        cursor: getActionUrl(step.id) === '#' ? 'not-allowed' : 'pointer',
                        border: "1px solid #e9ecef",
                      }}
                      __vars={{
                        "--card-hover-transform": "translateY(-4px)",
                        "--card-hover-box-shadow": "0 8px 25px rgba(0, 0, 0, 0.1)"
                      }}
                    >
                      <Stack gap="sm" align="center">
                        <ThemeIcon size={50} radius="xl" variant="light" color={step.color}>
                          <step.icon size={24} />
                        </ThemeIcon>
                        <Text fw={600} ta="center" size="sm">
                          {step.title}
                        </Text>
                        <Text size="xs" c="dimmed" ta="center">
                          {step.description}
                        </Text>
                      </Stack>
                    </Card>
                  </Anchor>
                </Grid.Col>
              ))}
            </Grid>

            {/* Action Buttons */}
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
                component={Link}
                href="/eventSchedule/eventDetails"
                variant="gradient"
                gradient={{ from: "green", to: "teal" }}
                leftSection={<IconTicket size={16} />}
                radius="xl"
                size="md"
                style={{
                  boxShadow: "0 4px 15px rgba(81, 207, 102, 0.3)",
                }}
              >
                View My Events
              </Button>
            </Group>

            {/* Footer */}
            <Stack gap="xs" align="center">
              <Text size="sm" c="dimmed" ta="center">
                Need help or have questions about your registration?
              </Text>
              <Group gap="xs">
                <Anchor href="mailto:support@kuepass.com" size="sm">
                  Contact Support
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

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <Center style={{ height: "100vh" }}>
          <Loader size="lg" />
        </Center>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  )
}