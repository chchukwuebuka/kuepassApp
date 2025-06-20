
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
  AlertTriangle,
} from "lucide-react";
import styles from "./styles.module.css";
import Link from "next/link";
import CountdownTimer from "@/components/CountdownTimer";
import QRCode from "qrcode";
import { authenticatedRequest } from "@/app/services/auth";
import { useLoadingState } from "@/store/loadingHook";

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

interface AttendeeData {
  id: string;
  event: string;
  user?: number;
  email?: string;
  name: string;
  registration_date: string;
  is_validated?: boolean;
  payment_status?: string;
  validated_at?: string | null;
}

interface CurrentUser {
  userId: number;
  email: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://keupass-48c2ae65f897.herokuapp.com/api";

// This function needs getAuthToken to be defined somewhere in your project
// For example: const getAuthToken = () => localStorage.getItem("kuepass_auth_token");
// As it's not defined in the file, I'm assuming it exists globally or is imported elsewhere.
const getAuthToken = () => {
    if (typeof window !== "undefined") {
        return localStorage.getItem("kuepass_auth_token");
    }
    return null;
}


const getCurrentUser = async (): Promise<CurrentUser | null> => {
  const token = getAuthToken();
  if (!token) {
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
      if (response.status === 401)
        localStorage.removeItem("kuepass_auth_token");
      return null;
    }
    const user = await response.json();
    const userData = user.data || user;
    if (!userData.id || !userData.email) {
      return null;
    }
    return { userId: userData.id, email: userData.email };
  } catch (error) {
    console.error("Error fetching /users/me/:", error);
    return null;
  }
};

export default function EventDetails() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;
  const { withLoading } = useLoadingState();

  const [event, setEvent] = useState<EventData | null>(null);
  const [countdownDate, setCountdownDate] = useState<Date | null>(null);
  const [attendees, setAttendees] = useState<AttendeeData[]>([]);
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
  
  // --- ADDED THIS LINE ---
  // This state tracks if the initial authentication check has completed.
  const [isAuthCheckComplete, setIsAuthCheckComplete] = useState(false);


  useEffect(() => {
    // --- UPDATED THIS HOOK ---
    setIsAuthCheckComplete(false); // Start the check
    getCurrentUser().then((user) => {
      setCurrentUser(user);
      setIsAuthCheckComplete(true); // Mark the check as complete
    });
  }, []);

  useEffect(() => {
    if (!id) {
      setPageError("Event ID is missing.");
      return;
    }
    setPageError(null);

    withLoading(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/events/${id}/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        // --- THIS IS THE ONLY LINE ADDED ---
        // It will print the exact server response to your browser console
        const responseBodyForDebug = await response.clone().text();
        console.log("FULL API RESPONSE FOR EVENT:", responseBodyForDebug);

        if (!response.ok) {
          const errorData = JSON.parse(responseBodyForDebug);
          throw new Error(
            errorData.message ||
              errorData.detail ||
              `Failed to load event: ${response.status}`
          );
        }

        const resData = JSON.parse(responseBodyForDebug);
        const eventData = resData?.data || resData;
        if (eventData && eventData.id) {
          setEvent(eventData as EventData);
        } else {
          throw new Error(
            resData?.message || "Event data not found in response."
          );
        }
      } catch (err: any) {
        console.error("EventDetails - Error fetching event:", err);
        setPageError(err.message || "Failed to load event details.");
      }
    });
  }, [id]);

  useEffect(() => {
    if (!event || !id) return;

    withLoading(async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/event-countdowns/?event_id=${id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );
        const res = await response.json();
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
      } catch (error) {
        setCountdownDate(new Date(event.start_date));
      }
    });
  }, [event, id]);

  useEffect(() => {
    if (!id) return;

    withLoading(async () => {
      try {
        const res = await authenticatedRequest<
          | AttendeeData[]
          | { success: boolean; data: AttendeeData[]; message?: string }
        >(`${API_BASE_URL}/attendees/?event_id=${id}`, "GET");

        let attendeeDataArray: AttendeeData[] = [];
        if (Array.isArray(res)) attendeeDataArray = res;
        else if (res?.success && Array.isArray(res.data))
          attendeeDataArray = res.data;
        setAttendees(attendeeDataArray);
      } catch (err) {
        console.warn("EventDetails - Error fetching attendees:", err);
        setAttendees([]);
      }
    });
  }, [id, refreshTrigger, currentUser]);

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
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  const formatTime = (dateString: string): string => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleShareLink = async () => {
    if (typeof window !== "undefined") {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy event link: ", err);
        alert("Failed to copy link. Please try again or copy manually.");
      }
    }
  };

  const handleGenerateCheckInQR = async () => {
    setShowCheckInQRModal(true);
    setCheckInQrError(null);
    setCheckInQrImage(null);
    if (!currentUser && !localStorage.getItem("kuepass_guest_email")) {
      setShowEmailPromptModal(true);
      return;
    }
    const userEmailForQR =
      currentUser?.email || localStorage.getItem("kuepass_guest_email");
    if (!userEmailForQR) {
      setCheckInQrError("Could not determine user email for QR code.");
      return;
    }
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
      return;
    }
    setShowEmailPromptModal(false);
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
    if (!guestEmail.trim()) {
      alert("Please enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
      alert("Please enter a valid email address.");
      return;
    }
    localStorage.setItem("kuepass_guest_email", guestEmail.toLowerCase());
    setShowEmailPromptModal(false);
    handleGenerateCheckInQR();
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
    if (!id) return;
    if (currentUser) {
      router.push(`/eventSchedule/registerEvent?eventId=${id}`);
    } else {
      const redirectTo = `/eventSchedule/registerEvent?eventId=${id}`;
      router.push(`/auth/signin?redirect=${encodeURIComponent(redirectTo)}`);
    }
  };

  if (pageError || !event) {
    return (
      <Center style={{ height: "100vh", padding: "20px" }}>
        <Paper shadow="xs" p="xl" withBorder>
          <Stack align="center">
            {/* <AlertTriangle size={48} color="red" /> */}
            {/* <Title order={3} ta="center">
              {pageError || "Event Not Found"}
            </Title> */}
            {/* <Button
              component={Link}
              href="/events"
              leftSection={<ArrowLeft size={16} />}
            >
              Back to Events
            </Button> */}
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

  const userIsRegisteredAndValidated = !!(currentUser
    ? attendees.find(
        (attendee) =>
          (attendee.user === currentUser.userId ||
            (attendee.email &&
              currentUser.email &&
              attendee.email.toLowerCase() ===
                currentUser.email.toLowerCase())) &&
          attendee.is_validated === true
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
        );
      }));

  return (
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
                {!userIsRegisteredAndValidated ? (
                  <Button
                    className={styles.registerButton}
                    leftSection={<UserPlus size={18} />}
                    size="lg"
                    onClick={handleRegisterNowClick}
                    // --- UPDATED THIS BUTTON ---
                    disabled={!isAuthCheckComplete}
                  >
                    {!isAuthCheckComplete ? "Verifying..." : "Register Now"}
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
                  Don&lsquo;t Miss It!
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
                      onClick={handleRegisterNowClick}
                      fullWidth
                      leftSection={<UserPlus size={16} />}
                      // --- UPDATED THIS BUTTON ---
                      disabled={!isAuthCheckComplete}
                    >
                      {!isAuthCheckComplete
                        ? "Verifying..."
                        : "Register for Event"}
                    </Button>
                  )}
                  <Button
                    onClick={() => setRefreshTrigger(Date.now())}
                    variant="outline"
                    fullWidth
                  >
                    Refresh My Status
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
  );
}