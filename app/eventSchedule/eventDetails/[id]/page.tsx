"use client";

import {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
  Suspense,
} from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

export const dynamic = "force-dynamic";
import Link from "next/link";
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
  Menu,
  ActionIcon,
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
  MoreVertical,
  Bookmark,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import styles from "./styles.module.css";
import CountdownTimer from "@/components/CountdownTimer";
import QRCode from "qrcode";
import { authenticatedRequest } from "@/app/services/auth";
import { useLoadingState } from "@/store/loadingHook";

// --- INTERFACE DEFINITIONS ---
interface Customization {
  id: string;
  banner_url: string | string[];
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
  price?: string;
  creator?: {
    id: number;
    username: string;
    email?: string;
  };
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

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.kuepass.com/api/"
).replace(/\/$/, "");

const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("kuepass_auth_token");
  }
  return null;
};

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

// --- VALIDATION LOGIC ---
const checkUserRegistration = (
  user: CurrentUser | null,
  attendeeList: AttendeeData[]
): boolean => {
  if (!user) {
    const guestEmail =
      typeof window !== "undefined"
        ? localStorage.getItem("kuepass_guest_email")
        : null;
    if (!guestEmail || !attendeeList || attendeeList.length === 0) {
      return false;
    }
    const guestAttendee = attendeeList.find(
      (attendee) => attendee.email?.toLowerCase() === guestEmail.toLowerCase()
    );
    return !!guestAttendee; // Check presence only
  }

  if (!attendeeList || attendeeList.length === 0) {
    return false;
  }

  const userAttendee = attendeeList.find((attendee) => {
    const attendeeUserId = attendee.user;
    const currentUserId = user.userId;

    if (attendeeUserId != null && currentUserId != null) {
      if (String(attendeeUserId) === String(currentUserId)) {
        return true;
      }
    }

    const attendeeEmail = attendee.email?.toLowerCase();
    const currentUserEmail = user.email?.toLowerCase();
    if (
      attendeeEmail &&
      currentUserEmail &&
      attendeeEmail === currentUserEmail
    ) {
      return true;
    }

    return false;
  });

  return !!userAttendee; // Check presence only
};

function EventDetailsContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params?.id;
  const { withLoading } = useLoadingState();

  const [event, setEvent] = useState<EventData | null>(null);
  const [customization, setCustomization] = useState<Customization | null>(
    null
  );
  const [countdownDate, setCountdownDate] = useState<Date | null>(null);
  const [attendees, setAttendees] = useState<AttendeeData[]>([]);
  const [pageError, setPageError] = useState<string | null>(null);
  const [showCheckInQRModal, setShowCheckInQRModal] = useState(false);
  const [checkInQrError, setCheckInQrError] = useState<string | null>(null);
  const [checkInQrImage, setCheckInQrImage] = useState<string | null>(null);
  const [showEventPageQRModal, setShowEventPageQRModal] = useState(false);
  const [eventPageQrImage, setEventPageQrImage] = useState<string | null>(null);
  const [eventPageQrError, setEventPageQrError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isAuthCheckComplete, setIsAuthCheckComplete] = useState(false);
  const headerContentRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [showEmailPromptModal, setShowEmailPromptModal] = useState(false);
  const [guestEmail, setGuestEmail] = useState("");
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [mapUrl, setMapUrl] = useState<string>("");
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Set auth check as complete immediately since we allow guest access
  useEffect(() => {
    setIsAuthCheckComplete(true);
  }, []);

  // Set hardcoded location (replace with your actual coordinates)
  useEffect(() => {
    // Hardcoded coordinates - replace with your location
    // Example: Lagos, Nigeria coordinates
    setUserLocation({
      lat: 6.4483, // Replace with your latitude
      lng: 7.5139, // Replace with your longitude
    });
  }, []);

  // Build the directions URL immediately - much simpler approach
  useEffect(() => {
    if (event) {
      // Try to get the most specific location information
      let destination = "";

      if (
        event.address &&
        event.address.trim() !== "" &&
        event.address !== "TBD"
      ) {
        destination = event.address;
      } else if (
        event.location &&
        event.location.trim() !== "" &&
        event.location !== "Event Location"
      ) {
        destination = event.location;
      } else {
        // Fallback to a default location if no specific address is available
        destination = "Lagos, Nigeria"; // You can change this to your preferred default
      }

      console.log("Map destination:", destination); // Debug log

      const encodedDestination = encodeURIComponent(destination);
      const mapUrl = `https://maps.google.com/maps?q=${encodedDestination}&output=embed`;

      setMapUrl(mapUrl);
    }
  }, [event]);

  const fetchAttendees = useCallback(async () => {
    if (!id) return;

    try {
      console.log("=== DEBUG: Fetching attendees ===");
      console.log("Event ID:", id);

      // Use regular fetch instead of authenticatedRequest for guest access
      const response = await fetch(
        `${API_BASE_URL}/attendees/?event_id=${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        console.warn("Failed to fetch attendees:", response.status);
        setAttendees([]);
        return;
      }

      const res = await response.json();
      console.log("Raw API Response for Attendees:", res);

      let attendeeDataArray: AttendeeData[] = [];
      if (Array.isArray(res)) attendeeDataArray = res;
      else if (res?.results && Array.isArray(res.results))
        attendeeDataArray = res.results; // Handle paginated response
      else if (res?.success && Array.isArray(res.data))
        attendeeDataArray = res.data;

      console.log(
        "Processed Attendee Data:",
        JSON.stringify(attendeeDataArray, null, 2)
      );
      setAttendees(attendeeDataArray);
    } catch (err) {
      console.warn("EventDetails - Error fetching attendees:", err);
      setAttendees([]);
    }
  }, [id]);

  useEffect(() => {
    if (!id) {
      setPageError("Event ID is missing.");
      return;
    }
    setPageError(null);

    const fetchEvent = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/events/${id}/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

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
    };

    fetchEvent();
  }, [id]);

  // Fetch customization separately (same pattern as exploreEvent - customization is included in event object)
  useEffect(() => {
    if (!id) return;

    const fetchCustomization = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/event-customizations/?event=${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          console.warn("Failed to fetch customization:", response.status);
          return;
        }

        const res = await response.json();
        const customizationList = Array.isArray(res)
          ? res
          : res?.data && Array.isArray(res.data)
          ? res.data
          : res?.success && Array.isArray(res.data)
          ? res.data
          : [];

        if (customizationList.length > 0) {
          setCustomization(customizationList[0] as Customization);
          // Merge customization into event object (same as exploreEvent pattern)
          setEvent((prevEvent) => {
            if (prevEvent) {
              return {
                ...prevEvent,
                customization: customizationList[0] as Customization,
              };
            }
            return prevEvent;
          });
        }
      } catch (err) {
        console.warn("Error fetching customization:", err);
      }
    };

    fetchCustomization();
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchAttendees();
    }
  }, [id, fetchAttendees]);

  useEffect(() => {
    if (searchParams.get("refresh") === "true" && id) {
      console.log(
        "=== DEBUG: Refresh query param detected, fetching attendees ==="
      );
      fetchAttendees();
      setTimeout(() => fetchAttendees(), 1000);
      setTimeout(() => fetchAttendees(), 3000);
      router.replace(`/eventSchedule/eventDetails/${id}`);
    }
  }, [searchParams, id, router, fetchAttendees]);

  useEffect(() => {
    if (!event || !id) return;

    const fetchCountdown = async () => {
      try {
        const response = await authenticatedRequest<
          | CountdownData[]
          | { success: boolean; data: CountdownData[]; message?: string }
        >(`${API_BASE_URL}/event-countdowns/?event_id=${id}`, "GET");
        let countdownData: CountdownData[] = [];
        if (Array.isArray(response)) countdownData = response;
        else if (response?.success && Array.isArray(response.data))
          countdownData = response.data;

        const activeCountdown = countdownData.find(
          (c: CountdownData) => c.event === id && c.is_active
        );
        setCountdownDate(
          new Date(
            activeCountdown
              ? activeCountdown.target_date
              : event?.start_date || new Date()
          )
        );
      } catch (error) {
        console.warn("Error fetching countdown:", error);
        setCountdownDate(new Date(event?.start_date || new Date()));
      }
    };

    fetchCountdown();
  }, [event, id]);

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

  const formatPrice = (price: string | number | undefined): string => {
    if (!price) return "Free";
    if (price === "free" || price === "0" || price === 0) return "Free";
    const numericPrice = parseFloat(price.toString());
    if (isNaN(numericPrice) || numericPrice <= 0) return "Free";
    return `N${price}`;
  };

  const truncateDescription = (
    description: string,
    maxLength: number = 150
  ): string => {
    if (!description) return "No description available.";
    if (description.length <= maxLength) return description;

    // Find the last complete word within the limit
    const truncated = description.substring(0, maxLength);
    const lastSpaceIndex = truncated.lastIndexOf(" ");

    if (lastSpaceIndex > 0) {
      return truncated.substring(0, lastSpaceIndex) + "...";
    }

    return truncated + "...";
  };

  const truncateDescriptionByWords = (
    description: string,
    maxWords: number = 65
  ): { text: string; shouldShowButton: boolean } => {
    if (!description)
      return { text: "No description available.", shouldShowButton: false };

    const words = description.split(" ");
    if (words.length <= maxWords) {
      return { text: description, shouldShowButton: false };
    }

    const truncatedWords = words.slice(0, maxWords);
    return {
      text: truncatedWords.join(" ") + "...",
      shouldShowButton: true,
    };
  };

  const handleShareLink = async () => {
    if (typeof window !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: event?.title || "Check out this event!",
          text: event?.description || "Join us for an amazing event!",
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled sharing or error occurred
        console.log("Share cancelled or failed:", err);
        // Fallback to copy link
        handleCopyLink();
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      handleCopyLink();
    }
  };

  const handleCopyLink = async () => {
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
        (currentUser && String(att.user) === String(currentUser.userId)) ||
        (att.email &&
          userEmailForQR &&
          att.email.toLowerCase() === userEmailForQR.toLowerCase())
    );
    if (!specificAttendee) {
      setCheckInQrError(
        "Your registration could not be found. Please refresh or contact support."
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

  const handleManualRegisterClick = () => {
    router.push("/eventSchedule/manual-register");
  };

  // Memoize expensive calculations before early returns
  const userIsRegisteredAndValidated = useMemo(() => {
    return event ? checkUserRegistration(currentUser, attendees) : false;
  }, [event, currentUser, attendees]);
  useEffect(() => {
    if (id) {
      router.prefetch(`/eventSchedule/registerEvent?eventId=${id}`);
    }
  }, [id, router]);

  // Handle banner_url as either array or string
  const finalBannerUrl = useMemo(() => {
    if (!event || !event.customization?.banner_url) {
      return "/images/placeholder.jpg";
    }

    const bannerUrl = event.customization.banner_url;

    // If it's an array, use the first valid HTTP/HTTPS URL
    if (Array.isArray(bannerUrl)) {
      const firstUrl = bannerUrl.find(
        (url: any) =>
          typeof url === "string" &&
          url.trim() !== "" &&
          (url.startsWith("http://") || url.startsWith("https://"))
      );
      return firstUrl || "/images/placeholder.jpg";
    }

    // If it's a string, use it directly
    if (typeof bannerUrl === "string" && bannerUrl.trim() !== "") {
      return bannerUrl;
    }

    return "/images/placeholder.jpg";
  }, [event]);

  // Show error state only if there's an actual error
  if (pageError) {
    return (
      <Center style={{ height: "100vh", padding: "20px" }}>
        <Paper shadow="xs" p="xl" withBorder>
          <Stack align="center">
            <AlertTriangle size={48} color="red" />
            <Title order={3} ta="center">
              {pageError}
            </Title>
            <Button
              onClick={() => router.push("/eventSchedule/exploreEvent")}
              leftSection={<ArrowLeft size={16} />}
            >
              Back to Events
            </Button>
          </Stack>
        </Paper>
      </Center>
    );
  }

  console.log("=== DEBUG: EventDetails Validation Check ===");
  console.log("Current User:", currentUser);
  console.log("Attendees:", attendees);
  console.log("User Is Registered:", userIsRegisteredAndValidated);
  console.log("=== END DEBUG ===");

  // Show loading state while event is being fetched
  if (!event && !pageError) {
    return (
      <Center style={{ height: "100vh", padding: "20px" }}>
        <Loader size="lg" />
      </Center>
    );
  }

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
            style={{ width: "100%" }}
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
              <div className={styles.heroLayout}>
                <div className={styles.heroLeft}>
                  <Badge className={styles.eventBadge} size="lg">
                    {event?.location || "Event Location"}
                  </Badge>
                  <Title className={styles.heroTitle}>{event?.title}</Title>
                  <Text className={styles.heroDescription}>
                    {truncateDescription(event?.description || "", 220)}
                  </Text>
                  <div className={styles.ticketSection}>
                    <Group className={styles.heroActions}>
                      <Button
                        className={styles.ticketButton}
                        size="lg"
                        component={Link}
                        href={`/eventSchedule/registerEvent?eventId=${
                          id ?? ""
                        }`}
                        prefetch={true}
                      >
                        Get Access Card - {formatPrice(event?.price)}
                      </Button>
                      <Menu shadow="md" width={200}>
                        <Menu.Target>
                          <ActionIcon
                            variant="outline"
                            size="lg"
                            className={styles.bookmarkButton}
                          >
                            <Bookmark size={18} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item
                            leftSection={<Share2 size={16} />}
                            onClick={handleShareLink}
                          >
                            Share Event
                          </Menu.Item>
                          <Menu.Item
                            leftSection={<QrCodeIcon size={16} />}
                            onClick={handleGenerateEventPageQR}
                          >
                            Event Page QR
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Group>
                  </div>
                </div>
                <div className={styles.heroRight}>
                  <div className={styles.imageCard}>
                    <Image
                      src={finalBannerUrl}
                      alt={event?.title || "Event Image"}
                      className={styles.eventImage}
                      width={506}
                      height={526}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </div>
      </div>
      <Container size="xl" className={styles.mainContent}>
        <div className={styles.pageLayout}>
          <div className={styles.mainColumn}>
            <Paper className={styles.contentCard}>
              {/* Event Details Grid */}
              <div className={styles.highlightedText}>INVITATION</div>
              <div className={styles.creatorName}>
                by {event?.creator?.username || "Unknown Host"}
              </div>
              <div className={styles.eventDetailsGrid}>
                <div className={styles.detailItem}>
                  <div className={styles.detailIcon}>
                    <Clock size={20} />
                  </div>
                  <div className={styles.detailContent}>
                    <Text className={styles.detailLabel}>Duration</Text>
                    <Text className={styles.detailValue}>
                      {event?.start_date && event?.end_date
                        ? (() => {
                            const durationMs =
                              new Date(event.end_date).getTime() -
                              new Date(event.start_date).getTime();
                            const hours = Math.abs(
                              Math.ceil(durationMs / (1000 * 60 * 60))
                            );
                            const minutes = Math.abs(
                              Math.ceil(
                                (durationMs % (1000 * 60 * 60)) / (1000 * 60)
                              )
                            );

                            if (minutes === 0) {
                              return `${hours}h`;
                            }
                            return `${hours}h ${minutes}mins`;
                          })()
                        : "TBD"}
                    </Text>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <div className={styles.detailIcon}>
                    <MapPin size={20} />
                  </div>
                  <div className={styles.detailContent}>
                    <Text className={styles.detailLabel}>Venue</Text>
                    <Text className={styles.detailValue}>
                      {event?.address || "TBD"}
                    </Text>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <div className={styles.detailIcon}>
                    <Info size={20} />
                  </div>
                  <div className={styles.detailContent}>
                    <Text className={styles.detailLabel}>Categories</Text>
                    <Text className={styles.detailValue}>
                      Event, Entertainment
                    </Text>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <div className={styles.detailIcon}>
                    <Calendar size={20} />
                  </div>
                  <div className={styles.detailContent}>
                    <Text className={styles.detailLabel}>Start date</Text>
                    <Text className={styles.detailValue}>
                      {event?.start_date
                        ? formatDateOnly(event.start_date)
                        : "TBD"}
                    </Text>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <div className={styles.detailIcon}>
                    <Calendar size={20} />
                  </div>
                  <div className={styles.detailContent}>
                    <Text className={styles.detailLabel}>End date</Text>
                    <Text className={styles.detailValue}>
                      {event?.end_date ? formatDateOnly(event.end_date) : "TBD"}
                    </Text>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <div className={styles.detailIcon}>
                    <Text style={{ fontWeight: "bold", fontSize: "20px" }}>
                      ₦
                    </Text>
                  </div>
                  <div className={styles.detailContent}>
                    <Text className={styles.detailLabel}>Cost</Text>
                    <Text className={styles.detailValue}>
                      {formatPrice(event?.price)}
                    </Text>
                  </div>
                </div>
              </div>

              {/* About Section */}
              <div className={styles.section}>
                <Title order={2} className={styles.sectionTitle}>
                  Description
                </Title>
                <div className={styles.aboutText}>
                  {(() => {
                    const description =
                      event?.description || "No description available.";
                    const { shouldShowButton } = truncateDescriptionByWords(
                      description,
                      65
                    );

                    if (!shouldShowButton || isDescriptionExpanded) {
                      return (
                        <>
                          <span>{description}</span>
                          {shouldShowButton && (
                            <Button
                              variant="subtle"
                              size="sm"
                              onClick={() => setIsDescriptionExpanded(false)}
                              style={{
                                marginLeft: "8px",
                                padding: "2px 6px",
                                backgroundColor: "transparent",
                                color: "#15302B",
                              }}
                            >
                              <ChevronUp size={24} />
                            </Button>
                          )}
                        </>
                      );
                    }

                    const { text } = truncateDescriptionByWords(
                      description,
                      65
                    );
                    return (
                      <>
                        <span>{text.replace("...", "")}</span>
                        <Button
                          variant="subtle"
                          size="sm"
                          onClick={() => setIsDescriptionExpanded(true)}
                          style={{
                            marginLeft: "4px",
                            padding: "2px 6px",
                            backgroundColor: "transparent",
                            color: "#15302B",
                          }}
                        >
                          ...
                          <ChevronDown size={24} />
                        </Button>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Countdown Section */}
              {countdownDate && (
                <div className={styles.section}>
                  <Title order={2} className={styles.sectionTitle}>
                    Event Starts In
                  </Title>
                  <div className={styles.countdownContainer}>
                    <CountdownTimer targetDate={countdownDate} />
                  </div>
                </div>
              )}

              {/* Direction Section */}
              <div className={styles.section}>
                <Title order={2} className={styles.sectionTitle}>
                  Direction
                </Title>

                {/* Debug info - remove this after testing */}
                {process.env.NODE_ENV === "development" && (
                  <div
                    style={{
                      marginBottom: "1rem",
                      padding: "0.5rem",
                      background: "#f0f0f0",
                      borderRadius: "4px",
                    }}
                  >
                    <Text size="xs">
                      Event Location: {event?.location || "Not set"}
                    </Text>
                    <Text size="xs">
                      Event Address: {event?.address || "Not set"}
                    </Text>
                  </div>
                )}

                <div className={styles.mapContainer}>
                  {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
                    // Check if the mapUrl is ready
                    mapUrl ? (
                      <iframe
                        src={mapUrl} // Use the state variable here
                        width="100%"
                        height="300"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Event Location Map"
                      />
                    ) : (
                      // Show a loading or prompt state
                      <div className={styles.mapPlaceholder}>
                        <Loader />
                        <Text mt="md">
                          Fetching your location for directions...
                        </Text>
                      </div>
                    )
                  ) : (
                    <div className={styles.mapPlaceholder}>
                      <MapPin size={48} />
                      <Text>Google Maps API key not configured</Text>
                      <Text size="sm" style={{ marginTop: "8px" }}>
                        Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local
                        file
                      </Text>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Us Section */}
              <div className={styles.section}>
                <Title order={2} className={styles.sectionTitle}>
                  Contact Us
                </Title>
                <div className={styles.socialIcons}>
                  <div className={styles.socialIcon}>
                    <Text style={{ fontSize: "24px" }}>𝕏</Text>
                  </div>
                  <div className={styles.socialIcon}>
                    <Text style={{ fontSize: "24px" }}>📷</Text>
                  </div>
                </div>
              </div>
            </Paper>
          </div>

          {/* Right Sidebar */}
          <div className={styles.sidebar}>
            <div className={styles.sidebarCard}>
              <Text className={styles.sidebarDateText}>
                {event?.start_date ? formatDateOnly(event.start_date) : "TBD"},{" "}
                {event?.start_date ? formatTime(event.start_date) : "TBD"} WAT
              </Text>
              <Text className={styles.sidebarPriceText}>
                {formatPrice(event?.price)}
              </Text>
              <Button
                className={styles.getTicketButton}
                component={Link}
                href={`/eventSchedule/registerEvent?eventId=${id ?? ""}`}
                prefetch={true}
                fullWidth
              >
                Get Access Card
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default function EventDetails() {
  return (
    <Suspense
      fallback={
        <Center style={{ height: "100vh" }}>
          <Loader size="xl" />
        </Center>
      }
    >
      <EventDetailsContent />
    </Suspense>
  );
}
