// "use client";

// import { useEffect, useState, useRef } from "react";
// import { useParams } from "next/navigation";
// import {
//   Container,
//   Button,
//   Text,
//   Group,
//   Stack,
//   Image,
//   Flex,
//   Loader,
//   Center,
//   Paper,
//   Title,
//   Divider,
//   Box,
//   Grid,
//   Badge,
//   TextInput,
//   Modal as MantineModal,
// } from "@mantine/core"; // Renamed Modal to MantineModal
// import {
//   MapPin,
//   Calendar,
//   Share2,
//   UserPlus,
//   ArrowLeft,
//   Clock,
//   Info,
// } from "lucide-react";
// import styles from "./styles.module.css";
// import Link from "next/link";
// import CountdownTimer from "@/components/CountdownTimer"; // Assuming this path is correct
// import QRCode from "qrcode";
// // import Modal from "@/components/Modal"; // Assuming this is your custom modal, if different from Mantine's
// import { authenticatedRequest } from "@/app/services/auth"; // Make sure this handles token correctly
// import AuthGuard from "@/app/components/AuthGuard";

// interface Customization {
//   id: string; // Added for completeness if needed
//   banner_url: string;
//   font?: string; // Made optional if not always present
//   card_color: string;
//   event?: string; // Added for completeness
//   is_active?: boolean;
//   created_at?: string;
//   updated_at?: string;
// }

// interface EventData {
//   id: string;
//   title: string;
//   description: string;
//   start_date: string;
//   end_date: string;
//   banner_url?: string; // Optional direct banner URL on the event itself
//   location: string;
//   address: string;
//   customization?: Customization; // Changed from customizations: Customization[] to match your "recent code"
//   // If your API for /events/{id}/ returns a single customization object nested.
//   // If it returns an array, it should be customizations: Customization[]
// }

// interface CountdownData {
//   id: string;
//   event: string; // Should match EventData.id
//   target_date: string;
//   is_active: boolean;
// }

// interface AttendeeData {
//   id: string;
//   event: string;
//   user?: number; // User ID from your backend User model
//   email?: string; // Attendee's email
//   name: string; // Attendee's name
//   registration_date: string;
//   // guestId?: string; // Not in your backend models, was this local frontend state?
// }

// interface CurrentUser {
//   // From your existing code
//   userId: number;
//   email: string;
// }

// const getAuthToken = (): string | null => {
//   if (typeof window !== "undefined") {
//     return localStorage.getItem("kuepass_auth_token"); // Make sure this key is correct
//   }
//   return null;
// };

// const API_BASE_URL =
//   process.env.NEXT_PUBLIC_API_BASE_URL ||
//   "https://keupass-48c2ae65f897.herokuapp.com/api";

// // getCurrentUser function from your code
// const getCurrentUser = async (): Promise<CurrentUser | null> => {
//   const token = getAuthToken();
//   console.log(
//     "EventDetails - getCurrentUser: authToken:",
//     token ? `Present (${token.substring(0, 10)}...)` : "Missing"
//   );

//   if (!token) {
//     console.log(
//       "EventDetails - getCurrentUser: No authToken, proceeding as guest"
//     );
//     return null;
//   }

//   try {
//     const response = await fetch(`${API_BASE_URL}/users/me/`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         Accept: "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     if (!response.ok) {
//       console.error(
//         `EventDetails - getCurrentUser: API Failed with status ${response.status} ${response.statusText}`
//       );
//       const errorText = await response
//         .text()
//         .catch(() => "Could not read error response.");
//       console.error(
//         "EventDetails - getCurrentUser: Error response body:",
//         errorText
//       );
//       return null;
//     }
//     const user = await response.json();
//     // Assuming your /users/me/ returns { success: true, data: { id, email, ... } }
//     // Or directly { id, email, ... }
//     // Let's assume it returns the wrapper based on your authenticatedRequest structure
//     const userData = user.data || user; // Handle both cases
//     console.log("EventDetails - getCurrentUser: API response data:", {
//       id: userData.id,
//       email: userData.email,
//     });

//     if (!userData.id || !userData.email) {
//       console.error(
//         "EventDetails - getCurrentUser: Invalid user data from API, missing id or email"
//       );
//       return null;
//     }
//     return {
//       userId: userData.id,
//       email: userData.email,
//     };
//   } catch (error) {
//     console.error(
//       "EventDetails - getCurrentUser: Error fetching /users/me/:",
//       error
//     );
//     return null;
//   }
// };

// export default function EventDetails() {
//   const params = useParams<{ id: string }>(); // Use params from Next
//   const id = params?.id; // Get id from params

//   const [event, setEvent] = useState<EventData | null>(null);
//   const [countdownDate, setCountdownDate] = useState<Date | null>(null);
//   const [attendees, setAttendees] = useState<AttendeeData[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [loadingAttendees, setLoadingAttendees] = useState(false);
//   const [pageError, setPageError] = useState<string | null>(null); // Changed from attendeeError to pageError
//   const [refreshTrigger, setRefreshTrigger] = useState(0);
//   const [showQRModal, setShowQRModal] = useState(false); // Renamed from showQR for clarity
//   const [qrError, setQRError] = useState<string | null>(null);
//   const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
//   const [qrImage, setQrImage] = useState<string | null>(null);
//   const headerContentRef = useRef<HTMLDivElement>(null);
//   const [copied, setCopied] = useState(false);
//   const [showEmailPromptModal, setShowEmailPromptModal] = useState(false); // Renamed
//   const [guestEmail, setGuestEmail] = useState("");

//   useEffect(() => {
//     getCurrentUser().then((user) => {
//       console.log("EventDetails - Initial currentUser set to:", user);
//       setCurrentUser(user);
//     });
//   }, []);

//   useEffect(() => {
//     if (!id) {
//       setPageError("Event ID is missing.");
//       setLoading(false);
//       return;
//     }
//     setLoading(true);
//     setPageError(null);
//     console.log(`EventDetails - Fetching event data for ID: ${id}`);
//     // Using your authenticatedRequest structure
//     authenticatedRequest<{
//       success: boolean;
//       data: EventData;
//       message?: string;
//     }>(`${API_BASE_URL}/events/${id}/`, "GET")
//       .then((res) => {
//         console.log("EventDetails - Event API raw response:", res);
//         if (res?.success && res.data) {
//           setEvent(res.data);
//         } else if (res && !res.success && res.message) {
//           // Handle structured error from authenticatedRequest
//           console.error("EventDetails - Failed to fetch event:", res.message);
//           setPageError(res.message || "Failed to load event details.");
//         } else if (res && (res as any).id) {
//           // If authenticatedRequest returns data directly on success
//           console.log(
//             "EventDetails - Event API returned data directly, using it."
//           );
//           setEvent(res as any as EventData);
//         } else {
//           console.error(
//             "EventDetails - Unexpected event API response structure:",
//             res
//           );
//           setPageError("Failed to load event: Unexpected data format.");
//         }
//       })
//       .catch((err) => {
//         console.error("EventDetails - Error fetching event:", err);
//         setPageError(err.message || "Failed to load event.");
//       })
//       .finally(() => setLoading(false));
//   }, [id]);

//   useEffect(() => {
//     if (!event || !id) return;
//     console.log(`EventDetails - Fetching countdowns for event ID: ${id}`);
//     // Assuming countdowns might not need strict auth or uses same token logic
//     authenticatedRequest<{
//       success: boolean;
//       data: CountdownData[];
//       message?: string;
//     }>(`${API_BASE_URL}/event-countdowns/?event_id=${id}`, "GET") // Ensure query param is event_id
//       .then((res) => {
//         console.log("EventDetails - Countdown API raw response:", res);
//         if (res?.success && Array.isArray(res.data)) {
//           const activeCountdown = res.data.find(
//             (c: CountdownData) => c.event === id && c.is_active
//           );
//           if (activeCountdown) {
//             console.log(
//               "EventDetails - Active countdown found:",
//               activeCountdown
//             );
//             setCountdownDate(new Date(activeCountdown.target_date));
//           } else {
//             console.log(
//               "EventDetails - No active countdown found, using event start_date."
//             );
//             setCountdownDate(new Date(event.start_date));
//           }
//         } else if (res && !res.success && res.message) {
//           console.warn(
//             "EventDetails - Failed to fetch countdowns:",
//             res.message
//           );
//           setCountdownDate(new Date(event.start_date)); // Fallback
//         } else {
//           console.warn(
//             "EventDetails - Unexpected countdown API response structure or no data:",
//             res
//           );
//           setCountdownDate(new Date(event.start_date)); // Fallback
//         }
//       })
//       .catch((err) => {
//         console.error("EventDetails - Error fetching countdowns:", err);
//         setCountdownDate(new Date(event.start_date)); // Fallback
//       });
//   }, [event, id]);

//   useEffect(() => {
//     if (!id) return;
//     setLoadingAttendees(true);
//     setPageError(null); // Clear page error if attendees are being fetched
//     console.log("EventDetails - Fetching attendees for eventId:", id);

//     authenticatedRequest<
//       | AttendeeData[]
//       | { success: boolean; data: AttendeeData[]; message?: string }
//     >(`${API_BASE_URL}/attendees/?event_id=${id}`, "GET")
//       .then((res) => {
//         console.log("EventDetails - Attendees API raw response:", res);
//         let attendeeDataArray: AttendeeData[] = [];

//         if (Array.isArray(res)) {
//           // Case: direct array
//           attendeeDataArray = res;
//         } else if (res?.success && Array.isArray(res.data)) {
//           // Case: wrapper with success and data array
//           attendeeDataArray = res.data;
//         } else if (res && !res.success && (res as any).message) {
//           // Case: wrapper with success false and message
//           console.warn(
//             "EventDetails - Attendees API call failed:",
//             (res as any).message
//           );
//           setPageError(`Failed to load attendees: ${(res as any).message}`);
//         } else {
//           console.warn(
//             "EventDetails - Unexpected attendees response format:",
//             res
//           );
//           setPageError("Invalid attendees data format received.");
//         }

//         setAttendees(attendeeDataArray);
//         if (attendeeDataArray.length === 0 && !pageError) {
//           // Only show "no attendees" if no other error
//           // console.log("No attendees found for this event via API.");
//           // setPageError("No attendees yet for this event."); // This might be normal, not an error
//         }
//       })
//       .catch((err) => {
//         console.error("EventDetails - Error fetching attendees:", err);
//         setPageError(err.message || "Failed to load attendees.");
//         setAttendees([]);
//       })
//       .finally(() => setLoadingAttendees(false));
//   }, [id, refreshTrigger]);

//   useEffect(() => {
//     if (event && headerContentRef.current) {
//       const cardColorFromCustomization = event.customization?.card_color;
//       const cardColor = cardColorFromCustomization || "#FFFFFF"; // Default to white if no customization
//       console.log("EventDetails - Applying card color:", cardColor);
//       try {
//         const hexToRgba = (hex: string, alpha = 0.8) => {
//           if (!hex.startsWith("#") || (hex.length !== 4 && hex.length !== 7)) {
//             console.warn(
//               "EventDetails - Invalid hex color for cardColor, using default:",
//               hex
//             );
//             return `rgba(255, 255, 255, ${alpha})`; // Default to white transparent
//           }
//           const hexVal =
//             hex.length === 4
//               ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
//               : hex;
//           const r = parseInt(hexVal.slice(1, 3), 16);
//           const g = parseInt(hexVal.slice(3, 5), 16);
//           const b = parseInt(hexVal.slice(5, 7), 16);
//           if (isNaN(r) || isNaN(g) || isNaN(b)) {
//             console.warn(
//               "EventDetails - Could not parse hex for cardColor, using default:",
//               hex
//             );
//             return `rgba(255, 255, 255, ${alpha})`; // Default to white transparent
//           }
//           return `rgba(${r}, ${g}, ${b}, ${alpha})`;
//         };
//         headerContentRef.current.style.setProperty(
//           "--card-bg-color",
//           hexToRgba(cardColor)
//         );
//       } catch (e) {
//         console.error(
//           "EventDetails - Error processing card color, using default:",
//           e
//         );
//         headerContentRef.current.style.setProperty(
//           "--card-bg-color",
//           `rgba(255, 255, 255, 0.8)`
//         );
//       }
//     }
//   }, [event]);

//   const formatDateOnly = (dateString: string) => {
//     /* ... same as before ... */
//     if (!dateString) return "N/A";
//     const d = new Date(dateString);
//     return d.toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     });
//   };
//   const formatTime = (dateString: string) => {
//     /* ... same as before ... */
//     if (!dateString) return "N/A";
//     const d = new Date(dateString);
//     return d.toLocaleTimeString("en-US", {
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   // Share event link
//   const handleShareLink = async () => {
//     const url = window.location.href;
//     if (navigator.share) {
//       try {
//         await navigator.share({
//           title: event?.title || "Awesome Event",
//           text: `Join me at "${event?.title}"!`,
//           url,
//         });
//         return;
//       } catch (err) {
//         console.warn("Share API error, falling back to copy:", err);
//       }
//     }
//     try {
//       await navigator.clipboard.writeText(url);
//       setCopied(true);
//       setTimeout(() => setCopied(false), 2000);
//     } catch (err) {
//       console.error("Copy failed:", err);
//     }
//   };

//   const handleGenerateQR = async () => {
//     /* ... your existing robust QR generation logic ... */
//     setShowQRModal(true);
//     setQRError(null);
//     setQrImage(null);
//     console.log("EventDetails - handleGenerateQR: Current user:", currentUser);
//     console.log(
//       "EventDetails - handleGenerateQR: Attendees list:",
//       attendees.map((a) => ({ id: a.id, user: a.user, email: a.email }))
//     );

//     let userAttendeeRecord: AttendeeData | undefined;
//     if (currentUser) {
//       userAttendeeRecord = attendees.find(
//         (a) =>
//           (a.user !== undefined && a.user === currentUser.userId) ||
//           (a.email &&
//             currentUser.email &&
//             a.email.trim().toLowerCase() ===
//               currentUser.email.trim().toLowerCase())
//       );
//     } else {
//       const storedGuestEmail = localStorage.getItem("kuepass_guest_email");
//       console.log(
//         "EventDetails - handleGenerateQR: Stored guest email:",
//         storedGuestEmail
//       );
//       if (storedGuestEmail) {
//         userAttendeeRecord = attendees.find(
//           (a) =>
//             a.email &&
//             a.email.trim().toLowerCase() ===
//               storedGuestEmail.trim().toLowerCase()
//         );
//       } else {
//         console.log(
//           "EventDetails - handleGenerateQR: No guest email, prompting user"
//         );
//         setShowEmailPromptModal(true);
//         return;
//       }
//     }

//     console.log(
//       "EventDetails - handleGenerateQR: Matched attendee record:",
//       userAttendeeRecord
//     );
//     if (!userAttendeeRecord) {
//       setQRError(
//         "Registration not found for this event. Please ensure you are registered or check the email used."
//       );
//       return;
//     }

//     try {
//       const qrData = `${window.location.origin}/checkin?attendeeId=${userAttendeeRecord.id}&eventId=${id}`; // Added eventId for context
//       const qrImageData = await QRCode.toDataURL(qrData, {
//         width: 256,
//         margin: 2,
//         errorCorrectionLevel: "H",
//       });
//       setQrImage(qrImageData);
//     } catch (error) {
//       console.error("EventDetails - QR Code generation failed:", error);
//       setQRError("Failed to generate QR code. Please try again.");
//     }
//   };

//   const handleEmailSubmit = async () => {
//     /* ... your existing robust QR generation logic for guests ... */
//     if (!guestEmail) {
//       setQRError("Please enter your email.");
//       return;
//     }
//     console.log(
//       "EventDetails - handleEmailSubmit: Submitted guest email:",
//       guestEmail
//     );
//     localStorage.setItem("kuepass_guest_email", guestEmail);
//     setShowEmailPromptModal(false);
//     // Re-attempt QR generation with the submitted email
//     await handleGenerateQR(); // This will now use the newly stored guestEmail
//   };

//   if (loading) {
//     // Combined loading state for initial phase
//     return (
//       <Center className={styles.loadingContainer}>
//         <Stack align="center" gap="md">
//           <Loader size="xl" color="#025a3a" />
//           <Text size="lg" fw={500}>
//             Loading event details...
//           </Text>
//         </Stack>
//       </Center>
//     );
//   }

//   if (pageError || !event) {
//     // Combined error/no event state
//     return (
//       <Center className={styles.errorContainer}>
//         <Paper className={styles.errorCard} shadow="md" p="xl" radius="md">
//           <Stack align="center" gap="md">
//             <Text color="red" size="xl" fw={700}>
//               {pageError || "Event not found."}
//             </Text>
//             <Link href="/events">
//               <Button
//                 className={styles.backButton}
//                 leftSection={<ArrowLeft size={16} />}
//               >
//                 Back to Events
//               </Button>
//             </Link>
//           </Stack>
//         </Paper>
//       </Center>
//     );
//   }

//   // Determine banner URL with robust fallbacks
//   let finalBannerUrl = "/images/placeholder.jpg"; // Ultimate fallback
//   if (event.customization && event.customization.banner_url) {
//     finalBannerUrl = event.customization.banner_url;
//   } else if (event.banner_url) {
//     // Check for direct banner_url on event object
//     finalBannerUrl = event.banner_url;
//   }
//   console.log("EventDetails - Final Banner URL to display:", finalBannerUrl);

//   const userIsRegistered = !!(currentUser
//     ? attendees.find(
//         (a) =>
//           (a.user !== undefined && a.user === currentUser.userId) ||
//           (a.email &&
//             currentUser.email &&
//             a.email.trim().toLowerCase() ===
//               currentUser.email.trim().toLowerCase())
//       )
//     : attendees.find((a) => {
//         const guestEmail = localStorage.getItem("kuepass_guest_email");
//         return (
//           guestEmail &&
//           a.email &&
//           a.email.trim().toLowerCase() === guestEmail.trim().toLowerCase()
//         );
//       }));
//   console.log(
//     "EventDetails - Is current user registered?",
//     userIsRegistered,
//     "CurrentUser:",
//     currentUser
//   );

//   return (
//     <AuthGuard>
//       <div className={styles.container}>
//         <MantineModal // Using MantineModal for the email prompt
//           opened={showEmailPromptModal}
//           onClose={() => {
//             setShowEmailPromptModal(false);
//             setShowQRModal(
//               false
//             ); /* Also close QR modal if email prompt is cancelled */
//           }}
//           title="Enter Your Registration Email"
//           centered
//         >
//           <Stack align="center" gap="md">
//             <TextInput
//               label="Email"
//               placeholder="your.email@example.com"
//               value={guestEmail}
//               onChange={(e) => setGuestEmail(e.currentTarget.value)}
//               required
//             />
//             <Button onClick={handleEmailSubmit}>Generate My QR Code</Button>
//           </Stack>
//         </MantineModal>

//         <MantineModal // Modal for displaying the QR code
//           opened={showQRModal && !showEmailPromptModal} // Only show if email prompt is not active
//           onClose={() => setShowQRModal(false)}
//           title="Your Event Check-in QR Code"
//           centered
//           size="auto"
//         >
//           <Stack align="center" gap="md">
//             {qrError && <Text color="red">{qrError}</Text>}
//             {qrImage && !qrError && (
//               <>
//                 <Text size="sm" ta="center">
//                   Present this QR code at the event for check-in.
//                 </Text>
//                 <Image
//                   src={qrImage}
//                   width={256}
//                   height={256}
//                   alt="Event Check-in QR Code"
//                 />
//               </>
//             )}
//             {!qrImage && !qrError && <Loader />}
//             <Button
//               onClick={() => setShowQRModal(false)}
//               variant="light"
//               mt="md"
//             >
//               Close
//             </Button>
//           </Stack>
//         </MantineModal>

//         <div
//           className={styles.heroBanner}
//           style={{ backgroundImage: `url(${finalBannerUrl})` }}
//         >
//           <Image
//             src={finalBannerUrl}
//             alt=""
//             style={{ display: "none" }}
//             onError={() =>
//               console.error(
//                 "HeroBanner div's background-image failed to load src:",
//                 finalBannerUrl
//               )
//             }
//           />{" "}
//           {/* Hidden image to catch background image load errors if needed, though CSS handles this gracefully */}
//           <div className={styles.heroOverlay}>
//             <Container size="xl" className={styles.heroContainer}>
//               <div className={styles.heroContent}>
//                 <Badge className={styles.eventBadge} size="lg">
//                   Featured Event
//                 </Badge>
//                 <Title className={styles.heroTitle}>{event.title}</Title>
//                 <Group className={styles.eventMeta}>
//                   <Group className={styles.metaItem}>
//                     <Calendar size={20} />
//                     <Text>
//                       {formatDateOnly(event.start_date)} -{" "}
//                       {formatDateOnly(event.end_date)}
//                     </Text>
//                   </Group>
//                   <Group className={styles.metaItem}>
//                     <Clock size={20} />
//                     <Text>
//                       {formatTime(event.start_date)} -{" "}
//                       {formatTime(event.end_date)}
//                     </Text>
//                   </Group>
//                   {event.location && (
//                     <Group className={styles.metaItem}>
//                       <MapPin size={20} />
//                       <Text>{event.location}</Text>
//                     </Group>
//                   )}
//                 </Group>
//                 <Group className={styles.heroActions}>
//                   {!userIsRegistered && (
//                     <Link
//                       href={`/eventSchedule/registerEvent?eventId=${id}`}
//                       style={{ textDecoration: "none" }}
//                     >
//                       <Button
//                         className={styles.registerButton}
//                         leftSection={<UserPlus size={18} />}
//                         size="lg"
//                       >
//                         Register Now
//                       </Button>
//                     </Link>
//                   )}
//                   {userIsRegistered && (
//                     <Button
//                       className={styles.registerButton}
//                       leftSection={<UserPlus size={18} />}
//                       size="lg"
//                       onClick={handleGenerateQR}
//                     >
//                       My QR Code
//                     </Button>
//                   )}
//                   <Button
//                     variant="outline"
//                     className={styles.shareButton}
//                     leftSection={<Share2 size={18} />}
//                     onClick={handleShareLink}
//                     size="lg"
//                   >
//                     {copied ? "Link Copied!" : "Share Event"}
//                   </Button>
//                 </Group>
//               </div>
//             </Container>
//           </div>
//         </div>

//         {countdownDate && (
//           <div className={styles.countdownSection}>
//             <Container size="xl">
//               <Paper className={styles.countdownContainer}>
//                 <Group
//                   justify="space-between"
//                   align="center"
//                   className={styles.countdownHeader}
//                 >
//                   <Title order={3} className={styles.countdownTitle}>
//                     <Clock size={24} className={styles.countdownIcon} />
//                     Event Starts In
//                   </Title>
//                   <Badge size="lg" className={styles.countdownBadge}>
//                     Don't Miss It!
//                   </Badge>
//                 </Group>
//                 <CountdownTimer targetDate={countdownDate} />
//               </Paper>
//             </Container>
//           </div>
//         )}

//         <Container size="xl" className={styles.mainContent}>
//           <Grid gutter={30}>
//             <Grid.Col span={{ md: 8 }}>
//               <Paper className={styles.contentCard}>
//                 <div className={styles.cardHeader}>
//                   <Title order={2} className={styles.cardTitle}>
//                     <Info size={24} className={styles.cardIcon} />
//                     About This Event
//                   </Title>
//                 </div>
//                 <Divider className={styles.cardDivider} />
//                 <div className={styles.cardBody}>
//                   <Text className={styles.descriptionText}>
//                     {event.description}
//                   </Text>
//                 </div>
//               </Paper>
//             </Grid.Col>
//             <Grid.Col span={{ md: 4 }}>
//               <Stack gap="lg">
//                 <Paper className={styles.contentCard}>
//                   <div className={styles.cardHeader}>
//                     <Title order={3} className={styles.cardTitle}>
//                       <Calendar size={20} className={styles.cardIcon} />
//                       Event Details
//                     </Title>
//                   </div>
//                   <Divider className={styles.cardDivider} />
//                   <div className={styles.cardBody}>
//                     <Stack gap="md">
//                       <div className={styles.detailItem}>
//                         <Text fw={600} className={styles.detailLabel}>
//                           Start Date:
//                         </Text>
//                         <Text>{formatDateOnly(event.start_date)}</Text>
//                       </div>
//                       <div className={styles.detailItem}>
//                         <Text fw={600} className={styles.detailLabel}>
//                           End Date:
//                         </Text>
//                         <Text>{formatDateOnly(event.end_date)}</Text>
//                       </div>
//                       <div className={styles.detailItem}>
//                         <Text fw={600} className={styles.detailLabel}>
//                           Time:
//                         </Text>
//                         <Text>
//                           {formatTime(event.start_date)} -{" "}
//                           {formatTime(event.end_date)}
//                         </Text>
//                       </div>
//                       {event.location && (
//                         <div className={styles.detailItem}>
//                           <Text fw={600} className={styles.detailLabel}>
//                             Location:
//                           </Text>
//                           <Text>{event.location}</Text>
//                         </div>
//                       )}
//                       {event.address && (
//                         <div className={styles.detailItem}>
//                           <Text fw={600} className={styles.detailLabel}>
//                             Address:
//                           </Text>
//                           <Text>{event.address}</Text>
//                         </div>
//                       )}
//                     </Stack>
//                   </div>
//                 </Paper>
//                 {/* QR Code Section in Sidebar (Alternative placement) */}
//                 <Paper className={styles.contentCard}>
//                   <div className={styles.cardHeader}>
//                     <Title order={3} className={styles.cardTitle}>
//                       <Share2 size={20} className={styles.cardIcon} />
//                       Check-In
//                     </Title>
//                   </div>
//                   <Divider className={styles.cardDivider} />
//                   <Stack gap="md" p="md">
//                     <Button onClick={handleGenerateQR} fullWidth>
//                       {showQRModal
//                         ? "View My QR Code"
//                         : "Get My Check-In QR Code"}
//                     </Button>
//                     <Button
//                       onClick={() => setRefreshTrigger(Date.now())}
//                       variant="outline"
//                       fullWidth
//                     >
//                       Refresh My Status
//                     </Button>
//                     {/* QR Code will be displayed in a modal now */}
//                   </Stack>
//                 </Paper>
//               </Stack>
//             </Grid.Col>
//           </Grid>
//           <Group className={styles.actionGroup}>
//             <Link href="/">
//               <Button
//                 className={styles.backButton}
//                 leftSection={<ArrowLeft size={18} />}
//                 size="lg"
//               >
//                 Back to Home
//               </Button>
//             </Link>
//           </Group>
//         </Container>
//         {/* Footer might be in a global layout, but if not: */}
//         {/* <div className={styles.footerWrapper}><CustomFooter /></div> */}
//       </div>
//     </AuthGuard>
//   );
// }

"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation"; // useRouter is needed
import {
  Container,
  Button,
  Text,
  Group,
  Stack,
  Image,
  Flex,
  Loader,
  Center,
  Paper,
  Title,
  Divider,
  Box,
  Grid,
  Badge,
  TextInput,
  Modal as MantineModal,
} from "@mantine/core";
import {
  MapPin,
  Calendar,
  Share2,
  UserPlus,
  ArrowLeft,
  Clock,
  Info,
  QrCode as QrCodeIcon,
} from "lucide-react";
import styles from "./styles.module.css";
import Link from "next/link"; // Still used for other links
import CountdownTimer from "@/components/CountdownTimer";
import QRCode from "qrcode";
import { authenticatedRequest } from "@/app/services/auth";
import AuthGuard from "@/app/components/AuthGuard"; // Assuming this component exists

// Interface definitions (keep as they are)
interface Customization {
  id: string;
  banner_url: string;
  font?: string;
  card_color: string;
  event?: string;
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
  banner_url?: string;
  location: string;
  address?: string;
  customization?: Customization;
}
interface CountdownData {
  id: string;
  event: string;
  target_date: string;
  is_active: boolean;
}
interface AttendeeData {
  id: string;
  event: string;
  user?: number;
  email?: string;
  name: string;
  registration_date: string;
}
interface CurrentUser {
  userId: number;
  email: string;
}

const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("kuepass_auth_token");
  }
  return null;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://keupass-48c2ae65f897.herokuapp.com/api";

const getCurrentUser = async (): Promise<CurrentUser | null> => {
  const token = getAuthToken();
  if (!token) {
    console.log("EventDetails - getCurrentUser: No authToken, user is guest.");
    return null;
  }
  try {
    const response = await fetch(`${API_BASE_URL}/users/me/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      console.error(
        "EventDetails - getCurrentUser: API call failed status",
        response.status
      );
      if (response.status === 401)
        localStorage.removeItem("kuepass_auth_token"); // Clear invalid token
      return null;
    }
    const user = await response.json();
    const userData = user.data || user;
    if (!userData.id || !userData.email) {
      console.error(
        "EventDetails - getCurrentUser: API User data missing id/email",
        userData
      );
      return null;
    }
    return { userId: userData.id, email: userData.email };
  } catch (error) {
    console.error(
      "EventDetails - getCurrentUser Error fetching /users/me/:",
      error
    );
    return null;
  }
};

export default function EventDetails() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;

  const [event, setEvent] = useState<EventData | null>(null);
  const [countdownDate, setCountdownDate] = useState<Date | null>(null);
  const [attendees, setAttendees] = useState<AttendeeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAttendees, setLoadingAttendees] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [showCheckInQRModal, setShowCheckInQRModal] = useState(false);
  const [checkInQrError, setCheckInQrError] = useState<string | null>(null);
  const [checkInQrImage, setCheckInQrImage] = useState<string | null>(null);

  const [showEventPageQRModal, setShowEventPageQRModal] = useState(false);
  const [eventPageQrImage, setEventPageQrImage] = useState<string | null>(null);
  const [eventPageQrError, setEventPageQrError] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const headerContentRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [showEmailPromptModal, setShowEmailPromptModal] = useState(false);
  const [guestEmail, setGuestEmail] = useState("");

  useEffect(() => {
    getCurrentUser().then((user) => {
      console.log("EventDetails - Initial currentUser state set:", user);
      setCurrentUser(user);
    });
  }, []); // Fetch current user on mount

  useEffect(() => {
    if (!id) {
      setPageError("Event ID is missing.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setPageError(null);
    // Event details can be fetched without auth token if page is public
    // If EventDetails page itself requires auth, AuthGuard should handle it.
    // For now, assuming event details are public, but registration requires auth.
    fetch(`${API_BASE_URL}/events/${id}/`, {
      // Using plain fetch if details are public
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(
            errorData.message ||
              errorData.detail ||
              `Failed to load event: ${res.status}`
          );
        }
        return res.json();
      })
      .then((resData) => {
        // Assuming resData is { success: boolean, data: EventData }
        console.log("EventDetails - Event API raw response:", resData);
        if (resData?.success && resData.data) setEvent(resData.data);
        else if (resData && (resData as any).id)
          setEvent(resData as any as EventData);
        else
          throw new Error(
            resData?.message || "Event data not found in response."
          );
      })
      .catch((err) => {
        console.error("EventDetails - Error in fetch event useEffect:", err);
        setPageError(err.message || "Failed to load event details.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Fetch countdowns (conditionally authenticated if needed)
  useEffect(() => {
    if (!event || !id) return;
    // This can also be a public endpoint if countdowns are not sensitive
    fetch(`${API_BASE_URL}/event-countdowns/?event_id=${id}`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res?.success && Array.isArray(res.data)) {
          const activeCountdown = res.data.find(
            (c: CountdownData) => c.event === id && c.is_active
          );
          setCountdownDate(
            new Date(
              activeCountdown ? activeCountdown.target_date : event.start_date
            )
          );
        } else {
          setCountdownDate(new Date(event.start_date));
        }
      })
      .catch(() => setCountdownDate(new Date(event.start_date)));
  }, [event, id]);

  // Fetch attendees (this usually requires authentication)
  useEffect(() => {
    if (!id) return;
    setLoadingAttendees(true);
    authenticatedRequest<
      | AttendeeData[]
      | { success: boolean; data: AttendeeData[]; message?: string }
    >(`${API_BASE_URL}/attendees/?event_id=${id}`, "GET")
      .then((res) => {
        let attendeeDataArray: AttendeeData[] = [];
        if (Array.isArray(res)) attendeeDataArray = res;
        else if (res?.success && Array.isArray(res.data))
          attendeeDataArray = res.data;
        // No error set here if attendees fail, as it might not be critical for page view
        setAttendees(attendeeDataArray);
      })
      .catch((err) => {
        console.warn(
          "EventDetails - Error fetching attendees (non-critical for page view):",
          err
        );
        setAttendees([]);
      })
      .finally(() => setLoadingAttendees(false));
  }, [id, refreshTrigger]);

  // ... (useEffect for cardColor remains the same) ...
  useEffect(() => {
    if (event && headerContentRef.current && event.customization?.card_color) {
      const cardColor = event.customization.card_color;
      // Simplified: Assuming cardColor from backend is valid or CSS handles invalid values gracefully
      headerContentRef.current.style.setProperty(
        "--card-bg-color",
        `rgba(${parseInt(cardColor.slice(1, 3), 16)},${parseInt(
          cardColor.slice(3, 5),
          16
        )},${parseInt(cardColor.slice(5, 7), 16)},0.8)`
      );
    }
  }, [event]);

  const formatDateOnly = (dateString: string): string => {
    /* ... */ if (!dateString) return "N/A";
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  const formatTime = (dateString: string): string => {
    /* ... */ if (!dateString) return "N/A";
    const d = new Date(dateString);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const handleShareLink = async () => {
    /* ... */
  };
  const handleGenerateCheckInQR = async () => {
    /* ... */
  };
  const handleGuestEmailForCheckInQR = async () => {
    /* ... */
  };
  const handleGenerateEventPageQR = async () => {
    /* ... */
  };

  const handleRegisterNowClick = () => {
    if (!id) return; // Should not happen if button is rendered
    if (currentUser) {
      // User is logged in, proceed to registration page
      router.push(`/eventSchedule/registerEvent?eventId=${id}`);
    } else {
      // User is not logged in, redirect to sign-in page, then back to registration
      const redirectTo = `/eventSchedule/registerEvent?eventId=${id}`;
      router.push(`/auth/signin?redirect=${encodeURIComponent(redirectTo)}`);
    }
  };

  if (loading) {
    return (
      <Center style={{ height: "100vh" }}>
        <Loader size="lg" />
        <Text ml="sm">Loading Event...</Text>
      </Center>
    );
  }
  if (pageError || !event) {
    return (
      <Center style={{ height: "100vh", padding: "20px" }}>
        <Paper shadow="xs" p="xl" withBorder>
          <Stack align="center">
            <IconAlertTriangle size={48} color="red" />
            <Title order={3} ta="center">
              {pageError || "Event Not Found"}
            </Title>
            <Button
              component={Link}
              href="/events"
              leftSection={<ArrowLeft size={16} />}
            >
              Back to Events
            </Button>
          </Stack>
        </Paper>
      </Center>
    );
  }

  let finalBannerUrl = "/images/placeholder.jpg";
  if (
    event.customization?.banner_url &&
    event.customization.banner_url.trim() !== ""
  )
    finalBannerUrl = event.customization.banner_url;
  else if (event.banner_url && event.banner_url.trim() !== "")
    finalBannerUrl = event.banner_url;

  const userIsRegistered = !!(currentUser
    ? attendees.find(
        (a) =>
          a.user === currentUser.userId ||
          (a.email &&
            currentUser.email &&
            a.email.toLowerCase() === currentUser.email.toLowerCase())
      )
    : attendees.find((a) => {
        const ge = localStorage.getItem("kuepass_guest_email");
        return ge && a.email && a.email.toLowerCase() === ge.toLowerCase();
      }));

  return (
    // Assuming AuthGuard is for pages that *absolutely require* login to view.
    // If EventDetails is public, AuthGuard might not be needed here,
    // or it should be configured to allow public view but protect actions.
    // For this change, I'm assuming EventDetails itself can be public.
    // <AuthGuard>
    <div className={styles.container}>
      {/* ... (Modals remain the same) ... */}
      <MantineModal
        opened={showEmailPromptModal}
        onClose={() => {
          setShowEmailPromptModal(false);
          setShowCheckInQRModal(false);
        }}
        title="Enter Your Registration Email"
        centered
      >
        <Stack align="center" gap="md">
          <TextInput
            label="Email"
            placeholder="your.email@example.com"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.currentTarget.value)}
            required
          />
          <Button onClick={handleGuestEmailForCheckInQR}>
            Generate My Check-In QR
          </Button>
        </Stack>
      </MantineModal>
      <MantineModal
        opened={showCheckInQRModal && !showEmailPromptModal}
        onClose={() => setShowCheckInQRModal(false)}
        title="Your Event Check-in QR Code"
        centered
        size="auto"
      >
        <Stack align="center" gap="md">
          {checkInQrError && <Text color="red">{checkInQrError}</Text>}
          {checkInQrImage && !checkInQrError && (
            <>
              <Text size="sm" ta="center">
                Present this QR code at the event for check-in.
              </Text>
              <Image
                src={checkInQrImage}
                width={256}
                height={256}
                alt="Event Check-in QR Code"
              />
            </>
          )}
          {!checkInQrImage && !checkInQrError && <Loader />}
          <Button
            onClick={() => setShowCheckInQRModal(false)}
            variant="light"
            mt="md"
          >
            Close
          </Button>
        </Stack>
      </MantineModal>
      <MantineModal
        opened={showEventPageQRModal}
        onClose={() => setShowEventPageQRModal(false)}
        title="Share Event via QR Code"
        centered
        size="auto"
      >
        <Stack align="center" gap="md">
          {eventPageQrError && <Text color="red">{eventPageQrError}</Text>}
          {eventPageQrImage && !eventPageQrError && (
            <>
              <Text size="sm" ta="center">
                Scan this QR code to view the event page.
              </Text>
              <Image
                src={eventPageQrImage}
                width={256}
                height={256}
                alt="Event Page QR Code"
              />
            </>
          )}
          {!eventPageQrImage && !eventPageQrError && <Loader />}
          <Button
            onClick={() => setShowEventPageQRModal(false)}
            variant="light"
            mt="md"
          >
            Close
          </Button>
        </Stack>
      </MantineModal>

      <div
        className={styles.heroBanner}
        style={{ backgroundImage: `url(${finalBannerUrl})` }}
      >
        {/* ... (Hero Banner content) ... */}
        <div className={styles.heroOverlay}>
          <Container size="xl" className={styles.heroContainer}>
            <div className={styles.heroContent}>
              <Badge className={styles.eventBadge} size="lg">
                Featured Event
              </Badge>
              <Title className={styles.heroTitle}>{event.title}</Title>
              <Group className={styles.eventMeta}>
                <Group className={styles.metaItem}>
                  <Calendar size={20} />
                  <Text>
                    {formatDateOnly(event.start_date)} -{" "}
                    {formatDateOnly(event.end_date)}
                  </Text>
                </Group>
                <Group className={styles.metaItem}>
                  <Clock size={20} />
                  <Text>
                    {formatTime(event.start_date)} -{" "}
                    {formatTime(event.end_date)}
                  </Text>
                </Group>
                {event.location && (
                  <Group className={styles.metaItem}>
                    <MapPin size={20} />
                    <Text>{event.location}</Text>
                  </Group>
                )}
              </Group>
              <Group className={styles.heroActions}>
                {!userIsRegistered && (
                  // MODIFIED BUTTON:
                  <Button
                    className={styles.registerButton}
                    leftSection={<UserPlus size={18} />}
                    size="lg"
                    onClick={handleRegisterNowClick} // Use onClick handler
                  >
                    Register Now
                  </Button>
                )}
                {userIsRegistered && (
                  <Button
                    className={styles.registerButton}
                    leftSection={<UserPlus size={18} />}
                    size="lg"
                    onClick={handleGenerateCheckInQR}
                  >
                    My Check-In QR
                  </Button>
                )}
                <Button
                  variant="outline"
                  className={styles.shareButton}
                  leftSection={<Share2 size={18} />}
                  onClick={handleShareLink}
                  size="lg"
                >
                  {copied ? "Link Copied!" : "Share Event"}
                </Button>
                <Button
                  variant="outline"
                  className={styles.shareButton}
                  leftSection={<QrCodeIcon size={18} />}
                  onClick={handleGenerateEventPageQR}
                  size="lg"
                >
                  Event Page QR
                </Button>
              </Group>
            </div>
          </Container>
        </div>
      </div>

      {/* ... (Countdown, Main Content, Grid, Footer sections remain the same) ... */}
      {countdownDate && (
        <div className={styles.countdownSection}>
          <Container size="xl">
            <Paper className={styles.countdownContainer}>
              <Group
                justify="space-between"
                align="center"
                className={styles.countdownHeader}
              >
                <Title order={3} className={styles.countdownTitle}>
                  <Clock size={24} className={styles.countdownIcon} />
                  Event Starts In
                </Title>
                <Badge size="lg" className={styles.countdownBadge}>
                  Don't Miss It!
                </Badge>
              </Group>
              <CountdownTimer targetDate={countdownDate} />
            </Paper>
          </Container>
        </div>
      )}
      <Container size="xl" className={styles.mainContent}>
        <Grid gutter={30}>
          <Grid.Col span={{ md: 8 }}>
            <Paper className={styles.contentCard}>
              <div className={styles.cardHeader}>
                <Title order={2} className={styles.cardTitle}>
                  <Info size={24} className={styles.cardIcon} />
                  About This Event
                </Title>
              </div>
              <Divider className={styles.cardDivider} />
              <div className={styles.cardBody}>
                <Text className={styles.descriptionText}>
                  {event.description}
                </Text>
              </div>
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ md: 4 }}>
            <Stack gap="lg">
              <Paper className={styles.contentCard}>
                <div className={styles.cardHeader}>
                  <Title order={3} className={styles.cardTitle}>
                    <Calendar size={20} className={styles.cardIcon} />
                    Event Details
                  </Title>
                </div>
                <Divider className={styles.cardDivider} />
                <div className={styles.cardBody}>
                  <Stack gap="md">
                    <div className={styles.detailItem}>
                      <Text fw={600} className={styles.detailLabel}>
                        Start Date:
                      </Text>
                      <Text>{formatDateOnly(event.start_date)}</Text>
                    </div>
                    <div className={styles.detailItem}>
                      <Text fw={600} className={styles.detailLabel}>
                        End Date:
                      </Text>
                      <Text>{formatDateOnly(event.end_date)}</Text>
                    </div>
                    <div className={styles.detailItem}>
                      <Text fw={600} className={styles.detailLabel}>
                        Time:
                      </Text>
                      <Text>
                        {formatTime(event.start_date)} -{" "}
                        {formatTime(event.end_date)}
                      </Text>
                    </div>
                    {event.location && (
                      <div className={styles.detailItem}>
                        <Text fw={600} className={styles.detailLabel}>
                          Location:
                        </Text>
                        <Text>{event.location}</Text>
                      </div>
                    )}
                    {event.address && event.location === "Physical" && (
                      <div className={styles.detailItem}>
                        <Text fw={600} className={styles.detailLabel}>
                          Address:
                        </Text>
                        <Text>{event.address}</Text>
                      </div>
                    )}
                  </Stack>
                </div>
              </Paper>
              <Paper className={styles.contentCard}>
                <div className={styles.cardHeader}>
                  <Title order={3} className={styles.cardTitle}>
                    <UserPlus size={20} className={styles.cardIcon} />
                    Check-In / Status
                  </Title>
                </div>
                <Divider className={styles.cardDivider} />
                <Stack gap="xs" p="md">
                  {userIsRegistered ? (
                    <Button
                      onClick={handleGenerateCheckInQR}
                      fullWidth
                      leftSection={<QrCodeIcon size={16} />}
                    >
                      My Check-In QR
                    </Button>
                  ) : (
                    <Button
                      component={Link}
                      href={`/eventSchedule/registerEvent?eventId=${id}`}
                      fullWidth
                      leftSection={<UserPlus size={16} />}
                    >
                      Register for Event
                    </Button>
                  )}
                  <Button
                    onClick={() => setRefreshTrigger(Date.now())}
                    variant="outline"
                    fullWidth
                  >
                    Refresh My Status
                  </Button>
                  <Button
                    onClick={handleGenerateEventPageQR}
                    variant="outline"
                    fullWidth
                    leftSection={<QrCodeIcon size={16} />}
                  >
                    Event Page QR
                  </Button>
                </Stack>
              </Paper>
            </Stack>
          </Grid.Col>
        </Grid>
        <Group className={styles.actionGroup}>
          <Link href="/eventSchedule/exploreEvent">
            <Button
              className={styles.backButton}
              leftSection={<ArrowLeft size={18} />}
              size="lg"
            >
              Back to Events
            </Button>
          </Link>
        </Group>
      </Container>
    </div>
    // </AuthGuard>
  );
}
