

// "use client"

// import { useEffect, useState, useRef } from "react"
// import { useParams } from "next/navigation"
// import { Container, Button, Text, Group, Stack, Image, Flex, Loader, Center, Paper, Title } from "@mantine/core"
// import styles from "./styles.module.css"
// import CustomFooter from "@/components/Footer"
// import Link from "next/link"
// import EventSection from "@/components/TrendingEvents"
// import { authenticatedRequest } from "@/app/services/auth"
// import { MapPin, Share2 } from 'lucide-react'

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

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://keupass-48c2ae65f897.herokuapp.com/api"

// export default function EventPage() {
//   const { id } = useParams<{ id: string }>()
//   const [event, setEvent] = useState<EventData | null>(null)
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)
//   const headerContentRef = useRef<HTMLDivElement>(null)
//   const [copied, setCopied] = useState(false)

//   useEffect(() => {
//     if (!id) return
//     setLoading(true)
//     authenticatedRequest<{ data: EventData }>(`${API_BASE_URL}/events/${id}/`, "GET")
//       .then((res) => setEvent(res.data))
//       .catch((err) => {
//         console.error(err)
//         setError(err.message || "Failed to load event")
//       })
//       .finally(() => setLoading(false))
//   }, [id])

//   // Apply the transparent background color using CSS variables
//   useEffect(() => {
//     if (event && headerContentRef.current) {
//       const customization = event.customizations?.[0]
//       const cardColor = customization?.card_color || "#ffffff"

//       // Convert hex to rgba with transparency
//       const hexToRgba = (hex: string, alpha = 0.8) => {
//         // Fix: Use base 16 for hex parsing
//         const r = Number.parseInt(hex.slice(1, 3), 16)
//         const g = Number.parseInt(hex.slice(3, 5), 16)
//         const b = Number.parseInt(hex.slice(5, 7), 16)
//         return `rgba(${r}, ${g}, ${b}, ${alpha})`
//       }

//       // Set the CSS variable
//       headerContentRef.current.style.setProperty("--card-bg-color", hexToRgba(cardColor))
//     }
//   }, [event])

//   // Format dates to show only the date part (not time)
//   const formatDateOnly = (dateString) => {
//     const date = new Date(dateString)
//     return date.toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     })
//   }

//   // const handleShareLink = () => {
//   //   navigator.clipboard.writeText(window.location.href)
//   //   setCopied(true)
//   //   setTimeout(() => setCopied(false), 2000)
//   // }

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

//   if (loading) {
//     return (
//       <div className={styles.loadingContainer}>
//         <Loader size="lg" className={styles.loader} />
//         <Text className={styles.loadingText}>Loading event details...</Text>
//       </div>
//     )
//   }

//   if (error || !event) {
//     return (
//       <Center style={{ height: "50vh" }}>
//         <Paper className={styles.errorCard}>
//           <Text color="red" size="lg">
//             {error || "Event not found."}
//           </Text>
//           <Link href="/events">
//             <Button className={styles.backButton}>Back to Events</Button>
//           </Link>
//         </Paper>
//       </Center>
//     )
//   }

//   // Use the first customization if it exists
//   const customization = event.customizations?.[0]
//   const banner = customization?.banner_url || event.banner_url
  
//   // Format dates after confirming event exists
//   const formattedStart = formatDateOnly(event.start_date)
//   const formattedEnd = formatDateOnly(event.end_date)

//   return (
//     <Stack spacing={0} className={styles.pageWrapper}>
//       <Container fluid className={styles.container}>
//         {/* Header Section with Banner Overlay */}
//         <div className={styles.header}>
//           <Image src={banner || "/placeholder.svg"} alt={event.title} className={styles.bannerImage} />
//           <div ref={headerContentRef} className={styles.headerContent}>
//             <Text className={styles.eventTitle}>{event.title}</Text>
//             <Flex className={styles.eventtime}>
//               <Text className={styles.eventdate}>{formattedStart}</Text>
//               <Text className={styles.eventdate}>{formattedEnd}</Text>
//             </Flex>
//             <Group className={styles.eventBTN}>
//               <Link href={`/eventSchedule/registerEvent?eventId=${id}`} style={{ textDecoration: "none" }}>
//                 <Button className={styles.registerButton}>Register</Button>
//               </Link>

//               <Button
//                   variant="outline"
//                   className={styles.shareButton}
//                   leftSection={<Share2 size={12} />}
//                   onClick={handleShareLink}
//                   // size="lg"
//                 >
//                   {copied ? "Link Copied!" : "Share Event"}
//                 </Button>
//             </Group>
//           </div>
//         </div>

//         {/* Event Details Section */}
//         <div className={styles.eventDetails}>
//           {event.location && (
//             <div className={styles.locationBadge}>
//               <MapPin size={16} />
//               <Text>{event.location}</Text>
//             </div>
//           )}
//         </div>

//         {/* Description Section */}
//         <Paper className={styles.descriptionSection}>
//           <Title order={2} className={styles.descriptionHeader}>
//             About This Event
//           </Title>
//           <div className={styles.divider}></div>
//           <Text className={styles.descriptionText}>{event.description}</Text>
//         </Paper>

//         {/* Other Events */}
//         <div className={styles.otherEventsSection}>
//           <Title order={2} className={styles.sectionTitle}>
//             You Might Also Like
//           </Title>
//           <div className={styles.divider}></div>
//           <div className={styles.otherEvents}>
//             <EventSection limit={3} />
//           </div>
//         </div>
//       </Container>
//       <div className={styles.footerWrapper}>
//         <CustomFooter />
//       </div>
//     </Stack>
//   )
// }


"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import { Container, Button, Text, Group, Stack, Image, Flex, Loader, Center, Paper, Title } from "@mantine/core"
import styles from "./styles.module.css"
import CustomFooter from "@/components/Footer"
import Link from "next/link"
import EventSection from "@/components/TrendingEvents"
import { authenticatedRequest } from "@/app/services/auth"
import { MapPin, Share2 } from 'lucide-react'

interface Customization {
  id: string
  banner_url: string
  font: string
  card_color: string
  event: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface EventData {
  id: string
  title: string
  description: string
  start_date: string
  end_date: string
  location: string
  customization?: Customization
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://keupass-48c2ae65f897.herokuapp.com/api"

export default function EventPage() {
  const { id } = useParams<{ id: string }>()
  const [event, setEvent] = useState<EventData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setErrorMessage] = useState<string | null>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!id) return
    setIsLoading(true)
    authenticatedRequest<{ data: EventData }>(`${API_BASE_URL}/events/${id}/`, "GET")
      .then((res) => setEvent(res.data))
      .catch((err) => {
        console.error("Fetch error:", err)
        setErrorMessage(err.message || "Failed to load event")
      })
      .finally(() => setIsLoading(false))
  }, [id])

  // Apply card background color
  useEffect(() => {
    if (event && headerRef.current) {
      const cardColor = event.customization?.card_color || "#e2350a"
      const hexToRgba = (hex: string, alpha = 0.8) => {
        const r = parseInt(hex.slice(1, 3), 16)
        const g = parseInt(hex.slice(3, 5), 16)
        const b = parseInt(hex.slice(5, 7), 16)
        return `rgba(${r}, ${g}, ${b}, ${alpha})`
      }
      headerRef.current.style.setProperty("--card-bg-color", hexToRgba(cardColor))
    }
  }, [event])

  // Format dates
  const formatDateOnly = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Share event link
  const handleShareLink = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.title || "Awesome Event",
          text: `Join me at "${event?.title}"!`,
          url,
        })
        return
      } catch (err) {
        console.warn("Share API error, falling back to copy:", err)
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Copy failed:", err)
    }
  }

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader size="lg" className={styles.loader} />
        <Text className={styles.loadingText}>Loading event details...</Text>
      </div>
    )
  }

  if (error || !event) {
    return (
      <Center style={{ height: "50vh" }}>
        <Paper className={styles.errorCard}>
          <Text color="red" size="lg">
            {error || "Event not found."}
          </Text>
          <Link href="/events">
            <Button className={styles.backButton}>Back to Events</Button>
          </Link>
        </Paper>
      </Center>
    )
  }

  const banner = event.customization?.banner_url || "/images/placeholder.jpg"
  const formattedStart = formatDateOnly(event.start_date)
  const formattedEnd = formatDateOnly(event.end_date)

  return (
    <Stack spacing={0} className={styles.pageWrapper}>
      <Container fluid className={styles.container}>
        {/* Header Section */}
        <div className={styles.header}>
          <Image src={banner} alt={event.title} className={styles.bannerImage} />
          <div ref={headerRef} className={styles.headerContent}>
            <Text className={styles.eventTitle}>{event.title}</Text>
            <Flex className={styles.eventtime}>
              <Text className={styles.eventdate}>{formattedStart}</Text>
              <Text className={styles.eventdate}>{formattedEnd}</Text>
            </Flex>
            <Group className={styles.eventBTN}>
              <Link href={`/eventSchedule/registerEvent?eventId=${id}`} style={{ textDecoration: "none" }}>
                <Button className={styles.registerButton}>Register</Button>
              </Link>
              <Button
                variant="outline"
                className={styles.shareButton}
                leftSection={<Share2 size={12} />}
                onClick={handleShareLink}
              >
                {copied ? "Link Copied!" : "Share Event"}
              </Button>
            </Group>
          </div>
        </div>

        {/* Event Details */}
        <div className={styles.eventDetails}>
          {event.location && (
            <div className={styles.locationBadge}>
              <MapPin size={16} />
              <Text>{event.location}</Text>
            </div>
          )}
        </div>

        {/* Description */}
        <Paper className={styles.descriptionSection}>
          <Title order={2} className={styles.descriptionHeader}>
            About This Event
          </Title>
          <div className={styles.divider}></div>
          <Text className={styles.descriptionText}>{event.description}</Text>
        </Paper>

        {/* Other Events */}
        <div className={styles.otherEventsSection}>
          <Title order={2} className={styles.sectionTitle}>
            You Might Also Like
          </Title>
          <div className={styles.divider}></div>
          <div className={styles.otherEvents}>
            <EventSection limit={3} />
          </div>
        </div>
      </Container>
      <div className={styles.footerWrapper}>
        <CustomFooter />
      </div>
    </Stack>
  )
}