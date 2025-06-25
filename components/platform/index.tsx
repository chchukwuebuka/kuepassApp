// "use client"

// import { useState, useEffect, useRef } from "react"
// import { Flex, Group, Text, Container } from "@mantine/core"
// import Link from "next/link"
// import styled, { keyframes } from "styled-components"
// import { motion, AnimatePresence } from "framer-motion"
// import { authenticatedRequest } from "@/app/services/auth"

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://keupass-48c2ae65f897.herokuapp.com/api"

// function PlatformShowcase() {
//   const [activeIndex, setActiveIndex] = useState(0)
//   const [latestEvent, setLatestEvent] = useState<{
//     id: string
//     title: string
//     start_date: string
//   } | null>(null)
//   const features = ["Seamless", "Powerful", "Intuitive", "Complete"]

//   const scrollRef = useRef(null)

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
//       setActiveIndex((prev) => (prev + 1) % features.length)
//     }, 2500)

//     return () => clearInterval(interval)
//   }, [])

//   useEffect(() => {
//     const handleScroll = () => {
//       if (scrollRef.current) {
//         scrollRef.current.style.opacity = window.scrollY > 100 ? "0" : "1"
//       }
//     }

//     window.addEventListener("scroll", handleScroll)
//     return () => window.removeEventListener("scroll", handleScroll)
//   }, [])

//   return (
//     <ShowcaseContainer>
//       <BackgroundGradient />
//       <ParticleBackground />
//       <ShapeDivider />
//       <FloatingElements />

//       <ContentContainer>
//         <ShowcaseContent>
//           <LeftContent>
//             <motion.div initial={{ opacity: 0, x: -100 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
//               <HeadingContainer>
//                 Experience Our <br />
//                 <AnimatePresence mode="wait">
//                   <motion.div
//                     key={activeIndex}
//                     initial={{ y: 30, opacity: 0, rotateX: -90 }}
//                     animate={{ y: 0, opacity: 1, rotateX: 0 }}
//                     exit={{ y: -30, opacity: 0, rotateX: 90 }}
//                     transition={{ duration: 0.6, ease: "easeInOut" }}
//                   >
//                     <GradientWord>{features[activeIndex]}</GradientWord>
//                   </motion.div>
//                 </AnimatePresence>{" "}
//                 <HighlightSpan>Platform</HighlightSpan>
//               </HeadingContainer>
//             </motion.div>

//             <motion.div
//               initial={{ opacity: 0, y: 50 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.8, delay: 0.2 }}
//             >
//               <SubtitleText>
//                 Discover how our innovative event management platform transforms the way you plan, organize, and
//                 experience events. Watch our platform in action and see why thousands trust us with their most important
//                 moments.
//               </SubtitleText>
//             </motion.div>

//             <motion.div
//               initial={{ opacity: 0, y: 50 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.8, delay: 0.4 }}
//             >
//               <ButtonGroup>
//                 <Link href="/eventSchedule/exploreEvent">
//                   <PrimaryButton whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
//                     <ButtonContent>
//                       <span>Explore Event</span>
//                       <ButtonIcon>→</ButtonIcon>
//                     </ButtonContent>
//                   </PrimaryButton>
//                 </Link>
//               </ButtonGroup>
//             </motion.div>

//             <motion.div
//               initial={{ opacity: 0, y: 50 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.8, delay: 0.6 }}
//             >
//               <StatsContainer>
//                 <StatBox whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
//                   <StatValue>99.9%</StatValue>
//                   <StatLabel>Uptime Reliability</StatLabel>
//                   <StatIndicator />
//                   <StatGlow />
//                 </StatBox>

//                 <StatDivider />

//                 <StatBox whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
//                   <StatValue>24/7</StatValue>
//                   <StatLabel>Support Available</StatLabel>
//                   <StatIndicator />
//                   <StatGlow />
//                 </StatBox>
//               </StatsContainer>
//             </motion.div>
//           </LeftContent>

//           <RightContent>
//             <motion.div
//               initial={{ opacity: 0, x: 100, scale: 0.8 }}
//               animate={{ opacity: 1, x: 0, scale: 1 }}
//               transition={{ duration: 1, delay: 0.3 }}
//               style={{ width: "100%" }}
//             >
//               <VideoContainer>
//                 <VideoGrid>
//                   <VideoBox
//                     initial={{ opacity: 0, scale: 0.8 }}
//                     animate={{ opacity: 1, scale: 1 }}
//                     transition={{ duration: 0.6, delay: 0.1 }}
//                   >
//                     <PlatformVideo src="/videos/jeriq.mp4" autoPlay loop muted playsInline controls={false} />
//                     <VideoOverlay />
//                   </VideoBox>

//                   <VideoBox
//                     initial={{ opacity: 0, scale: 0.8 }}
//                     animate={{ opacity: 1, scale: 1 }}
//                     transition={{ duration: 0.6, delay: 0.2 }}
//                   >
//                     <PlatformVideo
//                       src="/videos/jeriq.mp4"
//                       autoPlay
//                       loop
//                       muted
//                       playsInline
//                       controls={false}
//                       style={{ animationDelay: "1s" }}
//                     />
//                     <VideoOverlay />
//                   </VideoBox>

//                   <VideoBox
//                     initial={{ opacity: 0, scale: 0.8 }}
//                     animate={{ opacity: 1, scale: 1 }}
//                     transition={{ duration: 0.6, delay: 0.3 }}
//                   >
//                     <PlatformVideo
//                       src="/videos/jeriq.mp4"
//                       autoPlay
//                       loop
//                       muted
//                       playsInline
//                       controls={false}
//                       style={{ animationDelay: "2s" }}
//                     />
//                     <VideoOverlay />
//                   </VideoBox>

//                   <VideoBox
//                     initial={{ opacity: 0, scale: 0.8 }}
//                     animate={{ opacity: 1, scale: 1 }}
//                     transition={{ duration: 0.6, delay: 0.4 }}
//                   >
//                     <PlatformVideo
//                       src="/videos/jeriq.mp4"
//                       autoPlay
//                       loop
//                       muted
//                       playsInline
//                       controls={false}
//                       style={{ animationDelay: "3s" }}
//                     />
//                     <VideoOverlay />
//                   </VideoBox>
//                 </VideoGrid>
//               </VideoContainer>
//             </motion.div>
//           </RightContent>
//         </ShowcaseContent>
//       </ContentContainer>

//       <ScrollIndicator ref={scrollRef}>
//         <ScrollText>Learn More</ScrollText>
//         <ScrollArrow>↓</ScrollArrow>
//       </ScrollIndicator>
//     </ShowcaseContainer>
//   )
// }

// export default PlatformShowcase

// const float = keyframes`
//   0%, 100% { transform: translateY(0px) rotate(0deg); }
//   25% { transform: translateY(-10px) rotate(1deg); }
//   50% { transform: translateY(-5px) rotate(-1deg); }
//   75% { transform: translateY(-15px) rotate(0.5deg); }
// `

// const pulse = keyframes`
//   0%, 100% { opacity: 0.6; transform: scale(1); }
//   50% { opacity: 1; transform: scale(1.05); }
// `

// const shimmer = keyframes`
//   0% { background-position: -200% 0; }
//   100% { background-position: 200% 0; }
// `

// const particleFloat = keyframes`
//   0%, 100% { transform: translateY(0px) translateX(0px); }
//   25% { transform: translateY(-20px) translateX(10px); }
//   50% { transform: translateY(-10px) translateX(-5px); }
//   75% { transform: translateY(-30px) translateX(15px); }
// `

// const glow = keyframes`
//   0%, 100% { box-shadow: 0 0 20px rgba(116, 101, 206, 0.3); }
//   50% { box-shadow: 0 0 40px rgba(116, 101, 206, 0.6), 0 0 60px rgba(2, 90, 58, 0.3); }
// `

// const playPulse = keyframes`
//   0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
//   50% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
// `

// const videoHover = keyframes`
//   0%, 100% { transform: scale(1); }
//   50% { transform: scale(1.02); }
// `

// const ShowcaseContainer = styled.div`
//   position: relative;
//   min-height: 100vh;
//   width: 100%;
//   overflow: hidden;
//   padding: 80px 0;
//   background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);

//   @media (max-width: 992px) {
//     padding: 60px 0;
//   }
// `

// const BackgroundGradient = styled.div`
//   position: absolute;
//   top: 0;
//   left: 0;
//   right: 0;
//   bottom: 0;
//   background: linear-gradient(
//     135deg,
//     rgba(2, 90, 58, 0.1) 0%,
//     rgba(116, 101, 206, 0.1) 25%,
//     rgba(235, 183, 52, 0.05) 50%,
//     rgba(2, 90, 58, 0.1) 75%,
//     rgba(116, 101, 206, 0.1) 100%
//   );
//   animation: ${shimmer} 8s ease-in-out infinite;
//   background-size: 400% 400%;
//   z-index: -2;
// `

// const ParticleBackground = styled.div`
//   position: absolute;
//   top: 0;
//   left: 0;
//   right: 0;
//   bottom: 0;
//   z-index: -1;

//   &::before,
//   &::after {
//     content: '';
//     position: absolute;
//     width: 4px;
//     height: 4px;
//     background: rgba(116, 101, 206, 0.6);
//     border-radius: 50%;
//     animation: ${particleFloat} 6s ease-in-out infinite;
//   }

//   &::before {
//     top: 20%;
//     left: 10%;
//     animation-delay: -2s;
//   }

//   &::after {
//     top: 60%;
//     right: 15%;
//     animation-delay: -4s;
//     background: rgba(235, 183, 52, 0.6);
//   }
// `

// const FloatingElements = styled.div`
//   position: absolute;
//   top: 0;
//   left: 0px;
//   right: 0;
//   bottom: 0;
//   pointer-events: none;
//   z-index: 1;

//   &::before,
//   &::after {
//     content: '';
//     position: absolute;
//     border-radius: 50%;
//     background: linear-gradient(45deg, rgba(116, 101, 206, 0.1), rgba(2, 90, 58, 0.1));
//     animation: ${float} 8s ease-in-out infinite;
//   }

//   &::before {
//     width: 100px;
//     height: 100px;
//     top: 15%;
//     right: 20%;
//     animation-delay: -3s;
//   }

//   &::after {
//     width: 60px;
//     height: 60px;
//     bottom: 20%;
//     left: 10%;
//     animation-delay: -1s;
//   }
// `

// const ShapeDivider = styled.div`
//   position: absolute;
//   top: 0;
//   left: 0;
//   right: 0;
//   height: 100%;
//   background-image: url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='pattern' width='60' height='60' viewBox='0 0 60 60' patternUnits='userSpaceOnUse' patternTransform='rotate(45)'%3E%3Crect width='100%25' height='100%25' fill='rgba(0,0,0,0)'/%3E%3Ccircle cx='30' cy='30' r='1.5' fill='rgba(116, 101, 206, 0.1)'/%3E%3Ccircle cx='15' cy='45' r='1' fill='rgba(2, 90, 58, 0.1)'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23pattern)'/%3E%3C/svg%3E");
//   opacity: 0.3;
//   z-index: -1;
// `

// const ContentContainer = styled(Container)`
//   max-width: 1400px;
//   height: 100%;
//   margin: 0 auto;
//   padding: 0 20px;
//   position: relative;
//   z-index: 2;
// `

// const ShowcaseContent = styled(Flex)`
//   display: flex;
//   align-items: center;
//   justify-content: space-between;
//   height: 100%;
//   gap: 60px;

//   @media (max-width: 992px) {
//     flex-direction: column;
//     text-align: center;
//     gap: 40px;
//   }
// `

// const LeftContent = styled.div`
//   flex: 1;
//   max-width: 650px;

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
//   font-size: 72px;
//   font-weight: 900;
//   line-height: 1.1;
//   margin-bottom: 32px;
//   color: #ffffff;
//   text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
//   letter-spacing: -0.02em;

//   @media (max-width: 1200px) {
//     font-size: 56px;
//   }

//   @media (max-width: 768px) {
//     font-size: 42px;
//   }
// `

// const GradientWord = styled(motion.span)`
//   background: linear-gradient(135deg, #7465ce 0%, #ebb734 50%, #025a3a 100%);
//   -webkit-background-clip: text;
//   -webkit-text-fill-color: transparent;
//   background-clip: text;
//   text-fill-color: transparent;
//   display: inline-block;
//   background-size: 200% 200%;
//   animation: ${shimmer} 3s ease-in-out infinite;
//   filter: drop-shadow(0 4px 8px rgba(116, 101, 206, 0.3));
// `

// const HighlightSpan = styled.span`
//   position: relative;
//   color: #ebb734;
//   display: inline-block;
//   filter: drop-shadow(0 2px 8px rgba(235, 183, 52, 0.4));

//   &::after {
//     content: "";
//     position: absolute;
//     bottom: 8px;
//     left: 0;
//     width: 100%;
//     height: 12px;
//     background: linear-gradient(90deg, rgba(235, 183, 52, 0.3), rgba(235, 183, 52, 0.6));
//     z-index: -1;
//     border-radius: 6px;
//     animation: ${pulse} 2s ease-in-out infinite;
//   }
// `

// const SubtitleText = styled(Text)`
//   font-size: 20px;
//   line-height: 1.7;
//   color: rgba(255, 255, 255, 0.8);
//   margin-bottom: 40px;
//   max-width: 580px;
//   font-weight: 400;

//   @media (max-width: 992px) {
//     margin-left: auto;
//     margin-right: auto;
//   }
// `

// const ButtonGroup = styled(Group)`
//   margin-bottom: 60px;
//   gap: 20px;

//   @media (max-width: 992px) {
//     justify-content: center;
//   }

//   @media (max-width: 480px) {
//     flex-direction: column;
//     align-items: center;
//     gap: 16px;
//   }
// `

// const ButtonContent = styled.div`
//   display: flex;
//   align-items: center;
//   gap: 8px;
//   transition: gap 0.3s ease;
// `

// const ButtonIcon = styled.span`
//   font-size: 18px;
//   transition: transform 0.3s ease;
// `

// const PrimaryButton = styled(motion.button)`
//   height: 3.5rem;
//   background: linear-gradient(135deg, #7465ce 0%, #025a3a 100%);
//   color: white;
//   width: auto;
//   min-width: 200px;
//   padding: 0 40px;
//   border-radius: 50px;
//   border: none;
//   font-size: 16px;
//   font-weight: 600;
//   cursor: pointer;
//   position: relative;
//   overflow: hidden;
//   box-shadow: 0 15px 35px rgba(116, 101, 206, 0.3);

//   &::before {
//     content: '';
//     position: absolute;
//     top: 0;
//     left: -100%;
//     width: 100%;
//     height: 100%;
//     background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
//     transition: left 0.5s;
//   }

//   &:hover::before {
//     left: 100%;
//   }

//   &:hover ${ButtonIcon} {
//     transform: translateX(4px);
//   }

//   &:hover ${ButtonContent} {
//     gap: 12px;
//   }
// `

// const StatsContainer = styled(Flex)`
//   display: flex;
//   align-items: center;
//   gap: 40px;

//   @media (max-width: 992px) {
//     justify-content: center;
//   }
// `

// const StatBox = styled(motion.div)`
//   position: relative;
//   padding: 24px;
//   background: rgba(255, 255, 255, 0.05);
//   backdrop-filter: blur(10px);
//   border-radius: 20px;
//   border: 1px solid rgba(116, 101, 206, 0.2);
//   cursor: pointer;
// `

// const StatValue = styled.div`
//   font-size: 52px;
//   font-weight: 900;
//   background: linear-gradient(135deg, #7465ce 0%, #ebb734 100%);
//   -webkit-background-clip: text;
//   -webkit-text-fill-color: transparent;
//   background-clip: text;
//   text-fill-color: transparent;
//   line-height: 1;
//   margin-bottom: 8px;

//   @media (max-width: 768px) {
//     font-size: 40px;
//   }
// `

// const StatLabel = styled.div`
//   font-size: 16px;
//   color: rgba(255, 255, 255, 0.7);
//   font-weight: 500;
// `

// const StatIndicator = styled.div`
//   position: absolute;
//   bottom: 0;
//   left: 24px;
//   right: 24px;
//   height: 3px;
//   background: linear-gradient(90deg, #7465ce 0%, #025a3a 100%);
//   border-radius: 2px;
// `

// const StatGlow = styled.div`
//   position: absolute;
//   top: -2px;
//   left: -2px;
//   right: -2px;
//   bottom: -2px;
//   background: linear-gradient(135deg, rgba(116, 101, 206, 0.3), rgba(2, 90, 58, 0.3));
//   border-radius: 22px;
//   z-index: -1;
//   opacity: 0;
//   transition: opacity 0.3s ease;

//   ${StatBox}:hover & {
//     opacity: 1;
//     animation: ${glow} 2s ease-in-out infinite;
//   }
// `

// const StatDivider = styled.div`
//   width: 2px;
//   height: 80px;
//   background: linear-gradient(180deg, transparent, rgba(116, 101, 206, 0.5), transparent);
// `

// const VideoContainer = styled.div`
//   position: relative;
//   width: 100%;
//   height: 490px;

//   @media (max-width: 1200px) {
//     height: 500px;
//   }

//   @media (max-width: 992px) {
//     height: 450px;
//   }

//   @media (max-width: 768px) {
//     height: 400px;
//   }
// `

// const VideoGrid = styled.div`
//   display: grid;
//   grid-template-columns: 1fr 1fr;
//   grid-template-rows: 1fr 1fr;
//   gap: 12px;
//   width: 100%;
//   height: 100%;
//   border-radius: 24px;
//   overflow: hidden;
//   box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4);
//   transition: transform 0.5s ease;

//   &:hover {
//     transform: translateY(-8px) scale(1.02);
//   }

//   &::before {
//     content: '';
//     position: absolute;
//     top: -4px;
//     left: -4px;
//     right: -4px;
//     bottom: -4px;
//     background: linear-gradient(135deg, rgba(116, 101, 206, 0.2), rgba(2, 90, 58, 0.2));
//     border-radius: 28px;
//     z-index: -1;
//     animation: ${glow} 3s ease-in-out infinite;
//   }
// `

// const VideoBox = styled(motion.div)`
//   position: relative;
//   overflow: hidden;
//   border-radius: 12px;
//   transition: all 0.3s ease;

//   &:hover {
//     animation: ${videoHover} 0.6s ease-in-out;
//   }

//   &:nth-child(1) {
//     border-top-left-radius: 24px;
//   }

//   &:nth-child(2) {
//     border-top-right-radius: 24px;
//   }

//   &:nth-child(3) {
//     border-bottom-left-radius: 24px;
//   }

//   &:nth-child(4) {
//     border-bottom-right-radius: 24px;
//   }
// `

// const PlatformVideo = styled.video`
//   width: 100%;
//   height: 100%;
//   object-fit: cover;
//   display: block;
//   background: #000;
//   transition: transform 0.3s ease;

//   ${VideoBox}:hover & {
//     transform: scale(1.05);
//   }
// `

// const VideoOverlay = styled.div`
//   position: absolute;
//   top: 0;
//   left: 0;
//   right: 0;
//   bottom: 0;
//   background: linear-gradient(
//     135deg,
//     rgba(116, 101, 206, 0.1) 0%,
//     rgba(2, 90, 58, 0.1) 50%,
//     rgba(235, 183, 52, 0.05) 100%
//   );
//   pointer-events: none;
//   transition: opacity 0.3s ease;

//   ${VideoBox}:hover & {
//     opacity: 0.5;
//   }
// `

// const CentralPlayButton = styled.div`
//   position: absolute;
//   top: 50%;
//   left: 50%;
//   transform: translate(-50%, -50%);
//   width: 80px;
//   height: 80px;
//   background: rgba(255, 255, 255, 0.95);
//   border-radius: 50%;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   cursor: pointer;
//   transition: all 0.3s ease;
//   animation: ${playPulse} 2s ease-in-out infinite;
//   z-index: 10;
//   box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);

//   &:hover {
//     background: rgba(255, 255, 255, 1);
//     transform: translate(-50%, -50%) scale(1.1);
//     box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
//   }
// `

// const PlayIcon = styled.div`
//   font-size: 28px;
//   color: #025a3a;
//   margin-left: 4px;
// `

// const ScrollIndicator = styled.div`
//   position: absolute;
//   bottom: 40px;
//   left: 50%;
//   transform: translateX(-50%);
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   opacity: 1;
//   transition: opacity 0.3s ease;
//   z-index: 3;
// `

// const ScrollText = styled.div`
//   font-size: 14px;
//   color: rgba(255, 255, 255, 0.6);
//   margin-bottom: 12px;
//   font-weight: 500;
// `

// const ScrollArrow = styled.div`
//   font-size: 24px;
//   color: #7465ce;
//   animation: bounce 2s infinite;
//   filter: drop-shadow(0 2px 4px rgba(116, 101, 206, 0.3));

//   @keyframes bounce {
//     0%,
//     20%,
//     50%,
//     80%,
//     100% {
//       transform: translateY(0);
//     }
//     40% {
//       transform: translateY(-12px);
//     }
//     60% {
//       transform: translateY(-6px);
//     }
//   }
// `



 

"use client"

import { useState, useEffect, useRef } from "react"
import { Flex, Group, Text, Container } from "@mantine/core"
import Link from "next/link"
import styled, { keyframes } from "styled-components"
import { motion, AnimatePresence } from "framer-motion"
import { authenticatedRequest } from "@/app/services/auth"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://keupass-48c2ae65f897.herokuapp.com/api"

function PlatformShowcase() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [hoveredVideo, setHoveredVideo] = useState<number | null>(null)
  const [latestEvent, setLatestEvent] = useState<{
    id: string
    title: string
    start_date: string
  } | null>(null)
  const features = ["Seamless", "Powerful", "Intuitive", "Complete"]
  const emotions = ["😊", "🎉", "✨", "🚀"]
  const videoTitles = ["Create Events", "Manage Guests", "Live Streaming", "Analytics"]

  // Different video sources for each orb
  const videoSources = [
    "/videos/jeriq.mp4", // Create Events
    "/videos/walk.mp4", // Manage Guests
    "/videos/me.mp4", // Live Streaming
    "/videos/txe.mp4", // Analytics
  ]

  const scrollRef = useRef(null)

  useEffect(() => {
    const fetchLatestEvent = async () => {
      try {
        const response = await authenticatedRequest<any>(
          `${API_BASE_URL}/events/?is_active=true&ordering=-start_date&limit=1`,
          "GET",
        )

        let eventData
        if (Array.isArray(response)) {
          eventData = response[0]
        } else if (response?.success && Array.isArray(response.data)) {
          eventData = response.data[0]
        } else if (response?.data && Array.isArray(response.data)) {
          eventData = response.data[0]
        }

        if (eventData) {
          setLatestEvent({
            id: eventData.id,
            title: eventData.title,
            start_date: eventData.start_date,
          })
        }
      } catch (err) {
        console.error("Failed to fetch latest event:", err)
      }
    }

    fetchLatestEvent()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % features.length)
    }, 2500)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        scrollRef.current.style.opacity = window.scrollY > 100 ? "0" : "1"
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <ShowcaseContainer>
      <BackgroundGradient />
      <ParticleBackground />
      <ShapeDivider />
      <FloatingElements />

      <ContentContainer>
        <ShowcaseContent>
          <LeftContent>
            <motion.div initial={{ opacity: 0, x: -100 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <HeadingContainer>
                Experience Our <br />
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeIndex}
                    initial={{ y: 30, opacity: 0, rotateX: -90 }}
                    animate={{ y: 0, opacity: 1, rotateX: 0 }}
                    exit={{ y: -30, opacity: 0, rotateX: 90 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  >
                    <GradientWord>{features[activeIndex]}</GradientWord>
                  </motion.div>
                </AnimatePresence>{" "}
                <HighlightSpan>Platform</HighlightSpan>
              </HeadingContainer>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <SubtitleText>
                Discover how our innovative event management platform transforms the way you plan, organize, and
                experience events. Watch our platform in action and see why thousands trust us with their most important
                moments.
              </SubtitleText>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <ButtonGroup>
                <Link href="/eventSchedule/exploreEvent">
                  <PrimaryButton whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                    <ButtonContent>
                      <span>Explore Events</span>
                      <ButtonIcon>→</ButtonIcon>
                    </ButtonContent>
                  </PrimaryButton>
                </Link>
              </ButtonGroup>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <StatsContainer>
                <StatBox whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
                  <StatValue>99.9%</StatValue>
                  <StatLabel>Uptime Reliability</StatLabel>
                  <StatIndicator />
                  <StatGlow />
                </StatBox>

                <StatDivider />

                <StatBox whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
                  <StatValue>24/7</StatValue>
                  <StatLabel>Support Available</StatLabel>
                  <StatIndicator />
                  <StatGlow />
                </StatBox>
              </StatsContainer>
            </motion.div>
          </LeftContent>

          <RightContent>
            <motion.div
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              style={{ width: "100%" }}
            >
              <VideoContainer>
                <VideoOrbitContainer>
                  {[0, 1, 2, 3].map((index) => (
                    <VideoOrb
                      key={index}
                      initial={{
                        opacity: 0,
                        scale: 0,
                        rotate: index * 90,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        rotate: index * 90,
                      }}
                      transition={{
                        duration: 0.8,
                        delay: 0.1 + index * 0.2,
                        type: "spring",
                        stiffness: 100,
                      }}
                      $index={index}
                      $isHovered={hoveredVideo === index}
                      onMouseEnter={() => setHoveredVideo(index)}
                      onMouseLeave={() => setHoveredVideo(null)}
                    >
                      <OrbGlow $index={index} />
                      <OrbRing $index={index} />

                      <VideoCircle $index={index}>
                        <PlatformVideo
                          src={videoSources[index]}
                          autoPlay
                          loop
                          muted
                          playsInline
                          controls={false}
                          style={{ animationDelay: `${index * 0.5}s` }}
                          onError={(e) => {
                            // Fallback to placeholder if video fails to load
                            console.warn(`Video ${videoSources[index]} failed to load, using fallback`)
                            e.currentTarget.src = "/videos/jeriq.mp4"
                          }}
                        />
                        <VideoOverlay $index={index} />

                        <EmotionIndicator $index={index}>
                          <motion.div
                            animate={{
                              scale: hoveredVideo === index ? [1, 1.3, 1] : 1,
                              rotate: hoveredVideo === index ? [0, 10, -10, 0] : 0,
                            }}
                            transition={{
                              duration: 0.6,
                              repeat: hoveredVideo === index ? Number.POSITIVE_INFINITY : 0,
                              repeatType: "reverse",
                            }}
                          >
                            {emotions[index]}
                          </motion.div>
                        </EmotionIndicator>

                        <VideoLabel $index={index} $isHovered={hoveredVideo === index}>
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{
                              opacity: hoveredVideo === index ? 1 : 0,
                              y: hoveredVideo === index ? 0 : 10,
                            }}
                            transition={{ duration: 0.3 }}
                          >
                            {videoTitles[index]}
                          </motion.div>
                        </VideoLabel>
                      </VideoCircle>

                      <OrbPulse $index={index} />
                    </VideoOrb>
                  ))}
                </VideoOrbitContainer>

                {/* Central Hub */}
                <CentralHub>
                  <HubGlow />
                  <HubContent>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    >
                    <HubIcon>🎯</HubIcon>
                    </motion.div>
                    <HubText>Event Hub</HubText>
                  </HubContent>
                </CentralHub>

                {/* Connecting Lines */}
                {[0, 1, 2, 3].map((index) => (
                  <ConnectionLine key={`line-${index}`} $index={index} $isActive={hoveredVideo === index} />
                ))}
              </VideoContainer>
            </motion.div>
          </RightContent>
        </ShowcaseContent>
      </ContentContainer>

      <ScrollIndicator ref={scrollRef}>
        <ScrollText>Learn More</ScrollText>
        <ScrollArrow>↓</ScrollArrow>
      </ScrollIndicator>
    </ShowcaseContainer>
  )
}

export default PlatformShowcase

// Keyframes
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
`

const pulse = keyframes`
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
`

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`

const particleFloat = keyframes`
  0%, 100% { transform: translateY(0px) translateX(0px); }
  25% { transform: translateY(-20px) translateX(10px); }
  50% { transform: translateY(-10px) translateX(-5px); }
  75% { transform: translateY(-30px) translateX(15px); }
`

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(116, 101, 206, 0.3); }
  50% { box-shadow: 0 0 40px rgba(116, 101, 206, 0.6), 0 0 60px rgba(2, 90, 58, 0.3); }
`

const orbFloat = keyframes`
  0%, 100% { 
    transform: translateY(0px) scale(1);
  }
  50% { 
    transform: translateY(-20px) scale(1.05);
  }
`

const orbPulse = keyframes`
  0%, 100% { 
    transform: scale(1);
    opacity: 0.7;
  }
  50% { 
    transform: scale(1.2);
    opacity: 1;
  }
`

const ringRotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`

const heartbeat = keyframes`
  0%, 100% { transform: scale(1); }
  25% { transform: scale(1.1); }
  50% { transform: scale(1.05); }
  75% { transform: scale(1.15); }
`

const connectionPulse = keyframes`
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.8; }
`

// Styled Components
const ShowcaseContainer = styled.div`
  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow: hidden;
  padding: 80px 0;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);

  @media (max-width: 992px) {
    padding: 60px 0;
  }
`

const BackgroundGradient = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(2, 90, 58, 0.1) 0%,
    rgba(116, 101, 206, 0.1) 25%,
    rgba(235, 183, 52, 0.05) 50%,
    rgba(2, 90, 58, 0.1) 75%,
    rgba(116, 101, 206, 0.1) 100%
  );
  animation: ${shimmer} 8s ease-in-out infinite;
  background-size: 400% 400%;
  z-index: -2;
`

const ParticleBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;

  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 4px;
    height: 4px;
    background: rgba(116, 101, 206, 0.6);
    border-radius: 50%;
    animation: ${particleFloat} 6s ease-in-out infinite;
  }

  &::before {
    top: 20%;
    left: 10%;
    animation-delay: -2s;
  }

  &::after {
    top: 60%;
    right: 15%;
    animation-delay: -4s;
    background: rgba(235, 183, 52, 0.6);
  }
`

const FloatingElements = styled.div`
  position: absolute;
  top: 0;
  left: 0px;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;

  &::before,
  &::after {
    content: '';
    position: absolute;
    border-radius: 50%;
    background: linear-gradient(45deg, rgba(116, 101, 206, 0.1), rgba(2, 90, 58, 0.1));
    animation: ${float} 8s ease-in-out infinite;
  }

  &::before {
    width: 100px;
    height: 100px;
    top: 15%;
    right: 20%;
    animation-delay: -3s;
  }

  &::after {
    width: 60px;
    height: 60px;
    bottom: 20%;
    left: 10%;
    animation-delay: -1s;
  }
`

const ShapeDivider = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background-image: url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='pattern' width='60' height='60' viewBox='0 0 60 60' patternUnits='userSpaceOnUse' patternTransform='rotate(45)'%3E%3Crect width='100%25' height='100%25' fill='rgba(0,0,0,0)'/%3E%3Ccircle cx='30' cy='30' r='1.5' fill='rgba(116, 101, 206, 0.1)'/%3E%3Ccircle cx='15' cy='45' r='1' fill='rgba(2, 90, 58, 0.1)'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23pattern)'/%3E%3C/svg%3E");
  opacity: 0.3;
  z-index: -1;
`

const ContentContainer = styled(Container)`
  max-width: 1400px;
  height: 100%;
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
  z-index: 2;
`

const ShowcaseContent = styled(Flex)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  gap: 60px;

  @media (max-width: 992px) {
    flex-direction: column;
    text-align: center;
    gap: 40px;
  }
`

const LeftContent = styled.div`
  flex: 1;
  max-width: 650px;

  @media (max-width: 992px) {
    max-width: 100%;
    order: 2;
  }
`

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
`

const HeadingContainer = styled.h1`
  font-size: 72px;
  font-weight: 900;
  line-height: 1.1;
  margin-bottom: 32px;
  color: #ffffff;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  letter-spacing: -0.02em;

  @media (max-width: 1200px) {
    font-size: 56px;
  }

  @media (max-width: 768px) {
    font-size: 42px;
  }
`

const GradientWord = styled(motion.span)`
  background: linear-gradient(135deg, #7465ce 0%, #ebb734 50%, #025a3a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
  display: inline-block;
  background-size: 200% 200%;
  animation: ${shimmer} 3s ease-in-out infinite;
  filter: drop-shadow(0 4px 8px rgba(116, 101, 206, 0.3));
`

const HighlightSpan = styled.span`
  position: relative;
  color: #ebb734;
  display: inline-block;
  filter: drop-shadow(0 2px 8px rgba(235, 183, 52, 0.4));

  &::after {
    content: "";
    position: absolute;
    bottom: 8px;
    left: 0;
    width: 100%;
    height: 12px;
    background: linear-gradient(90deg, rgba(235, 183, 52, 0.3), rgba(235, 183, 52, 0.6));
    z-index: -1;
    border-radius: 6px;
    animation: ${pulse} 2s ease-in-out infinite;
  }
`

const SubtitleText = styled(Text)`
  font-size: 20px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 40px;
  max-width: 580px;
  font-weight: 400;

  @media (max-width: 992px) {
    margin-left: auto;
    margin-right: auto;
  }
`

const ButtonGroup = styled(Group)`
  margin-bottom: 60px;
  gap: 20px;

  @media (max-width: 992px) {
    justify-content: center;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }
`

const ButtonContent = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  transition: gap 0.3s ease;
`

const ButtonIcon = styled.span`
  font-size: 18px;
  transition: transform 0.3s ease;
`

const PrimaryButton = styled(motion.button)`
  height: 3.5rem;
  background: linear-gradient(135deg, #7465ce 0%, #025a3a 100%);
  color: white;
  width: auto;
  min-width: 200px;
  padding: 0 40px;
  border-radius: 50px;
  border: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  box-shadow: 0 15px 35px rgba(116, 101, 206, 0.3);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  &:hover::before {
    left: 100%;
  }

  &:hover ${ButtonIcon} {
    transform: translateX(4px);
  }

  &:hover ${ButtonContent} {
    gap: 12px;
  }
`

const StatsContainer = styled(Flex)`
  display: flex;
  align-items: center;
  gap: 40px;

  @media (max-width: 992px) {
    justify-content: center;
  }
`

const StatBox = styled(motion.div)`
  position: relative;
  padding: 24px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(116, 101, 206, 0.2);
  cursor: pointer;
`

const StatValue = styled.div`
  font-size: 52px;
  font-weight: 900;
  background: linear-gradient(135deg, #7465ce 0%, #ebb734 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
  line-height: 1;
  margin-bottom: 8px;

  @media (max-width: 768px) {
    font-size: 40px;
  }
`

const StatLabel = styled.div`
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
`

const StatIndicator = styled.div`
  position: absolute;
  bottom: 0;
  left: 24px;
  right: 24px;
  height: 3px;
  background: linear-gradient(90deg, #7465ce 0%, #025a3a 100%);
  border-radius: 2px;
`

const StatGlow = styled.div`
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(135deg, rgba(116, 101, 206, 0.3), rgba(2, 90, 58, 0.3));
  border-radius: 22px;
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s ease;

  ${StatBox}:hover & {
    opacity: 1;
    animation: ${glow} 2s ease-in-out infinite;
  }
`

const StatDivider = styled.div`
  width: 2px;
  height: 80px;
  background: linear-gradient(180deg, transparent, rgba(116, 101, 206, 0.5), transparent);
`

const VideoContainer = styled.div`
  position: relative;
  width: 600px;
  height: 600px;

  @media (max-width: 1200px) {
    width: 500px;
    height: 500px;
  }

  @media (max-width: 992px) {
    width: 450px;
    height: 450px;
  }

  @media (max-width: 768px) {
    width: 350px;
    height: 350px;
  }
`

const VideoOrbitContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`

interface VideoOrbProps {
  $index: number
  $isHovered: boolean
}

const VideoOrb = styled(motion.div)<VideoOrbProps>`
  position: absolute;
  width: 180px;
  height: 180px;
  cursor: pointer;
  animation: ${orbFloat} ${(props) => 4 + props.$index * 0.5}s ease-in-out infinite;
  animation-delay: ${(props) => props.$index * 0.5}s;
  
  ${(props) => {
    const positions = [
      { top: "10%", right: "10%" }, // Top right
      { bottom: "10%", right: "10%" }, // Bottom right
      { bottom: "10%", left: "10%" }, // Bottom left
      { top: "10%", left: "10%" }, // Top left
    ]
    return `
      ${positions[props.$index].top ? `top: ${positions[props.$index].top};` : ""}
      ${positions[props.$index].bottom ? `bottom: ${positions[props.$index].bottom};` : ""}
      ${positions[props.$index].left ? `left: ${positions[props.$index].left};` : ""}
      ${positions[props.$index].right ? `right: ${positions[props.$index].right};` : ""}
    `
  }}

  transform: ${(props) => (props.$isHovered ? "scale(1.1)" : "scale(1)")};
  transition: transform 0.3s ease;

  @media (max-width: 768px) {
    width: 120px;
    height: 120px;
  }
`

const OrbGlow = styled.div<{ $index: number }>`
  position: absolute;
  top: -20px;
  left: -20px;
  right: -20px;
  bottom: -20px;
  border-radius: 50%;
  background: ${(props) => {
    const colors = [
      "radial-gradient(circle, rgba(116, 101, 206, 0.3) 0%, transparent 70%)",
      "radial-gradient(circle, rgba(235, 183, 52, 0.3) 0%, transparent 70%)",
      "radial-gradient(circle, rgba(2, 90, 58, 0.3) 0%, transparent 70%)",
      "radial-gradient(circle, rgba(255, 107, 107, 0.3) 0%, transparent 70%)",
    ]
    return colors[props.$index]
  }};
  animation: ${pulse} 3s ease-in-out infinite;
  animation-delay: ${(props) => props.$index * 0.5}s;
`

const OrbRing = styled.div<{ $index: number }>`
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  border-radius: 50%;
  border: 2px solid ${(props) => {
    const colors = ["#7465ce", "#ebb734", "#025a3a", "#ff6b6b"]
    return colors[props.$index]
  }};
  opacity: 0.6;
  animation: ${ringRotate} 10s linear infinite;
`

const VideoCircle = styled.div<{ $index: number }>`
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  border: 3px solid ${(props) => {
    const colors = ["#7465ce", "#ebb734", "#025a3a", "#ff6b6b"]
    return colors[props.$index]
  }};
  animation: ${heartbeat} 2s ease-in-out infinite;
  animation-delay: ${(props) => props.$index * 0.3}s;
`

const PlatformVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  background: #000;
`

const VideoOverlay = styled.div<{ $index: number }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${(props) => {
    const overlays = [
      "linear-gradient(135deg, rgba(116, 101, 206, 0.2) 0%, rgba(116, 101, 206, 0.1) 100%)",
      "linear-gradient(135deg, rgba(235, 183, 52, 0.2) 0%, rgba(235, 183, 52, 0.1) 100%)",
      "linear-gradient(135deg, rgba(2, 90, 58, 0.2) 0%, rgba(2, 90, 58, 0.1) 100%)",
      "linear-gradient(135deg, rgba(255, 107, 107, 0.2) 0%, rgba(255, 107, 107, 0.1) 100%)",
    ]
    return overlays[props.$index]
  }};
  pointer-events: none;
`

const EmotionIndicator = styled.div<{ $index: number }>`
  position: absolute;
  top: -15px;
  right: -15px;
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  border: 2px solid ${(props) => {
    const colors = ["#7465ce", "#ebb734", "#025a3a", "#ff6b6b"]
    return colors[props.$index]
  }};
  z-index: 2;

  @media (max-width: 768px) {
    width: 35px;
    height: 35px;
    font-size: 18px;
    top: -10px;
    right: -10px;
  }
`

const VideoLabel = styled.div<{ $index: number; $isHovered: boolean }>`
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  backdrop-filter: blur(10px);
  border: 1px solid ${(props) => {
    const colors = ["#7465ce", "#ebb734", "#025a3a", "#ff6b6b"]
    return colors[props.$index]
  }};

  @media (max-width: 768px) {
    font-size: 12px;
    padding: 6px 12px;
    bottom: -30px;
  }
`

const OrbPulse = styled.div<{ $index: number }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid ${(props) => {
    const colors = ["#7465ce", "#ebb734", "#025a3a", "#ff6b6b"]
    return colors[props.$index]
  }};
  animation: ${orbPulse} 2s ease-in-out infinite;
  animation-delay: ${(props) => props.$index * 0.4}s;
  pointer-events: none;
`

const CentralHub = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 120px;
  z-index: 5;

  @media (max-width: 768px) {
    width: 80px;
    height: 80px;
  }
`

const HubGlow = styled.div`
  position: absolute;
  top: -20px;
  left: -20px;
  right: -20px;
  bottom: -20px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
  animation: ${pulse} 2s ease-in-out infinite;
`

const HubContent = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(20px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
`

const HubIcon = styled.div`
  font-size: 36px;
  margin-bottom: 8px;

  @media (max-width: 768px) {
    font-size: 24px;
    margin-bottom: 4px;
  }
`

const HubText = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 10px;
  }
`

const ConnectionLine = styled.div<{ $index: number; $isActive: boolean }>`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 2px;
  height: 150px;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    ${(props) => {
      const colors = ["#7465ce", "#ebb734", "#025a3a", "#ff6b6b"]
      return colors[props.$index]
    }} 50%,
    transparent 100%
  );
  transform-origin: top center;
  transform: translate(-50%, -60px) rotate(${(props) => props.$index * 90}deg);
  opacity: ${(props) => (props.$isActive ? 0.8 : 0.3)};
  animation: ${(props) => (props.$isActive ? connectionPulse : "none")} 1s ease-in-out infinite;
  transition: opacity 0.3s ease;

  @media (max-width: 768px) {
    height: 100px;
    transform: translate(-50%, -40px) rotate(${(props) => props.$index * 90}deg);
  }
`

const ScrollIndicator = styled.div`
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 1;
  transition: opacity 0.3s ease;
  z-index: 3;
`

const ScrollText = styled.div`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 12px;
  font-weight: 500;
`

const ScrollArrow = styled.div`
  font-size: 24px;
  color: #7465ce;
  animation: bounce 2s infinite;
  filter: drop-shadow(0 2px 4px rgba(116, 101, 206, 0.3));

  @keyframes bounce {
    0%,
    20%,
    50%,
    80%,
    100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-12px);
    }
    60% {
      transform: translateY(-6px);
    }
  }
`

