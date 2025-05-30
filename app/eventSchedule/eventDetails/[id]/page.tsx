// "use client"

// import { useEffect, useState, useRef } from "react"
// import { useParams } from "next/navigation"
// import {
//   Container,
//   Button,
//   Text,
//   Group,
//   Stack,
//   Image,
//   Loader,
//   Center,
//   Paper,
//   Title,
//   Divider,
//   Box,
//   Grid,
//   Badge,
//   TextInput,
//   Modal,
// } from "@mantine/core"
// import { MapPin, Calendar, Share2, UserPlus, ArrowLeft, Clock, Info } from 'lucide-react'
// import styles from "./styles.module.css"
// import Link from "next/link"
// import CountdownTimer from "@/components/CountdownTimer"
// import QRCode from 'qrcode'

// interface Customization {
//   banner_url: string
//   card_color: string
// }

// interface EventData {
//   id: string
//   title: string
//   description: string
//   start_date: string
//   end_date: string
//   banner_url: string
//   location: string
//   customizations: Customization[]
// }

// interface CountdownData {
//   id: string
//   event: string
//   target_date: string
//   is_active: boolean
// }

// interface AttendeeData {
//   id: string
//   event: string
//   user?: number
//   email?: string
//   name: string
//   registration_date: string
//   guestId?: string
// }

// interface CurrentUser {
//   userId: number
//   email: string
// }

// const getAuthToken = (): string | null => {
//   if (typeof window !== "undefined") {
//     return localStorage.getItem("kuepass_auth_token")
//   }
//   return null
// }

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://keupass-48c2ae65f897.herokuapp.com/api"

// const getCurrentUser = async (): Promise<CurrentUser | null> => {
//   const token = getAuthToken()
//   console.log("getCurrentUser: authToken:", token ? `Present (${token.substring(0, 10)}...)` : "Missing")

//   if (!token) {
//     console.log("getCurrentUser: No authToken, proceeding as guest")
//     return null
//   }

//   try {
//     const response = await fetch(`${API_BASE_URL}/users/me/`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         "Accept": "application/json",
//         "Authorization": `Bearer ${token}`,
//       },
//     })
//     if (!response.ok) {
//       console.error(`getCurrentUser: Failed with status ${response.status} ${response.statusText}`)
//       return null
//     }
//     const user = await response.json()
//     console.log("getCurrentUser: API response:", { id: user.id, email: user.email })
//     if (!user.id || !user.email) {
//       console.error("getCurrentUser: Invalid user data, missing id or email")
//       return null
//     }
//     return {
//       userId: user.id,
//       email: user.email,
//     }
//   } catch (error) {
//     console.error("getCurrentUser: Error fetching /users/me/:", error)
//     return null
//   }
// }

// export default function EventDetails() {
//   const { id } = useParams<{ id: string }>()
//   const [event, setEvent] = useState<EventData | null>(null)
//   const [countdownDate, setCountdownDate] = useState<Date | null>(null)
//   const [attendees, setAttendees] = useState<AttendeeData[]>([])
//   const [loading, setLoading] = useState(true)
//   const [loadingAttendees, setLoadingAttendees] = useState(false)
//   const [attendeeError, setAttendeeError] = useState<string | null>(null)
//   const [refreshTrigger, setRefreshTrigger] = useState(0)
//   const [showQR, setShowQR] = useState(false)
//   const [qrError, setQRError] = useState<string | null>(null)
//   const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
//   const [qrImage, setQrImage] = useState<string | null>(null)
//   const headerContentRef = useRef<HTMLDivElement>(null)
//   const [copied, setCopied] = useState(false)
//   const [showEmailPrompt, setShowEmailPrompt] = useState(false)
//   const [guestEmail, setGuestEmail] = useState("")

//   useEffect(() => {
//     getCurrentUser().then((user) => {
//       console.log("Initial currentUser:", user)
//       setCurrentUser(user)
//     })
//   }, [])

//   useEffect(() => {
//     if (!id) return
//     setLoading(true)
//     const token = getAuthToken()
//     fetch(`${API_BASE_URL}/events/${id}/`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         "Accept": "application/json",
//         ...(token && { "Authorization": `Bearer ${token}` }),
//       },
//     })
//       .then((res) => {
//         if (!res.ok) throw new Error(`Failed to load event: ${res.status}`)
//         return res.json()
//       })
//       .then((res) => {
//         console.log("Event API response:", res)
//         setEvent(res.data || res)
//       })
//       .catch((err) => setAttendeeError(err.message || "Failed to load event"))
//       .finally(() => setLoading(false))
//   }, [id])

//   useEffect(() => {
//     if (!event || !id) return
//     const token = getAuthToken()
//     fetch(`${API_BASE_URL}/event-countdowns/`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         "Accept": "application/json",
//         ...(token && { "Authorization": `Bearer ${token}` }),
//       },
//     })
//       .then((res) => {
//         if (!res.ok) throw new Error("Failed to load countdowns")
//         return res.json()
//       })
//       .then((res) => {
//         console.log("Countdown API response:", res)
//         const cd = res.data.find((c: CountdownData) => c.event === id && c.is_active)
//         if (cd) {
//           setCountdownDate(new Date(cd.target_date))
//         } else {
//           setCountdownDate(new Date(event.start_date))
//         }
//       })
//       .catch(() => {
//         if (event) setCountdownDate(new Date(event.start_date))
//       })
//   }, [event, id])

//   useEffect(() => {
//     if (!id) return
//     setLoadingAttendees(true)
//     setAttendeeError(null)
//     console.log("Fetching attendees for eventId:", id)
//     const token = getAuthToken()
//     fetch(`${API_BASE_URL}/attendees/?event_id=${id}`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         "Accept": "application/json",
//         ...(token && { "Authorization": `Bearer ${token}` }),
//       },
//     })
//       .then((res) => {
//         if (!res.ok) throw new Error(`HTTP error: ${res.status}`)
//         return res.json()
//       })
//       .then((res) => {
//         console.log("Attendees API response:", res)
//         const attendeeData = Array.isArray(res) ? res : res.data || []
//         if (!Array.isArray(attendeeData)) {
//           console.warn("Unexpected attendees response format:", attendeeData)
//           setAttendeeError("Invalid attendees data format")
//           setAttendees([])
//           return
//         }
//         setAttendees(attendeeData)
//       })
//       .catch((err) => {
//         console.error("Failed to load attendees:", err)
//         let errorMessage = "Failed to load attendees."
//         if (err.message.includes("404")) {
//           errorMessage = "No attendees found."
//         }
//         setAttendeeError(errorMessage)
//         setAttendees([])
//       })
//       .finally(() => setLoadingAttendees(false))
//   }, [id, refreshTrigger])

//   useEffect(() => {
//     if (!event || !headerContentRef.current) return
//     const customization = event.customizations?.[0]
//     const cardColor = customization?.card_color || "#ffffff"
//     const hexToRgba = (hex: string, alpha = 0.8) => {
//       const r = Number.parseInt(hex.slice(1, 3), 16)
//       const g = Number.parseInt(hex.slice(3, 5), 16)
//       const b = Number.parseInt(hex.slice(5, 7), 16)
//       return `rgba(${r}, ${g}, ${b}, ${alpha})`
//     }
//     headerContentRef.current.style.setProperty("--card-bg-color", hexToRgba(cardColor))
//   }, [event])

//   const formatDateOnly = (dateString: string) => {
//     const d = new Date(dateString)
//     return d.toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     })
//   }

//   const formatTime = (dateString: string) => {
//     const d = new Date(dateString)
//     return d.toLocaleTimeString("en-US", {
//       hour: "2-digit",
//       minute: "2-digit",
//     })
//   }

//   const handleShareLink = async () => {
//     const url = window.location.href
//     if (navigator.share) {
//       try {
//         await navigator.share({
//           title: event?.title || "Awesome Event",
//           text: `Join me at "${event?.title}"!`,
//           url,
//         })
//         return
//       } catch (err) {
//         console.warn("Share API error, falling back to copy:", err)
//       }
//     }
//     try {
//       await navigator.clipboard.writeText(url)
//       setCopied(true)
//       setTimeout(() => setCopied(false), 2000)
//     } catch (err) {
//       console.error("Copy failed:", err)
//     }
//   }

//   const handleGenerateQR = async () => {
//     setShowQR(true)
//     setQRError(null)
//     setQrImage(null)

//     console.log("handleGenerateQR: Current user:", currentUser)
//     console.log("handleGenerateQR: Attendees:", attendees.map(a => ({ id: a.id, user: a.user, email: a.email })))

//     let userAttendee
//     if (currentUser) {
//       userAttendee = attendees.find((a) => {
//         const userMatch = a.user !== undefined && a.user === currentUser.userId
//         const emailMatch = a.email && currentUser.email && a.email.trim().toLowerCase() === currentUser.email.trim().toLowerCase()
//         console.log(`Checking attendee: id=${a.id}, user=${a.user}, email=${a.email}, userMatch=${userMatch}, emailMatch=${emailMatch}`)
//         return userMatch || emailMatch
//       })
//     } else {
//       const storedGuestEmail = localStorage.getItem("kuepass_guest_email")
//       console.log("handleGenerateQR: Stored guest email:", storedGuestEmail)
//       if (storedGuestEmail) {
//         userAttendee = attendees.find((a) => a.email && a.email.trim().toLowerCase() === storedGuestEmail.trim().toLowerCase())
//       } else {
//         console.log("handleGenerateQR: No guest email, prompting user")
//         setShowEmailPrompt(true)
//         return
//       }
//     }

//     console.log("handleGenerateQR: Matched attendee:", userAttendee)
//     if (!userAttendee) {
//       setQRError("You are not registered for this event. Please register first.")
//       return
//     }

//     try {
//       const qrData = `${window.location.origin}/checkin?attendeeId=${userAttendee.id}`
//       const qrImageData = await QRCode.toDataURL(qrData, {
//         width: 200,
//         margin: 2,
//         errorCorrectionLevel: 'H',
//       })
//       setQrImage(qrImageData)
//     } catch (error) {
//       console.error("QR Code generation failed:", error)
//       setQRError("Failed to generate QR code. Please try again.")
//     }
//   }

//   const handleEmailSubmit = () => {
//     if (!guestEmail) {
//       setQRError("Please enter a valid email address.")
//       return
//     }
//     console.log("handleEmailSubmit: Submitted guest email:", guestEmail)
//     localStorage.setItem("kuepass_guest_email", guestEmail)
//     setShowEmailPrompt(false)

//     const userAttendee = attendees.find((a) => a.email && a.email.trim().toLowerCase() === guestEmail.trim().toLowerCase())
//     console.log("handleEmailSubmit: Matched attendee:", userAttendee)
//     if (!userAttendee) {
//       setQRError("No registration found for this email. Please register first.")
//       setShowQR(false)
//       return
//     }

//     try {
//       const qrData = `${window.location.origin}/checkin?attendeeId=${userAttendee.id}`
//       QRCode.toDataURL(qrData, {
//         width: 200,
//         margin: 2,
//         errorCorrectionLevel: 'H',
//       }).then((qrImageData) => {
//         setQrImage(qrImageData)
//       }).catch((error) => {
//         console.error("QR Code generation failed for guest:", error)
//         setQRError("Failed to generate QR code. Please try again.")
//       })
//     } catch (error) {
//       console.error("QR Code generation failed:", error)
//       setQRError("Failed to generate QR code. Please try again.")
//     }
//   }

//   if (loading) {
//     return (
//       <Center className={styles.loadingContainer}>
//         <Stack align="center" spacing="md">
//           <Loader size="xl" color="#025a3a" />
//           <Text size="lg" fw={500}>
//             Loading event details...
//           </Text>
//         </Stack>
//       </Center>
//     )
//   }

//   if (attendeeError || !event) {
//     return (
//       <Center className={styles.errorContainer}>
//         <Paper className={styles.errorCard} shadow="md" p="xl" radius="md">
//           <Stack align="center" spacing="md">
//             <Text color="red" size="xl" fw={700}>
//               {attendeeError || "Event not found."}
//             </Text>
//             <Link href="/events">
//               <Button className={styles.backButton} leftSection={<ArrowLeft size={16} />}>
//                 Back to Events
//               </Button>
//             </Link>
//           </Stack>
//         </Paper>
//       </Center>
//     )
//   }

//   const customization = event.customizations?.[0]
//   const banner = customization?.banner_url || event.banner_url || "https://via.placeholder.com/1200x400?text=Event+Banner"
//   console.log("Banner URL:", banner)

//   const userAttendee = currentUser
//     ? attendees.find((a) => {
//         const userMatch = a.user !== undefined && a.user === currentUser.userId
//         const emailMatch = a.email && currentUser.email && a.email.trim().toLowerCase() === currentUser.email.trim().toLowerCase()
//         return userMatch || emailMatch
//       })
//     : attendees.find((a) => {
//         const guestEmail = localStorage.getItem("kuepass_guest_email")
//         return guestEmail && a.email && a.email.trim().toLowerCase() === guestEmail.trim().toLowerCase()
//       })

//   return (
//     <div className={styles.pageWrapper}>
//       <Modal
//         opened={showEmailPrompt}
//         onClose={() => setShowEmailPrompt(false)}
//         title="Enter Your Registration Email"
//         centered
//       >
//         <Stack>
//           <TextInput
//             label="Email"
//             placeholder="your.email@example.com"
//             value={guestEmail}
//             onChange={(e) => setGuestEmail(e.currentTarget.value)}
//             required
//           />
//           <Button onClick={handleEmailSubmit}>Submit</Button>
//         </Stack>
//       </Modal>

//       <div className={styles.heroBanner} style={{ backgroundImage: `url(${banner})` }}>
//         <div className={styles.heroOverlay}>
//           <Container size="xl" className={styles.heroContainer}>
//             <div className={styles.heroContent}>
//               <Badge className={styles.eventBadge} size="lg">
//                 Featured Event
//               </Badge>
//               <Title className={styles.heroTitle}>{event.title}</Title>
//               <Group className={styles.eventMeta}>
//                 <Group className={styles.metaItem}>
//                   <Calendar size={20} />
//                   <Text>{formatDateOnly(event.start_date)} - {formatDateOnly(event.end_date)}</Text>
//                 </Group>
//                 <Group className={styles.metaItem}>
//                   <Clock size={20} />
//                   <Text>{formatTime(event.start_date)} - {formatTime(event.end_date)}</Text>
//                 </Group>
//                 {event.location && (
//                   <Group className={styles.metaItem}>
//                     <MapPin size={20} />
//                     <Text>{event.location}</Text>
//                   </Group>
//                 )}
//               </Group>
//               <Group className={styles.heroActions}>
//                 <Link href={`/eventSchedule/registerEvent?eventId=${id}`} style={{ textDecoration: "none" }}>
//                   <Button className={styles.registerButton} leftSection={<UserPlus size={18} />} size="lg">
//                     Register Now
//                   </Button>
//                 </Link>
//                 <Button
//                   variant="outline"
//                   className={styles.shareButton}
//                   leftSection={<Share2 size={18} />}
//                   onClick={handleShareLink}
//                   size="lg"
//                 >
//                   {copied ? "Link Copied!" : "Share Event"}
//                 </Button>
//               </Group>
//             </div>
//           </Container>
//         </div>
//       </div>

//       {countdownDate && (
//         <div className={styles.countdownSection}>
//           <Container size="xl">
//             <Paper className={styles.countdownContainer}>
//               <Group position="apart" align="center" className={styles.countdownHeader}>
//                 <Title order={3} className={styles.countdownTitle}>
//                   <Clock size={24} className={styles.countdownIcon} />
//                   Event Starts In
//                 </Title>
//                 <Badge size="lg" className={styles.countdownBadge}>
//                   Don't Miss It!
//                 </Badge>
//               </Group>
//               <CountdownTimer targetDate={countdownDate} />
//             </Paper>
//           </Container>
//         </div>
//       )}

//       <Container size="xl" className={styles.mainContent}>
//         <Grid gutter={30}>
//           <Grid.Col md={8}>
//             <Paper className={styles.contentCard}>
//               <div className={styles.cardHeader}>
//                 <Title order={2} className={styles.cardTitle}>
//                   <Info size={24} className={styles.cardIcon} />
//                   About This Event
//                 </Title>
//               </div>
//               <Divider className={styles.cardDivider} />
//               <div className={styles.cardBody}>
//                 <Text className={styles.descriptionText}>{event.description}</Text>
//               </div>
//             </Paper>
//           </Grid.Col>

//           <Grid.Col md={4}>
//             <Stack spacing="lg">
//               <Paper className={styles.contentCard}>
//                 <div className={styles.cardHeader}>
//                   <Title order={3} className={styles.cardTitle}>
//                     <Calendar size={20} className={styles.cardIcon} />
//                     Event Details
//                   </Title>
//                 </div>
//                 <Divider className={styles.cardDivider} />
//                 <div className={styles.cardBody}>
//                   <Stack spacing="md">
//                     <div className={styles.detailItem}>
//                       <Text fw={600} className={styles.detailLabel}>
//                         Start Date:
//                       </Text>
//                       <Text>{formatDateOnly(event.start_date)}</Text>
//                     </div>
//                     <div className={styles.detailItem}>
//                       <Text fw={600} className={styles.detailLabel}>
//                         End Date:
//                       </Text>
//                       <Text>{formatDateOnly(event.end_date)}</Text>
//                     </div>
//                     <div className={styles.detailItem}>
//                       <Text fw={600} className={styles.detailLabel}>
//                         Time:
//                       </Text>
//                       <Text>{formatTime(event.start_date)} - {formatTime(event.end_date)}</Text>
//                     </div>
//                     {event.location && (
//                       <div className={styles.detailItem}>
//                         <Text fw={600} className={styles.detailLabel}>
//                           Location:
//                         </Text>
//                         <Text>{event.location}</Text>
//                       </div>
//                     )}
//                   </Stack>
//                 </div>
//               </Paper>

//               <Paper className={styles.contentCard}>
//                 <div className={styles.cardHeader}>
//                   <Title order={3} className={styles.cardTitle}>
//                     <Share2 size={20} className={styles.cardIcon} />
//                     Your Check-In QR Code
//                   </Title>
//                 </div>
//                 <Divider className={styles.cardDivider} />
//                 <Stack spacing="md" mt="md">
//                   <Button onClick={handleGenerateQR}>
//                     {showQR ? "Show QR Code Again" : "Generate QR Code"}
//                   </Button>
//                   <Button
//                     onClick={() => setRefreshTrigger(Date.now())}
//                     variant="outline"
//                   >
//                     Refresh Attendees
//                   </Button>
//                   {showQR && (
//                     <Box mt="md">
//                       {loadingAttendees ? (
//                         <Center>
//                           <Loader size="sm" />
//                         </Center>
//                       ) : qrError ? (
//                         <Text color="red">{qrError}</Text>
//                       ) : userAttendee && qrImage ? (
//                         <Paper p="md" withBorder>
//                           <Text align="center" weight={500} size="sm">
//                             {userAttendee.name}
//                           </Text>
//                           <Center mt="xs">
//                             <Image
//                               src={qrImage}
//                               width={200}
//                               alt={userAttendee.name}
//                             />
//                           </Center>
//                         </Paper>
//                       ) : (
//                         <Text color="dimmed">
//                           You are not registered for this event. Please register first.
//                         </Text>
//                       )}
//                     </Box>
//                   )}
//                 </Stack>
//               </Paper>
//             </Stack>
//           </Grid.Col>
//         </Grid>

//         <Group className={styles.actionGroup}>
//           <Link href="/events">
//             <Button className={styles.backButton} leftSection={<ArrowLeft size={18} />} size="lg">
//               Back to Events
//             </Button>
//           </Link>
//         </Group>
//       </Container>
//     </div>
//   )
// }


"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import { Container, Button, Text, Group, Stack, Image, Flex, Loader, Center, Paper, Title, Divider, Box, Grid, Badge, TextInput, Modal as MantineModal } from "@mantine/core" // Renamed Modal to MantineModal
import { MapPin, Calendar, Share2, UserPlus, ArrowLeft, Clock, Info } from 'lucide-react'
import styles from "./styles.module.css"
import Link from "next/link"
import CountdownTimer from "@/components/CountdownTimer" // Assuming this path is correct
import QRCode from 'qrcode'
// import Modal from "@/components/Modal"; // Assuming this is your custom modal, if different from Mantine's
import { authenticatedRequest } from "@/app/services/auth" // Make sure this handles token correctly

interface Customization {
  id: string; // Added for completeness if needed
  banner_url: string;
  font?: string; // Made optional if not always present
  card_color: string;
  event?: string; // Added for completeness
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface EventData {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  banner_url?: string; // Optional direct banner URL on the event itself
  location: string;
  customization?: Customization; // Changed from customizations: Customization[] to match your "recent code"
                                  // If your API for /events/{id}/ returns a single customization object nested.
                                  // If it returns an array, it should be customizations: Customization[]
}

interface CountdownData {
  id: string;
  event: string; // Should match EventData.id
  target_date: string;
  is_active: boolean;
}

interface AttendeeData {
  id: string;
  event: string;
  user?: number; // User ID from your backend User model
  email?: string; // Attendee's email
  name: string; // Attendee's name
  registration_date: string;
  // guestId?: string; // Not in your backend models, was this local frontend state?
}

interface CurrentUser { // From your existing code
  userId: number;
  email: string;
}

const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("kuepass_auth_token"); // Make sure this key is correct
  }
  return null;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://keupass-48c2ae65f897.herokuapp.com/api";

// getCurrentUser function from your code
const getCurrentUser = async (): Promise<CurrentUser | null> => {
  const token = getAuthToken();
  console.log("EventDetails - getCurrentUser: authToken:", token ? `Present (${token.substring(0, 10)}...)` : "Missing");

  if (!token) {
    console.log("EventDetails - getCurrentUser: No authToken, proceeding as guest");
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/users/me/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      console.error(`EventDetails - getCurrentUser: API Failed with status ${response.status} ${response.statusText}`);
      const errorText = await response.text().catch(() => "Could not read error response.");
      console.error("EventDetails - getCurrentUser: Error response body:", errorText);
      return null;
    }
    const user = await response.json();
    // Assuming your /users/me/ returns { success: true, data: { id, email, ... } }
    // Or directly { id, email, ... }
    // Let's assume it returns the wrapper based on your authenticatedRequest structure
    const userData = user.data || user; // Handle both cases
    console.log("EventDetails - getCurrentUser: API response data:", { id: userData.id, email: userData.email });

    if (!userData.id || !userData.email) {
      console.error("EventDetails - getCurrentUser: Invalid user data from API, missing id or email");
      return null;
    }
    return {
      userId: userData.id,
      email: userData.email,
    };
  } catch (error) {
    console.error("EventDetails - getCurrentUser: Error fetching /users/me/:", error);
    return null;
  }
};


export default function EventDetails() {
  const params = useParams<{ id: string }>(); // Use params from Next
  const id = params?.id; // Get id from params
  
  const [event, setEvent] = useState<EventData | null>(null);
  const [countdownDate, setCountdownDate] = useState<Date | null>(null);
  const [attendees, setAttendees] = useState<AttendeeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAttendees, setLoadingAttendees] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null); // Changed from attendeeError to pageError
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showQRModal, setShowQRModal] = useState(false); // Renamed from showQR for clarity
  const [qrError, setQRError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const headerContentRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [showEmailPromptModal, setShowEmailPromptModal] = useState(false); // Renamed
  const [guestEmail, setGuestEmail] = useState("");

  useEffect(() => {
    getCurrentUser().then((user) => {
      console.log("EventDetails - Initial currentUser set to:", user);
      setCurrentUser(user);
    });
  }, []);

  useEffect(() => {
    if (!id) {
        setPageError("Event ID is missing.");
        setLoading(false);
        return;
    }
    setLoading(true);
    setPageError(null);
    console.log(`EventDetails - Fetching event data for ID: ${id}`);
    // Using your authenticatedRequest structure
    authenticatedRequest<{ success: boolean; data: EventData; message?: string }>(`${API_BASE_URL}/events/${id}/`, "GET")
      .then((res) => {
        console.log("EventDetails - Event API raw response:", res);
        if (res?.success && res.data) {
          setEvent(res.data);
        } else if (res && !res.success && res.message) { // Handle structured error from authenticatedRequest
          console.error("EventDetails - Failed to fetch event:", res.message);
          setPageError(res.message || "Failed to load event details.");
        } else if (res && (res as any).id) { // If authenticatedRequest returns data directly on success
            console.log("EventDetails - Event API returned data directly, using it.");
            setEvent(res as any as EventData);
        }
         else {
          console.error("EventDetails - Unexpected event API response structure:", res);
          setPageError("Failed to load event: Unexpected data format.");
        }
      })
      .catch((err) => {
        console.error("EventDetails - Error fetching event:", err);
        setPageError(err.message || "Failed to load event.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!event || !id) return;
    console.log(`EventDetails - Fetching countdowns for event ID: ${id}`);
    // Assuming countdowns might not need strict auth or uses same token logic
    authenticatedRequest<{success: boolean; data: CountdownData[], message?: string}>(`${API_BASE_URL}/event-countdowns/?event_id=${id}`, "GET") // Ensure query param is event_id
      .then((res) => {
        console.log("EventDetails - Countdown API raw response:", res);
        if (res?.success && Array.isArray(res.data)) {
          const activeCountdown = res.data.find((c: CountdownData) => c.event === id && c.is_active);
          if (activeCountdown) {
            console.log("EventDetails - Active countdown found:", activeCountdown);
            setCountdownDate(new Date(activeCountdown.target_date));
          } else {
            console.log("EventDetails - No active countdown found, using event start_date.");
            setCountdownDate(new Date(event.start_date));
          }
        } else if (res && !res.success && res.message){
            console.warn("EventDetails - Failed to fetch countdowns:", res.message);
            setCountdownDate(new Date(event.start_date)); // Fallback
        } else {
            console.warn("EventDetails - Unexpected countdown API response structure or no data:", res);
            setCountdownDate(new Date(event.start_date)); // Fallback
        }
      })
      .catch((err) => {
        console.error("EventDetails - Error fetching countdowns:", err);
        setCountdownDate(new Date(event.start_date)); // Fallback
      });
  }, [event, id]);

  useEffect(() => {
    if (!id) return;
    setLoadingAttendees(true);
    setPageError(null); // Clear page error if attendees are being fetched
    console.log("EventDetails - Fetching attendees for eventId:", id);

    authenticatedRequest<AttendeeData[] | {success: boolean; data: AttendeeData[], message?: string}>(`${API_BASE_URL}/attendees/?event_id=${id}`, "GET")
      .then((res) => {
        console.log("EventDetails - Attendees API raw response:", res);
        let attendeeDataArray: AttendeeData[] = [];

        if (Array.isArray(res)) { // Case: direct array
            attendeeDataArray = res;
        } else if (res?.success && Array.isArray(res.data)) { // Case: wrapper with success and data array
            attendeeDataArray = res.data;
        } else if (res && !res.success && (res as any).message) { // Case: wrapper with success false and message
            console.warn("EventDetails - Attendees API call failed:", (res as any).message);
            setPageError(`Failed to load attendees: ${(res as any).message}`);
        } else {
            console.warn("EventDetails - Unexpected attendees response format:", res);
            setPageError("Invalid attendees data format received.");
        }
        
        setAttendees(attendeeDataArray);
        if (attendeeDataArray.length === 0 && !pageError) { // Only show "no attendees" if no other error
            // console.log("No attendees found for this event via API.");
            // setPageError("No attendees yet for this event."); // This might be normal, not an error
        }
      })
      .catch((err) => {
        console.error("EventDetails - Error fetching attendees:", err);
        setPageError(err.message || "Failed to load attendees.");
        setAttendees([]);
      })
      .finally(() => setLoadingAttendees(false));
  }, [id, refreshTrigger]);

  useEffect(() => {
    if (event && headerContentRef.current) {
      const cardColorFromCustomization = event.customization?.card_color;
      const cardColor = cardColorFromCustomization || "#FFFFFF"; // Default to white if no customization
      console.log("EventDetails - Applying card color:", cardColor);
      try {
        const hexToRgba = (hex: string, alpha = 0.8) => {
          if (!hex.startsWith("#") || (hex.length !== 4 && hex.length !== 7)) {
            console.warn("EventDetails - Invalid hex color for cardColor, using default:", hex);
            return `rgba(255, 255, 255, ${alpha})`; // Default to white transparent
          }
          const hexVal = hex.length === 4 ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}` : hex;
          const r = parseInt(hexVal.slice(1, 3), 16);
          const g = parseInt(hexVal.slice(3, 5), 16);
          const b = parseInt(hexVal.slice(5, 7), 16);
          if (isNaN(r) || isNaN(g) || isNaN(b)) {
            console.warn("EventDetails - Could not parse hex for cardColor, using default:", hex);
            return `rgba(255, 255, 255, ${alpha})`; // Default to white transparent
          }
          return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };
        headerContentRef.current.style.setProperty("--card-bg-color", hexToRgba(cardColor));
      } catch (e) {
        console.error("EventDetails - Error processing card color, using default:", e);
        headerContentRef.current.style.setProperty("--card-bg-color", `rgba(255, 255, 255, 0.8)`);
      }
    }
  }, [event]);

  const formatDateOnly = (dateString: string) => { /* ... same as before ... */ 
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };
  const formatTime = (dateString: string) => { /* ... same as before ... */ 
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };
  const handleShareLink = async () => { /* ... same as before ... */ 
    const url = window.location.href;
    if (navigator.share) { /* ... */ }
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch (err) { console.error("Copy failed:", err); }
  };

  const handleGenerateQR = async () => { /* ... your existing robust QR generation logic ... */ 
    setShowQRModal(true); setQRError(null); setQrImage(null);
    console.log("EventDetails - handleGenerateQR: Current user:", currentUser);
    console.log("EventDetails - handleGenerateQR: Attendees list:", attendees.map(a => ({ id: a.id, user: a.user, email: a.email })));

    let userAttendeeRecord: AttendeeData | undefined;
    if (currentUser) {
      userAttendeeRecord = attendees.find((a) => 
        (a.user !== undefined && a.user === currentUser.userId) || 
        (a.email && currentUser.email && a.email.trim().toLowerCase() === currentUser.email.trim().toLowerCase())
      );
    } else {
      const storedGuestEmail = localStorage.getItem("kuepass_guest_email");
      console.log("EventDetails - handleGenerateQR: Stored guest email:", storedGuestEmail);
      if (storedGuestEmail) {
        userAttendeeRecord = attendees.find((a) => a.email && a.email.trim().toLowerCase() === storedGuestEmail.trim().toLowerCase());
      } else {
        console.log("EventDetails - handleGenerateQR: No guest email, prompting user");
        setShowEmailPromptModal(true); return;
      }
    }

    console.log("EventDetails - handleGenerateQR: Matched attendee record:", userAttendeeRecord);
    if (!userAttendeeRecord) {
      setQRError("Registration not found for this event. Please ensure you are registered or check the email used.");
      return;
    }

    try {
      const qrData = `${window.location.origin}/checkin?attendeeId=${userAttendeeRecord.id}&eventId=${id}`; // Added eventId for context
      const qrImageData = await QRCode.toDataURL(qrData, { width: 256, margin: 2, errorCorrectionLevel: 'H' });
      setQrImage(qrImageData);
    } catch (error) {
      console.error("EventDetails - QR Code generation failed:", error);
      setQRError("Failed to generate QR code. Please try again.");
    }
  };

  const handleEmailSubmit = async () => { /* ... your existing robust QR generation logic for guests ... */ 
    if (!guestEmail) { setQRError("Please enter your email."); return; }
    console.log("EventDetails - handleEmailSubmit: Submitted guest email:", guestEmail);
    localStorage.setItem("kuepass_guest_email", guestEmail);
    setShowEmailPromptModal(false);
    // Re-attempt QR generation with the submitted email
    await handleGenerateQR(); // This will now use the newly stored guestEmail
  };


  if (loading ) { // Combined loading state for initial phase
    return (
      <Center className={styles.loadingContainer}>
        <Stack align="center" spacing="md">
          <Loader size="xl" color="#025a3a" />
          <Text size="lg" fw={500}>Loading event details...</Text>
        </Stack>
      </Center>
    );
  }

  if (pageError || !event) { // Combined error/no event state
    return (
      <Center className={styles.errorContainer}>
        <Paper className={styles.errorCard} shadow="md" p="xl" radius="md">
          <Stack align="center" spacing="md">
            <Text color="red" size="xl" fw={700}>{pageError || "Event not found."}</Text>
            <Link href="/events">
              <Button className={styles.backButton} leftSection={<ArrowLeft size={16} />}>Back to Events</Button>
            </Link>
          </Stack>
        </Paper>
      </Center>
    );
  }

  // Determine banner URL with robust fallbacks
  let finalBannerUrl = "/images/placeholder.jpg"; // Ultimate fallback
  if (event.customization && event.customization.banner_url) {
    finalBannerUrl = event.customization.banner_url;
  } else if (event.banner_url) { // Check for direct banner_url on event object
    finalBannerUrl = event.banner_url;
  }
  console.log("EventDetails - Final Banner URL to display:", finalBannerUrl);


  const userIsRegistered = !!(currentUser 
    ? attendees.find(a => (a.user !== undefined && a.user === currentUser.userId) || (a.email && currentUser.email && a.email.trim().toLowerCase() === currentUser.email.trim().toLowerCase()))
    : attendees.find(a => {
        const guestEmail = localStorage.getItem("kuepass_guest_email");
        return guestEmail && a.email && a.email.trim().toLowerCase() === guestEmail.trim().toLowerCase();
      })
  );
  console.log("EventDetails - Is current user registered?", userIsRegistered, "CurrentUser:", currentUser);


  return (
    <div className={styles.pageWrapper}>
      <MantineModal // Using MantineModal for the email prompt
        opened={showEmailPromptModal}
        onClose={() => {setShowEmailPromptModal(false); setShowQRModal(false); /* Also close QR modal if email prompt is cancelled */}}
        title="Enter Your Registration Email"
        centered
      >
        <Stack>
          <TextInput label="Email" placeholder="your.email@example.com" value={guestEmail} onChange={(e) => setGuestEmail(e.currentTarget.value)} required />
          <Button onClick={handleEmailSubmit}>Generate My QR Code</Button>
        </Stack>
      </MantineModal>

      <MantineModal // Modal for displaying the QR code
        opened={showQRModal && !showEmailPromptModal} // Only show if email prompt is not active
        onClose={() => setShowQRModal(false)}
        title="Your Event Check-in QR Code"
        centered
        size="auto"
      >
        <Stack align="center" spacing="md">
            {qrError && <Text color="red">{qrError}</Text>}
            {qrImage && !qrError && (
                <>
                    <Text size="sm" ta="center">Present this QR code at the event for check-in.</Text>
                    <Image src={qrImage} width={256} height={256} alt="Event Check-in QR Code" />
                </>
            )}
            {!qrImage && !qrError && <Loader />}
            <Button onClick={() => setShowQRModal(false)} variant="light" mt="md">Close</Button>
        </Stack>
      </MantineModal>


      <div className={styles.heroBanner} style={{ backgroundImage: `url(${finalBannerUrl})` }}>
        <Image 
            src={finalBannerUrl} 
            alt="" 
            style={{display: 'none'}} 
            onError={() => console.error("HeroBanner div's background-image failed to load src:", finalBannerUrl)} 
        /> {/* Hidden image to catch background image load errors if needed, though CSS handles this gracefully */}
        <div className={styles.heroOverlay}>
          <Container size="xl" className={styles.heroContainer}>
            <div className={styles.heroContent}>
              <Badge className={styles.eventBadge} size="lg">Featured Event</Badge>
              <Title className={styles.heroTitle}>{event.title}</Title>
              <Group className={styles.eventMeta}>
                <Group className={styles.metaItem}><Calendar size={20} /><Text>{formatDateOnly(event.start_date)} - {formatDateOnly(event.end_date)}</Text></Group>
                <Group className={styles.metaItem}><Clock size={20} /><Text>{formatTime(event.start_date)} - {formatTime(event.end_date)}</Text></Group>
                {event.location && (<Group className={styles.metaItem}><MapPin size={20} /><Text>{event.location}</Text></Group>)}
              </Group>
              <Group className={styles.heroActions}>
                {!userIsRegistered && (
                    <Link href={`/eventSchedule/registerEvent?eventId=${id}`} style={{ textDecoration: "none" }}>
                        <Button className={styles.registerButton} leftSection={<UserPlus size={18} />} size="lg">Register Now</Button>
                    </Link>
                )}
                {userIsRegistered && (
                     <Button className={styles.registerButton} leftSection={<UserPlus size={18} />} size="lg" onClick={handleGenerateQR}>My QR Code</Button>
                )}
                <Button variant="outline" className={styles.shareButton} leftSection={<Share2 size={18} />} onClick={handleShareLink} size="lg">
                  {copied ? "Link Copied!" : "Share Event"}
                </Button>
              </Group>
            </div>
          </Container>
        </div>
      </div>

      {countdownDate && (
        <div className={styles.countdownSection}>
          <Container size="xl">
            <Paper className={styles.countdownContainer}>
              <Group justify="space-between" align="center" className={styles.countdownHeader}>
                <Title order={3} className={styles.countdownTitle}><Clock size={24} className={styles.countdownIcon} />Event Starts In</Title>
                <Badge size="lg" className={styles.countdownBadge}>Don't Miss It!</Badge>
              </Group>
              <CountdownTimer targetDate={countdownDate} />
            </Paper>
          </Container>
        </div>
      )}

      <Container size="xl" className={styles.mainContent}>
        <Grid gutter={30}>
          <Grid.Col md={8}>
            <Paper className={styles.contentCard}>
              <div className={styles.cardHeader}><Title order={2} className={styles.cardTitle}><Info size={24} className={styles.cardIcon} />About This Event</Title></div>
              <Divider className={styles.cardDivider} />
              <div className={styles.cardBody}><Text className={styles.descriptionText}>{event.description}</Text></div>
            </Paper>
          </Grid.Col>
          <Grid.Col md={4}>
            <Stack spacing="lg">
              <Paper className={styles.contentCard}>
                <div className={styles.cardHeader}><Title order={3} className={styles.cardTitle}><Calendar size={20} className={styles.cardIcon} />Event Details</Title></div>
                <Divider className={styles.cardDivider} />
                <div className={styles.cardBody}>
                  <Stack spacing="md">
                    <div className={styles.detailItem}><Text fw={600} className={styles.detailLabel}>Start Date:</Text><Text>{formatDateOnly(event.start_date)}</Text></div>
                    <div className={styles.detailItem}><Text fw={600} className={styles.detailLabel}>End Date:</Text><Text>{formatDateOnly(event.end_date)}</Text></div>
                    <div className={styles.detailItem}><Text fw={600} className={styles.detailLabel}>Time:</Text><Text>{formatTime(event.start_date)} - {formatTime(event.end_date)}</Text></div>
                    {event.location && (<div className={styles.detailItem}><Text fw={600} className={styles.detailLabel}>Location:</Text><Text>{event.location}</Text></div>)}
                  </Stack>
                </div>
              </Paper>
              {/* QR Code Section in Sidebar (Alternative placement) */}
              <Paper className={styles.contentCard}>
                <div className={styles.cardHeader}><Title order={3} className={styles.cardTitle}><Share2 size={20} className={styles.cardIcon} />Check-In</Title></div>
                <Divider className={styles.cardDivider} />
                <Stack spacing="md" p="md">
                  <Button onClick={handleGenerateQR} fullWidth>
                    {showQRModal ? "View My QR Code" : "Get My Check-In QR Code"}
                  </Button>
                  <Button onClick={() => setRefreshTrigger(Date.now())} variant="outline" fullWidth>Refresh My Status</Button>
                  {/* QR Code will be displayed in a modal now */}
                </Stack>
              </Paper>
            </Stack>
          </Grid.Col>
        </Grid>
        <Group className={styles.actionGroup}><Link href="/events"><Button className={styles.backButton} leftSection={<ArrowLeft size={18} />} size="lg">Back to Events</Button></Link></Group>
      </Container>
      {/* Footer might be in a global layout, but if not: */}
      {/* <div className={styles.footerWrapper}><CustomFooter /></div> */}
    </div>
  )
}