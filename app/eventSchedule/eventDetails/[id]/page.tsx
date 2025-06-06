"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Container,
  Button,
  Text,
  Group,
  Stack,
  Image,
  Flex, // Flex was not used in your provided JSX, but keeping import
  Loader,
  Center,
  Paper,
  Title,
  Divider,
  Box, // Box was not used in your provided JSX, but keeping import
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
  AlertTriangle,
} from "lucide-react";
import styles from "./styles.module.css"; // Ensure this path is correct
import Link from "next/link";
import CountdownTimer from "@/components/CountdownTimer"; // Ensure this path is correct
import QRCode from "qrcode";
import { authenticatedRequest } from "@/app/services/auth"; // Ensure this path is correct
// import AuthGuard from "@/app/components/AuthGuard"; // Commented out as per your code

// --- INTERFACE DEFINITIONS ---
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

// --- MODIFIED AttendeeData INTERFACE ---
interface AttendeeData {
  id: string;
  event: string;
  user?: number;
  email?: string;
  name: string;
  registration_date: string;
  is_validated?: boolean; // <<< IMPORTANT: Ensure your API sends this
  payment_status?: string; // <<< IMPORTANT: Ensure your API sends this (e.g., "pending", "completed", "failed")
  validated_at?: string | null; // From your previous Swagger output
  // You might also have 'responses' here if you fetch them for attendees
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
    // console.log("EventDetails - getCurrentUser: No authToken, user is guest."); // Less verbose
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
        localStorage.removeItem("kuepass_auth_token");
      return null;
    }
    const user = await response.json();
    const userData = user.data || user; // Handle cases where data might be nested
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
  const [loadingAttendees, setLoadingAttendees] = useState(false); // Kept this state if you want separate loading for attendees
  const [pageError, setPageError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // For manually refreshing attendee list

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
      // console.log("EventDetails - Initial currentUser state set:", user); // Less verbose
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

    fetch(`${API_BASE_URL}/events/${id}/`, {
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
        const eventData = resData?.data || resData; // Handle nested data or direct data
        if (eventData && eventData.id) {
          setEvent(eventData as EventData);
        } else {
          throw new Error(
            resData?.message || "Event data not found in response."
          );
        }
      })
      .catch((err) => {
        console.error("EventDetails - Error fetching event:", err);
        setPageError(err.message || "Failed to load event details.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!event || !id) return;
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

  useEffect(() => {
    if (!id) return;
    setLoadingAttendees(true); // Use this if you want a separate loader for attendees
    authenticatedRequest<
      | AttendeeData[]
      | { success: boolean; data: AttendeeData[]; message?: string }
    >(`${API_BASE_URL}/attendees/?event_id=${id}`, "GET")
      .then((res) => {
        let attendeeDataArray: AttendeeData[] = [];
        if (Array.isArray(res)) attendeeDataArray = res;
        else if (res?.success && Array.isArray(res.data))
          attendeeDataArray = res.data;
        setAttendees(attendeeDataArray);
      })
      .catch((err) => {
        console.warn("EventDetails - Error fetching attendees:", err);
        setAttendees([]);
      })
      .finally(() => setLoadingAttendees(false));
  }, [id, refreshTrigger, currentUser]); // Re-fetch attendees if currentUser changes (e.g., after login)

  useEffect(() => {
    if (event && headerContentRef.current && event.customization?.card_color) {
      const cardColor = event.customization.card_color;
      try {
        headerContentRef.current.style.setProperty(
          "--card-bg-color",
          `rgba(${parseInt(cardColor.slice(1, 3), 16)},${parseInt(
            cardColor.slice(3, 5),
            16
          )},${parseInt(cardColor.slice(5, 7), 16)},0.8)`
        );
      } catch (e) {
        console.warn("Failed to set card color from customization", e);
      }
    }
  }, [event]);

  const formatDateOnly = (dateString: string): string => {
    /* ... (implementation as provided) ... */
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  const formatTime = (dateString: string): string => {
    /* ... (implementation as provided) ... */
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleShareLink = async () => {
    /* ... (implementation as provided, ensure it uses window.location.href if that's the link to share) ... */
    if (typeof window !== "undefined") {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
      } catch (err) {
        console.error("Failed to copy event link: ", err);
        alert("Failed to copy link. Please try again or copy manually.");
      }
    }
  };

  const handleGenerateCheckInQR = async () => {
    /* ... (implementation as provided, or adapt if needed) ... */
    setShowCheckInQRModal(true);
    setCheckInQrError(null);
    setCheckInQrImage(null);

    if (!currentUser && !localStorage.getItem("kuepass_guest_email")) {
      setShowEmailPromptModal(true); // Prompt for email if no user and no guest email
      return;
    }

    const userEmailForQR =
      currentUser?.email || localStorage.getItem("kuepass_guest_email");

    if (!userEmailForQR) {
      setCheckInQrError("Could not determine user email for QR code.");
      return;
    }

    // Find the specific attendee record for QR code generation
    const specificAttendee = attendees.find(
      (att) =>
        (currentUser && att.user === currentUser.userId) ||
        (att.email &&
          userEmailForQR &&
          att.email.toLowerCase() === userEmailForQR.toLowerCase())
    );

    if (!specificAttendee || !specificAttendee.is_validated) {
      setCheckInQrError(
        "Your registration is not fully validated or payment is pending. Please refresh or contact support."
      );
      // Do not proceed to show the main QR modal if validation fails here.
      // setShowEmailPromptModal(false); // Ensure email prompt is hidden if it was shown
      return;
    }

    setShowEmailPromptModal(false); // Close email prompt if it was open and we're proceeding

    try {
      const qrData = JSON.stringify({
        attendeeId: specificAttendee.id,
        eventId: id,
        userId: specificAttendee.user,
        email: specificAttendee.email,
        name: specificAttendee.name,
        timestamp: Date.now(),
      });
      const qrImageData = await QRCode.toDataURL(qrData, {
        width: 256,
        margin: 2,
        errorCorrectionLevel: "H",
      });
      setCheckInQrImage(qrImageData);
    } catch (error) {
      console.error(
        "EventDetails - Check-In QR Code generation failed:",
        error
      );
      setCheckInQrError("Failed to generate QR code.");
    }
  };

  const handleGuestEmailForCheckInQR = async () => {
    /* ... (implementation as provided, ensure it calls handleGenerateCheckInQR after setting email) ... */
    if (!guestEmail.trim()) {
      alert("Please enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
      alert("Please enter a valid email address.");
      return;
    }
    localStorage.setItem("kuepass_guest_email", guestEmail.toLowerCase()); // Store for guest identification
    setShowEmailPromptModal(false);
    handleGenerateCheckInQR(); // Retry QR generation
  };

  const handleGenerateEventPageQR = async () => {
    setShowEventPageQRModal(true);
    setEventPageQrError(null);
    setEventPageQrImage(null);
    if (typeof window === "undefined") {
      setEventPageQrError("Cannot generate QR code (window not available).");
      return;
    }
    try {
      const eventPageUrl = window.location.href;
      const qrImageData = await QRCode.toDataURL(eventPageUrl, {
        width: 256,
        margin: 2,
        errorCorrectionLevel: "H",
      });
      setEventPageQrImage(qrImageData);
    } catch (error) {
      console.error(
        "EventDetails - Event Page QR Code generation failed:",
        error
      );
      setEventPageQrError("Failed to generate QR code for the event page.");
    }
  };

  const handleDownloadQR = () => {
    if (!eventPageQrImage) return;

    // Create a temporary link element
    const link = document.createElement("a");
    link.href = eventPageQrImage;
    link.download = `event-qr-${
      event?.title?.toLowerCase().replace(/\s+/g, "-") || "code"
    }.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRegisterNowClick = () => {
    /* ... (implementation as provided) ... */
    if (!id) return;
    if (currentUser) {
      router.push(`/eventSchedule/registerEvent?eventId=${id}`);
    } else {
      const redirectTo = `/eventSchedule/registerEvent?eventId=${id}`;
      router.push(`/auth/signin?redirect=${encodeURIComponent(redirectTo)}`);
    }
  };

  if (loading) {
    /* ... (loading JSX as provided) ... */
    return (
      <Center style={{ height: "100vh" }}>
        <Loader size="lg" />
        <Text ml="sm">Loading Event...</Text>
      </Center>
    );
  }
  if (pageError || !event) {
    /* ... (error JSX as provided) ... */
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

  let finalBannerUrl = "/images/placeholder.jpg"; // Default placeholder
  if (
    event.customization?.banner_url &&
    event.customization.banner_url.trim() !== ""
  )
    finalBannerUrl = event.customization.banner_url;
  else if (event.banner_url && event.banner_url.trim() !== "")
    finalBannerUrl = event.banner_url;

  // --- UPDATED LOGIC for userIsRegisteredAndValidated ---
  const userIsRegisteredAndValidated = !!(currentUser
    ? attendees.find(
        (attendee) =>
          (attendee.user === currentUser.userId ||
            (attendee.email &&
              currentUser.email &&
              attendee.email.toLowerCase() ===
                currentUser.email.toLowerCase())) &&
          attendee.is_validated === true // Check if the attendee record is validated
      )
    : attendees.find((attendee) => {
        const ge =
          typeof window !== "undefined"
            ? localStorage.getItem("kuepass_guest_email")
            : null;
        return (
          ge &&
          attendee.email &&
          attendee.email.toLowerCase() === ge.toLowerCase() &&
          attendee.is_validated === true
        ); // Also check for guest
      }));

  return (
    // <AuthGuard> // Assuming AuthGuard is not strictly needed for viewing this page
    <div className={styles.container}>
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
              {" "}
              <Text size="sm" ta="center">
                Present this QR code at the event for check-in.
              </Text>{" "}
              <Image
                src={checkInQrImage}
                width={256}
                height={256}
                alt="Event Check-in QR Code"
              />{" "}
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
              <Paper p="md" withBorder>
                <Image
                  src={eventPageQrImage}
                  width={256}
                  height={256}
                  alt="Event Page QR Code"
                />
              </Paper>
              <Group>
                <Button
                  onClick={handleDownloadQR}
                  leftSection={<Share2 size={16} />}
                  variant="filled"
                >
                  Download QR Code
                </Button>
                <Button
                  onClick={() => setShowEventPageQRModal(false)}
                  variant="light"
                >
                  Close
                </Button>
              </Group>
            </>
          )}
          {!eventPageQrImage && !eventPageQrError && <Loader />}
        </Stack>
      </MantineModal>

      <div
        className={styles.heroBanner}
        style={{ backgroundImage: `url(${finalBannerUrl})` }}
      >
        <div className={styles.heroOverlay}>
          <Container size="xl" className={styles.heroContainer}>
            <div className={styles.heroContent} ref={headerContentRef}>
              {" "}
              {/* Added ref here if needed for cardColor */}
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
                {/* --- UPDATED BUTTON LOGIC --- */}
                {!userIsRegisteredAndValidated ? (
                  <Button
                    className={styles.registerButton}
                    leftSection={<UserPlus size={18} />}
                    size="lg"
                    onClick={handleRegisterNowClick}
                  >
                    Register Now
                  </Button>
                ) : (
                  <Button
                    className={styles.registerButton}
                    leftSection={<QrCodeIcon size={18} />}
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
                  {/* This button block also needs to use userIsRegisteredAndValidated */}
                  {userIsRegisteredAndValidated ? (
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
                  {/* Event Page QR button was already present in hero, perhaps remove duplicate or keep if intended */}
                  {/* <Button onClick={handleGenerateEventPageQR} variant="outline" fullWidth leftSection={<QrCodeIcon size={16} />} > Event Page QR </Button> */}
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
