"use client";

import { useState, useEffect, useRef } from "react";
import { Button, Flex, Group, Image, Text, Container } from "@mantine/core";
import Link from "next/link";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { authenticatedRequest } from "@/app/services/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://keupass-48c2ae65f897.herokuapp.com/api";

function HeroSection() {
  // State to toggle between words
  const [activeIndex, setActiveIndex] = useState(0);
  const [latestEvent, setLatestEvent] = useState<{
    id: string;
    title: string;
    start_date: string;
  } | null>(null);
  const words = ["Create", "Discover", "Manage", "Enjoy"];

  // Ref for the scroll indicator
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchLatestEvent = async () => {
      try {
        const response = await authenticatedRequest<any>(
          `${API_BASE_URL}/events/?is_active=true&ordering=-start_date&limit=1`,
          "GET"
        );

        let eventData;
        if (Array.isArray(response)) {
          eventData = response[0];
        } else if (response?.success && Array.isArray(response.data)) {
          eventData = response.data[0];
        } else if (response?.data && Array.isArray(response.data)) {
          eventData = response.data[0];
        }

        if (eventData) {
          setLatestEvent({
            id: eventData.id,
            title: eventData.title,
            start_date: eventData.start_date,
          });
        }
      } catch (err) {
        console.error("Failed to fetch latest event:", err);
      }
    };

    fetchLatestEvent();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % words.length);
    }, 2500); // toggles every 2.5 seconds

    return () => clearInterval(interval);
  }, []);

  // Scroll indicator animation
  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        scrollRef.current.style.opacity = window.scrollY > 100 ? "0" : "1";
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <HeroContainer>
      <BackgroundGradient />
      <ShapeDivider />

      <ContentContainer>
        <HeroContent>
          <LeftContent>
            <HeadingContainer>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <GradientWord>{words[activeIndex]}</GradientWord>
                </motion.div>
              </AnimatePresence>{" "}
              Your <br />
              <HighlightSpan>Events</HighlightSpan> With Ease
            </HeadingContainer>

            <SubtitleText>
              Welcome to your one stop to everything and anything event. Search
              for event and create your event on one application.
            </SubtitleText>

            <ButtonGroup>
              <Link href="/eventSchedule/exploreEvent">
                <PrimaryButton>Explore Events</PrimaryButton>
              </Link>
              <Link href="/eventSchedule/createEventForm">
                <SecondaryButton>Create Event</SecondaryButton>
              </Link>
            </ButtonGroup>

            <StatsContainer>
              <StatBox>
                <StatValue>200+</StatValue>
                <StatLabel>Events Hosted</StatLabel>
                <StatIndicator />
              </StatBox>

              <StatDivider />

              <StatBox>
                <StatValue>50+</StatValue>
                <StatLabel>Trusted Brands</StatLabel>
                <StatIndicator />
              </StatBox>
            </StatsContainer>
          </LeftContent>

          <RightContent>
            <ImageContainer>
              <MainImageWrapper>
                <Image
                  src="/images/chrisbrown.png"
                  alt="Event"
                  radius="md"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <ImageOverlay />
              </MainImageWrapper>

              <SecondaryImageWrapper>
                <SecondaryImage
                  src="/images/happyImage.png"
                  alt="Happy people"
                  radius="md"
                />
                <ImageOverlay $secondary />
              </SecondaryImageWrapper>

              <FloatingCard>
                <Link
                  href={
                    latestEvent
                      ? `/eventSchedule/eventDetails/${latestEvent.id}`
                      : "#"
                  }
                  style={{ textDecoration: "none" }}
                >
                  <FloatingCardContent>
                    <FloatingCardIcon>🎉</FloatingCardIcon>
                    <FloatingCardText>
                      {latestEvent ? (
                        <>
                          Next Event: {latestEvent.title}
                          <br />
                          <small>
                            {new Date(
                              latestEvent.start_date
                            ).toLocaleDateString()}
                          </small>
                        </>
                      ) : (
                        "Next Event: coming soon!!"
                      )}
                    </FloatingCardText>
                  </FloatingCardContent>
                </Link>
              </FloatingCard>
            </ImageContainer>
          </RightContent>
        </HeroContent>
      </ContentContainer>

      <ScrollIndicator ref={scrollRef}>
        <ScrollText>Scroll Down</ScrollText>
        <ScrollArrow>↓</ScrollArrow>
      </ScrollIndicator>
    </HeroContainer>
  );
}

export default HeroSection;

// Styled Components
const HeroContainer = styled.div`
  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow: hidden;
  padding: 80px 0;

  @media (max-width: 992px) {
    padding: 60px 0;
  }
`;

const BackgroundGradient = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(240, 255, 244, 0.9) 100%
  );
  z-index: -2;
`;

const ShapeDivider = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background-image: url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='pattern' width='40' height='40' viewBox='0 0 40 40' patternUnits='userSpaceOnUse' patternTransform='rotate(45)'%3E%3Crect width='100%25' height='100%25' fill='rgba(5, 99, 72, 0.03)'/%3E%3Ccircle cx='20' cy='20' r='1' fill='rgba(5, 99, 72, 0.05)'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23pattern)'/%3E%3C/svg%3E");
  opacity: 0.5;
  z-index: -1;
`;

const ContentContainer = styled(Container)`
  max-width: 1400px;
  height: 100%;
  margin: 0 auto;
  padding: 0 20px;
`;

const HeroContent = styled(Flex)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  gap: 40px;

  @media (max-width: 992px) {
    flex-direction: column;
    text-align: center;
  }
`;

const LeftContent = styled.div`
  flex: 1;
  max-width: 600px;

  @media (max-width: 992px) {
    max-width: 100%;
    order: 2;
  }
`;

const RightContent = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-end;
  position: relative;

  @media (max-width: 992px) {
    width: 100%;
    justify-content: center;
    order: 1;
    margin-bottom: 40px;
  }
`;

const HeadingContainer = styled.h1`
  font-size: 60px;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 24px;
  color: #14142b;

  @media (max-width: 1200px) {
    font-size: 48px;
  }

  @media (max-width: 768px) {
    font-size: 36px;
  }
`;

const GradientWord = styled.span`
  background: linear-gradient(90deg, #025a3a 0%, #7465ce 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
  display: inline-block;
`;

const HighlightSpan = styled.span`
  position: relative;
  color: #ebb734;
  display: inline-block;

  &::after {
    content: "";
    position: absolute;
    bottom: 8px;
    left: 0;
    width: 100%;
    height: 8px;
    background-color: rgba(255, 61, 0, 0.2);
    z-index: -1;
    border-radius: 4px;
  }
`;

const SubtitleText = styled(Text)`
  font-size: 18px;
  line-height: 1.6;
  color: #4e4b66;
  margin-bottom: 32px;
  max-width: 550px;

  @media (max-width: 992px) {
    margin-left: auto;
    margin-right: auto;
  }
`;

const ButtonGroup = styled(Group)`
  margin-bottom: 48px;

  @media (max-width: 992px) {
    justify-content: center;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }
`;

const PrimaryButton = styled(Button)`
  height: 3rem;
  background: linear-gradient(90deg, #025a3a 0%, #056348 100%);
  color: white;
  width: auto;
  min-width: 180px;
  padding: 0 36px;
  border-radius: 46px;
  border: none;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 10px 20px rgba(2, 90, 58, 0.15);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 25px rgba(2, 90, 58, 0.2);
    background: linear-gradient(90deg, #025a3a 0%, #037556 100%);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 5px 15px rgba(2, 90, 58, 0.15);
  }
`;

const SecondaryButton = styled(Button)`
  height: 3rem;
  background: transparent;
  color: #025a3a;
  width: auto;
  min-width: 180px;
  padding: 0 36px;
  border-radius: 46px;
  border: 2px solid #025a3a;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(2, 90, 58, 0.02);
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(2, 90, 58, 0.1);
    color: #025a3a;
  }

  &:active {
    transform: translateY(0);
    box-shadow: none;
  }
`;

const StatsContainer = styled(Flex)`
  display: flex;
  align-items: center;

  @media (max-width: 992px) {
    justify-content: center;
  }
`;

const StatBox = styled.div`
  position: relative;
  padding: 0 20px;
`;

const StatValue = styled.div`
  font-size: 48px;
  font-weight: 800;
  color: #7465ce;
  line-height: 1;
  margin-bottom: 8px;

  @media (max-width: 768px) {
    font-size: 36px;
  }
`;

const StatLabel = styled.div`
  font-size: 16px;
  color: #4e4b66;
  font-weight: 500;
`;

const StatIndicator = styled.div`
  position: absolute;
  bottom: -8px;
  left: 20px;
  width: 40px;
  height: 3px;
  background: linear-gradient(90deg, #7465ce 0%, #025a3a 100%);
  border-radius: 2px;
`;

const StatDivider = styled.div`
  width: 1px;
  height: 60px;
  background-color: rgba(78, 75, 102, 0.2);
  margin: 0 30px;
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 500px;

  @media (max-width: 1200px) {
    height: 450px;
  }

  @media (max-width: 992px) {
    height: 400px;
    width: 90%;
    max-width: 500px;
  }
`;

const MainImageWrapper = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 80%;
  height: 80%;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  transition: transform 0.5s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const MainImage = styled(Image)`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const SecondaryImageWrapper = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 50%;
  height: 60%;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  z-index: 2;
  transition: transform 0.5s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const SecondaryImage = styled(Image)`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

interface ImageOverlayProps {
  $secondary?: boolean;
}

const ImageOverlay = styled.div<ImageOverlayProps>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${(props) =>
    props.$secondary
      ? "linear-gradient(135deg, rgba(116, 101, 206, 0.2) 0%, rgba(2, 90, 58, 0.2) 100%)"
      : "linear-gradient(135deg, rgba(2, 90, 58, 0.2) 0%, rgba(116, 101, 206, 0.2) 100%)"};
  z-index: 1;
`;

const FloatingCard = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  z-index: 3;
  animation: float 3s ease-in-out infinite;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
  }

  @keyframes float {
    0% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
    100% {
      transform: translateY(0px);
    }
  }
`;

const FloatingCardContent = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.02);
  }
`;

const FloatingCardIcon = styled.div`
  font-size: 24px;
`;

const FloatingCardText = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #14142b;

  small {
    font-size: 12px;
    color: #4e4b66;
    font-weight: normal;
  }
`;

const ScrollIndicator = styled.div`
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 1;
  transition: opacity 0.3s ease;
`;

const ScrollText = styled.div`
  font-size: 14px;
  color: #4e4b66;
  margin-bottom: 8px;
`;

const ScrollArrow = styled.div`
  font-size: 20px;
  color: #025a3a;
  animation: bounce 2s infinite;

  @keyframes bounce {
    0%,
    20%,
    50%,
    80%,
    100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-10px);
    }
    60% {
      transform: translateY(-5px);
    }
  }
`;


// "use client"

// import { useState, useEffect, useRef } from "react"
// import { Button, Flex, Group, Image, Text, Container } from "@mantine/core"
// import Link from "next/link"
// import styled from "styled-components"
// import { motion, AnimatePresence } from "framer-motion"
// import { authenticatedRequest } from "@/app/services/auth"

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://keupass-48c2ae65f897.herokuapp.com/api"

// function HeroSection() {
//   // State to toggle between words
//   const [activeIndex, setActiveIndex] = useState(0)
//   const [latestEvent, setLatestEvent] = useState<{
//     id: string
//     title: string
//     start_date: string
//   } | null>(null)
//   const [videoLoaded, setVideoLoaded] = useState(false)
//   const words = ["Create", "Discover", "Manage", "Enjoy"]

//   // Ref for the scroll indicator and video
//   const scrollRef = useRef(null)
//   const videoRef = useRef<HTMLVideoElement>(null)

//   useEffect(() => {
//     const fetchLatestEvent = async () => {
//       try {
//         const response = await authenticatedRequest<any>(
//           `${API_BASE_URL}/events/?is_active=true&ordering=-start_date&limit=1`,
//           "GET",
//         )

//         let eventData
//         if (Array.isArray(response)) {
//           eventData = response[0]
//         } else if (response?.success && Array.isArray(response.data)) {
//           eventData = response.data[0]
//         } else if (response?.data && Array.isArray(response.data)) {
//           eventData = response.data[0]
//         }

//         if (eventData) {
//           setLatestEvent({
//             id: eventData.id,
//             title: eventData.title,
//             start_date: eventData.start_date,
//           })
//         }
//       } catch (err) {
//         console.error("Failed to fetch latest event:", err)
//       }
//     }

//     fetchLatestEvent()
//   }, [])

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setActiveIndex((prev) => (prev + 1) % words.length)
//     }, 2500) // toggles every 2.5 seconds

//     return () => clearInterval(interval)
//   }, [])

//   // Scroll indicator animation
//   useEffect(() => {
//     const handleScroll = () => {
//       if (scrollRef.current) {
//         scrollRef.current.style.opacity = window.scrollY > 100 ? "0" : "1"
//       }
//     }

//     window.addEventListener("scroll", handleScroll)
//     return () => window.removeEventListener("scroll", handleScroll)
//   }, [])

//   // Handle video load
//   useEffect(() => {
//     const video = videoRef.current
//     if (video) {
//       const handleLoadedData = () => {
//         setVideoLoaded(true)
//       }

//       video.addEventListener("loadeddata", handleLoadedData)

//       // Ensure video plays
//       const playVideo = async () => {
//         try {
//           await video.play()
//         } catch (error) {
//           console.log("Video autoplay failed:", error)
//         }
//       }

//       if (video.readyState >= 2) {
//         setVideoLoaded(true)
//         playVideo()
//       }

//       return () => {
//         video.removeEventListener("loadeddata", handleLoadedData)
//       }
//     }
//   }, [])

//   return (
//     <HeroContainer>
//       {/* Video Background */}
//       <VideoBackground
//         ref={videoRef}
//         autoPlay
//         muted
//         loop
//         playsInline
//         preload="metadata"
//         onLoadedData={() => setVideoLoaded(true)}
//       >
//         <source src="/videos/jeriq.mp4" type="video/mp4" />
//         Your browser does not support the video tag.
//       </VideoBackground>

//       {/* Video Overlay */}
//       <VideoOverlay $loaded={videoLoaded} />

//       {/* Fallback Background (shows while video loads) */}
//       <BackgroundGradient $videoLoaded={videoLoaded} />
//       <ShapeDivider />

//       <ContentContainer>
//         <HeroContent>
//           <LeftContent>
//             <HeadingContainer>
//               <AnimatePresence mode="wait">
//                 <motion.div
//                   key={activeIndex}
//                   initial={{ y: 20, opacity: 0 }}
//                   animate={{ y: 0, opacity: 1 }}
//                   exit={{ y: -20, opacity: 0 }}
//                   transition={{ duration: 0.5 }}
//                 >
//                   <GradientWord>{words[activeIndex]}</GradientWord>
//                 </motion.div>
//               </AnimatePresence>{" "}
//               Your <br />
//               <HighlightSpan>Events</HighlightSpan> With Ease
//             </HeadingContainer>

//             <SubtitleText>
//               Welcome to your one stop to everything and anything event. Search for event and create your event on one
//               application.
//             </SubtitleText>

//             <ButtonGroup>
//               <Link href="/eventSchedule/exploreEvent">
//                 <PrimaryButton>Explore Events</PrimaryButton>
//               </Link>
//               <Link href="/eventSchedule/createEventForm">
//                 <SecondaryButton>Create Event</SecondaryButton>
//               </Link>
//             </ButtonGroup>

//             <StatsContainer>
//               <StatBox>
//                 <StatValue>200+</StatValue>
//                 <StatLabel>Events Hosted</StatLabel>
//                 <StatIndicator />
//               </StatBox>

//               <StatDivider />

//               <StatBox>
//                 <StatValue>50+</StatValue>
//                 <StatLabel>Trusted Brands</StatLabel>
//                 <StatIndicator />
//               </StatBox>
//             </StatsContainer>
//           </LeftContent>

//           <RightContent>
//             <ImageContainer>
//               <MainImageWrapper>
//                 <Image
//                   src="/images/chrisbrown.png"
//                   alt="Event"
//                   radius="md"
//                   style={{ width: "100%", height: "100%", objectFit: "cover" }}
//                 />
//                 <ImageOverlay />
//               </MainImageWrapper>

//               <SecondaryImageWrapper>
//                 <SecondaryImage src="/images/happyImage.png" alt="Happy people" radius="md" />
//                 <ImageOverlay $secondary />
//               </SecondaryImageWrapper>

//               <FloatingCard>
//                 <Link
//                   href={latestEvent ? `/eventSchedule/eventDetails/${latestEvent.id}` : "#"}
//                   style={{ textDecoration: "none" }}
//                 >
//                   <FloatingCardContent>
//                     <FloatingCardIcon>🎉</FloatingCardIcon>
//                     <FloatingCardText>
//                       {latestEvent ? (
//                         <>
//                           Next Event: {latestEvent.title}
//                           <br />
//                           <small>{new Date(latestEvent.start_date).toLocaleDateString()}</small>
//                         </>
//                       ) : (
//                         "Next Event: coming soon!!"
//                       )}
//                     </FloatingCardText>
//                   </FloatingCardContent>
//                 </Link>
//               </FloatingCard>
//             </ImageContainer>
//           </RightContent>
//         </HeroContent>
//       </ContentContainer>

//       <ScrollIndicator ref={scrollRef}>
//         <ScrollText>Scroll Down</ScrollText>
//         <ScrollArrow>↓</ScrollArrow>
//       </ScrollIndicator>
//     </HeroContainer>
//   )
// }

// export default HeroSection

// // Styled Components
// const HeroContainer = styled.div`
//   position: relative;
//   min-height: 100vh;
//   width: 100%;
//   overflow: hidden;
//   padding: 80px 0;

//   @media (max-width: 992px) {
//     padding: 60px 0;
//   }
// `

// const VideoBackground = styled.video`
//   position: absolute;
//   top: 50%;
//   left: 50%;
//   min-width: 100%;
//   min-height: 100%;
//   width: auto;
//   height: auto;
//   transform: translate(-50%, -50%);
//   z-index: -3;
//   object-fit: cover;
  
//   @media (max-width: 768px) {
//     /* On mobile, ensure video covers properly */
//     width: 100%;
//     height: 100%;
//     object-position: center;
//   }
// `

// interface VideoOverlayProps {
//   $loaded: boolean
// }

// const VideoOverlay = styled.div<VideoOverlayProps>`
//   position: absolute;
//   top: 0;
//   left: 0;
//   right: 0;
//   bottom: 0;
//   background: linear-gradient(
//     135deg,
//     rgba(0, 0, 0, 0.4) 0%,
//     rgba(2, 90, 58, 0.3) 50%,
//     rgba(0, 0, 0, 0.4) 100%
//   );
//   z-index: -2;
//   opacity: ${(props) => (props.$loaded ? 1 : 0)};
//   transition: opacity 0.5s ease-in-out;
// `

// interface BackgroundGradientProps {
//   $videoLoaded: boolean
// }

// const BackgroundGradient = styled.div<BackgroundGradientProps>`
//   position: absolute;
//   top: 0;
//   left: 0;
//   right: 0;
//   bottom: 0;
//   background: linear-gradient(
//     135deg,
//     rgba(255, 255, 255, 0.9) 0%,
//     rgba(240, 255, 244, 0.9) 100%
//   );
//   z-index: -2;
//   opacity: ${(props) => (props.$videoLoaded ? 0 : 1)};
//   transition: opacity 0.5s ease-in-out;
// `

// const ShapeDivider = styled.div`
//   position: absolute;
//   top: 0;
//   left: 0;
//   right: 0;
//   height: 100%;
//   background-image: url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='pattern' width='40' height='40' viewBox='0 0 40 40' patternUnits='userSpaceOnUse' patternTransform='rotate(45)'%3E%3Crect width='100%25' height='100%25' fill='rgba(5, 99, 72, 0.03)'/%3E%3Ccircle cx='20' cy='20' r='1' fill='rgba(5, 99, 72, 0.05)'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23pattern)'/%3E%3C/svg%3E");
//   opacity: 0.3;
//   z-index: -1;
// `

// const ContentContainer = styled(Container)`
//   max-width: 1400px;
//   height: 100%;
//   margin: 0 auto;
//   padding: 0 20px;
//   position: relative;
//   z-index: 1;
// `

// const HeroContent = styled(Flex)`
//   display: flex;
//   align-items: center;
//   justify-content: space-between;
//   height: 100%;
//   gap: 40px;

//   @media (max-width: 992px) {
//     flex-direction: column;
//     text-align: center;
//   }
// `

// const LeftContent = styled.div`
//   flex: 1;
//   max-width: 600px;

//   @media (max-width: 992px) {
//     max-width: 100%;
//     order: 2;
//   }
// `

// const RightContent = styled.div`
//   flex: 1;
//   display: flex;
//   justify-content: flex-end;
//   position: relative;

//   @media (max-width: 992px) {
//     width: 100%;
//     justify-content: center;
//     order: 1;
//     margin-bottom: 40px;
//   }
// `

// const HeadingContainer = styled.h1`
//   font-size: 60px;
//   font-weight: 800;
//   line-height: 1.1;
//   margin-bottom: 24px;
//   color: #ffffff;
//   text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);

//   @media (max-width: 1200px) {
//     font-size: 48px;
//   }

//   @media (max-width: 768px) {
//     font-size: 36px;
//   }
// `

// const GradientWord = styled.span`
//   background: linear-gradient(90deg, #ebb734 0%, #ffffff 100%);
//   -webkit-background-clip: text;
//   -webkit-text-fill-color: transparent;
//   background-clip: text;
//   text-fill-color: transparent;
//   display: inline-block;
//   text-shadow: none;
// `

// const HighlightSpan = styled.span`
//   position: relative;
//   color: #ebb734;
//   display: inline-block;
//   text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);

//   &::after {
//     content: "";
//     position: absolute;
//     bottom: 8px;
//     left: 0;
//     width: 100%;
//     height: 8px;
//     background-color: rgba(235, 183, 52, 0.3);
//     z-index: -1;
//     border-radius: 4px;
//   }
// `

// const SubtitleText = styled(Text)`
//   font-size: 18px;
//   line-height: 1.6;
//   color: #ffffff;
//   margin-bottom: 32px;
//   max-width: 550px;
//   text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);

//   @media (max-width: 992px) {
//     margin-left: auto;
//     margin-right: auto;
//   }
// `

// const ButtonGroup = styled(Group)`
//   margin-bottom: 48px;

//   @media (max-width: 992px) {
//     justify-content: center;
//   }

//   @media (max-width: 480px) {
//     flex-direction: column;
//     align-items: center;
//     gap: 16px;
//   }
// `

// const PrimaryButton = styled(Button)`
//   height: 3rem;
//   background: linear-gradient(90deg, #025a3a 0%, #056348 100%);
//   color: white;
//   width: auto;
//   min-width: 180px;
//   padding: 0 36px;
//   border-radius: 46px;
//   border: none;
//   font-size: 16px;
//   font-weight: 600;
//   transition: all 0.3s ease;
//   box-shadow: 0 10px 20px rgba(2, 90, 58, 0.15);

//   &:hover {
//     transform: translateY(-3px);
//     box-shadow: 0 15px 25px rgba(2, 90, 58, 0.2);
//     background: linear-gradient(90deg, #025a3a 0%, #037556 100%);
//   }

//   &:active {
//     transform: translateY(0);
//     box-shadow: 0 5px 15px rgba(2, 90, 58, 0.15);
//   }
// `

// const SecondaryButton = styled(Button)`
//   height: 3rem;
//   background: rgba(255, 255, 255, 0.1);
//   color: #ffffff;
//   width: auto;
//   min-width: 180px;
//   padding: 0 36px;
//   border-radius: 46px;
//   border: 2px solid rgba(255, 255, 255, 0.3);
//   font-size: 16px;
//   font-weight: 600;
//   transition: all 0.3s ease;
//   backdrop-filter: blur(10px);

//   &:hover {
//     background-color: rgba(255, 255, 255, 0.2);
//     transform: translateY(-3px);
//     box-shadow: 0 10px 20px rgba(255, 255, 255, 0.1);
//     color: #ffffff;
//     border-color: rgba(255, 255, 255, 0.5);
//   }

//   &:active {
//     transform: translateY(0);
//     box-shadow: none;
//   }
// `

// const StatsContainer = styled(Flex)`
//   display: flex;
//   align-items: center;

//   @media (max-width: 992px) {
//     justify-content: center;
//   }
// `

// const StatBox = styled.div`
//   position: relative;
//   padding: 0 20px;
// `

// const StatValue = styled.div`
//   font-size: 48px;
//   font-weight: 800;
//   color: #ebb734;
//   line-height: 1;
//   margin-bottom: 8px;
//   text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);

//   @media (max-width: 768px) {
//     font-size: 36px;
//   }
// `

// const StatLabel = styled.div`
//   font-size: 16px;
//   color: #ffffff;
//   font-weight: 500;
//   text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
// `

// const StatIndicator = styled.div`
//   position: absolute;
//   bottom: -8px;
//   left: 20px;
//   width: 40px;
//   height: 3px;
//   background: linear-gradient(90deg, #ebb734 0%, #ffffff 100%);
//   border-radius: 2px;
// `

// const StatDivider = styled.div`
//   width: 1px;
//   height: 60px;
//   background-color: rgba(255, 255, 255, 0.3);
//   margin: 0 30px;
// `

// const ImageContainer = styled.div`
//   position: relative;
//   width: 100%;
//   height: 500px;

//   @media (max-width: 1200px) {
//     height: 450px;
//   }

//   @media (max-width: 992px) {
//     height: 400px;
//     width: 90%;
//     max-width: 500px;
//   }
// `

// const MainImageWrapper = styled.div`
//   position: absolute;
//   top: 0;
//   right: 0;
//   width: 80%;
//   height: 80%;
//   border-radius: 16px;
//   overflow: hidden;
//   box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
//   transition: transform 0.5s ease;

//   &:hover {
//     transform: translateY(-5px);
//   }
// `

// const SecondaryImageWrapper = styled.div`
//   position: absolute;
//   bottom: 0;
//   left: 0;
//   width: 50%;
//   height: 60%;
//   border-radius: 16px;
//   overflow: hidden;
//   box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
//   z-index: 2;
//   transition: transform 0.5s ease;

//   &:hover {
//     transform: translateY(-5px);
//   }
// `

// const SecondaryImage = styled(Image)`
//   width: 100%;
//   height: 100%;
//   object-fit: cover;
// `

// interface ImageOverlayProps {
//   $secondary?: boolean
// }

// const ImageOverlay = styled.div<ImageOverlayProps>`
//   position: absolute;
//   top: 0;
//   left: 0;
//   right: 0;
//   bottom: 0;
//   background: ${(props) =>
//     props.$secondary
//       ? "linear-gradient(135deg, rgba(235, 183, 52, 0.2) 0%, rgba(2, 90, 58, 0.2) 100%)"
//       : "linear-gradient(135deg, rgba(2, 90, 58, 0.2) 0%, rgba(235, 183, 52, 0.2) 100%)"};
//   z-index: 1;
// `

// const FloatingCard = styled.div`
//   position: absolute;
//   top: 20px;
//   left: 20px;
//   background: rgba(255, 255, 255, 0.95);
//   backdrop-filter: blur(10px);
//   border-radius: 12px;
//   padding: 16px;
//   box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
//   z-index: 3;
//   animation: float 3s ease-in-out infinite;
//   cursor: pointer;
//   transition: transform 0.3s ease, box-shadow 0.3s ease;

//   &:hover {
//     transform: translateY(-5px);
//     box-shadow: 0 15px 35px rgba(0, 0, 0, 0.25);
//   }

//   @keyframes float {
//     0% {
//       transform: translateY(0px);
//     }
//     50% {
//       transform: translateY(-10px);
//     }
//     100% {
//       transform: translateY(0px);
//     }
//   }
// `

// const FloatingCardContent = styled.div`
//   display: flex;
//   align-items: center;
//   gap: 12px;
//   transition: transform 0.2s ease;

//   &:hover {
//     transform: scale(1.02);
//   }
// `

// const FloatingCardIcon = styled.div`
//   font-size: 24px;
// `

// const FloatingCardText = styled.div`
//   font-size: 14px;
//   font-weight: 600;
//   color: #14142b;

//   small {
//     font-size: 12px;
//     color: #4e4b66;
//     font-weight: normal;
//   }
// `

// const ScrollIndicator = styled.div`
//   position: absolute;
//   bottom: 30px;
//   left: 50%;
//   transform: translateX(-50%);
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   opacity: 1;
//   transition: opacity 0.3s ease;
//   z-index: 1;
// `

// const ScrollText = styled.div`
//   font-size: 14px;
//   color: #ffffff;
//   margin-bottom: 8px;
//   text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
// `

// const ScrollArrow = styled.div`
//   font-size: 20px;
//   color: #ebb734;
//   animation: bounce 2s infinite;
//   text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);

//   @keyframes bounce {
//     0%,
//     20%,
//     50%,
//     80%,
//     100% {
//       transform: translateY(0);
//     }
//     40% {
//       transform: translateY(-10px);
//     }
//     60% {
//       transform: translateY(-5px);
//     }
//   }
// `

