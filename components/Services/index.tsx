// "use client";
// import React from "react";
// import styled from "styled-components";
// import { Container, Text, Button, Group, Stack } from "@mantine/core";
// import { FaCheck } from "react-icons/fa";
// import Image from "next/image";

// const ServicesSection: React.FC = () => {
//   return (
//     <SectionWrapper>
//       <SectionHeader>
//         <ServiceSubtitle>Services</ServiceSubtitle>

//         <ServiceTitle>
//           <span style={{ color: "#6F6F6F" }}> Smarter Event Management</span>
//           <br />
//           Seamless Tools for Unforgettable Events.
//         </ServiceTitle>
//       </SectionHeader>
//       <Container size="xl" px="md">
//         <ContentWrapper>
//           {/* Left Column - Mobile Image */}
//           <LeftColumnContainer>
//             <LeftColumn>
//               <MobileImageContainer>
//                 <PhoneImage
//                   src="/images/phone.png"
//                   alt="Kuepass Mobile App Interface"
//                   width={300}
//                   height={100}
//                   priority
//                 />
//               </MobileImageContainer>
//               <DescriptionText>
//                 Create your event, sell tickets, and manage registrations with
//                 ease. From QR-code entry to real-time tracking, Kuepass gives
//                 organizers full control in one seamless platform.
//               </DescriptionText>
//             </LeftColumn>
//             <LeftColumn>
//               <MobileImageContainer>
//                 <PhoneImage
//                   src="/images/phone.png"
//                   alt="Kuepass Mobile App Interface"
//                   width={300}
//                   height={100}
//                   priority
//                 />
//               </MobileImageContainer>
//               <DescriptionText>
//                 Create your event, sell tickets, and manage registrations with
//                 ease. From QR-code entry to real-time tracking, Kuepass gives
//                 organizers full control in one seamless platform.
//               </DescriptionText>
//             </LeftColumn>
//             <LeftColumn>
//               <MobileImageContainer>
//                 <PhoneImage
//                   src="/images/phone.png"
//                   alt="Kuepass Mobile App Interface"
//                   width={300}
//                   height={100}
//                   priority
//                 />
//               </MobileImageContainer>
//               <DescriptionText>
//                 Create your event, sell tickets, and manage registrations with
//                 ease. From QR-code entry to real-time tracking, Kuepass gives
//                 organizers full control in one seamless platform.
//               </DescriptionText>
//             </LeftColumn>
//           </LeftColumnContainer>

//           {/* Right Column - Service Information */}
//           <RightColumn>
//             <ServiceDescription>
//               Kuepass blends smart technology with simplicity, helping you plan
//               and manage events with ease.
//             </ServiceDescription>

//             <LearnMoreButton>Learn More</LearnMoreButton>

//             <FeaturesList>
//               <FeatureItem>
//                 <CheckIcon color="#4CAF50">
//                   <FaCheck />
//                 </CheckIcon>
//                 <FeatureText>Event Hosting & Ticketing</FeatureText>
//               </FeatureItem>

//               <FeatureItem>
//                 <CheckIcon color="#999">
//                   <FaCheck />
//                 </CheckIcon>
//                 <FeatureText>AI-Powered Event Planning</FeatureText>
//               </FeatureItem>

//               <FeatureItem>
//                 <CheckIcon color="#999">
//                   <FaCheck />
//                 </CheckIcon>
//                 <FeatureText>Event Discovery</FeatureText>
//               </FeatureItem>
//             </FeaturesList>
//           </RightColumn>
//         </ContentWrapper>
//       </Container>
//     </SectionWrapper>
//   );
// };

// // Styled Components
// const SectionWrapper = styled.section`
//   padding: 1rem 0;
//   background: white;
// `;

// const SectionHeader = styled.div`
//   text-align: left;
//   margin-bottom: 2rem;
//   padding-left: 32px;
// `;

// const ContentWrapper = styled.div`
//   display: grid;
//   grid-template-columns: 1fr 1fr;
//   align-items: start;

//   @media (max-width: 768px) {
//     grid-template-columns: 1fr;
//     gap: 2rem;
//   }
// `;

// const LeftColumnContainer = styled.div`
//   display: flex;
//   flex-direction: column;
//   gap: 2rem;
// `;

// const LeftColumn = styled.div`
//   display: flex;
//   width: 90%;
//   flex-direction: column;
//   align-items: center;
//   gap: 2rem;
//   background-color: #f4f5f7;
// `;

// const MobileImageContainer = styled.div`
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   height: 50vh;
//   position: relative;
//   top: 70px;
// `;

// const PhoneImage = styled(Image)`
//   max-width: 100%;
//   height: auto;
//   border-radius: 20px;
//   margin-top: 100px;
// `;

// const DescriptionText = styled(Text)`
//   color: #666;
//   background-color: #f9fafb;
//   text-align: left;
//   line-height: 1.5;
//   position: relative;
//   bottom: 0px;

//   font-weight: 400;
//   font-size: 24px;
//   padding: 10px;
//   /* width: 555px; */
//   /* padding-top: 10px;
//   padding-bottom: 10px; */
//   border-radius: 20px;
// `;

// const RightColumn = styled.div`
//   display: flex;
//   flex-direction: column;
//   gap: 1.5rem;
// `;

// const ServiceSubtitle = styled(Text)`
//   font-size: 20px;
//   color: #606060;
//   font-weight: 500;
//   letter-spacing: 0.5px;
//   margin: 0;
// `;

// const ServiceTitle = styled(Text)`
//   font-size: 50px;
//   font-weight: 500;
//   color: #151515;
//   line-height: 1.2;
//   margin: 0;

//   @media (max-width: 768px) {
//     font-size: 30px;
//   }
// `;

// const BoldText = styled.span`
//   font-weight: 700;
// `;

// const ServiceDescription = styled(Text)`
//   font-size: 32px;
//   font-weight: 400;
//   color: #151515;
//   line-height: 1.5;
// `;

// const LearnMoreButton = styled.button`
//   background: #f5b645;
//   color: #000;
//   border: none;
//   border-radius: 70px;
//   padding: 12px 104px;
//   font-size: 1rem;
//   font-weight: 600;
//   cursor: pointer;
//   transition: transform 0.2s ease;
//   align-self: flex-start;

//   &:hover {
//     transform: translateY(-2px);
//   }
// `;

// const FeaturesList = styled.div`
//   display: flex;
//   flex-direction: column;
//   gap: 1rem;
// `;

// const FeatureItem = styled(Group)`
//   align-items: center;
//   gap: 0.75rem;
// `;

// const CheckIcon = styled.div<{ color: string }>`
//   width: 20px;
//   height: 20px;
//   border-radius: 50%;
//   background: ${(props) => props.color};
//   color: white;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   font-size: 12px;
// `;

// const FeatureText = styled(Text)`
//   font-size: 1rem;
//   color: #333;
//   margin: 0;
// `;

// export default ServicesSection;

// "use client";
// import type React from "react";
// import { useState, useEffect, useRef } from "react";
// import styled from "styled-components";
// import { Container, Text, Group } from "@mantine/core";
// import { FaCheck } from "react-icons/fa";
// import Image from "next/image";

// const ServicesSection: React.FC = () => {
//   const [currentCardIndex, setCurrentCardIndex] = useState(0);
//   const [isFixed, setIsFixed] = useState(false);
//   const sectionRef = useRef<HTMLElement>(null);
//   const containerRef = useRef<HTMLDivElement>(null);

//   const serviceCards: Array<{
//     id: number;
//     title: string;
//     image: string;
//     description: string;
//   }> = [
//     {
//       id: 1,
//       title: "Event Management",
//       image: "/images/phone.png",
//       description:
//         "Create your event, sell tickets, and manage registrations with ease. From QR-code entry to real-time tracking, Kuepass gives organizers full control in one seamless platform.",
//     },
//     {
//       id: 2,
//       title: "AI Event Planning",
//       image: "/images/phone.png",
//       description:
//         "Let our AI assistant help you plan the perfect event. From venue suggestions to timeline optimization, get intelligent recommendations tailored to your needs.",
//     },
//     {
//       id: 3,
//       title: "Event Discovery",
//       image: "/images/phone.png",
//       description:
//         "Discover amazing events in your area and connect with like-minded attendees. Build your network and never miss out on experiences that matter to you.",
//     },
//   ];

//   useEffect(() => {
//     const handleScroll = () => {
//       if (!sectionRef.current) return;

//       const sectionRect = sectionRef.current.getBoundingClientRect();
//       const sectionTop = sectionRect.top;
//       const sectionHeight = sectionRef.current.offsetHeight;
//       const windowHeight = window.innerHeight;

//       // Calculate when section should be fixed (when it reaches top of viewport)
//       const shouldStartFixed = sectionTop <= 0;
//       // Significantly reduce scroll distance to eliminate white space
//       const maxScrollDistance = (sectionHeight - windowHeight) * 0.7;
//       const shouldStopFixed = Math.abs(sectionTop) >= maxScrollDistance;

//       if (shouldStartFixed && !shouldStopFixed) {
//         setIsFixed(true);

//         // Use simple threshold-based card switching for reliability
//         const scrolledDistance = Math.abs(sectionTop);
//         const scrollThreshold = maxScrollDistance / serviceCards.length;

//         let newCardIndex = 0;
//         if (scrolledDistance >= scrollThreshold * 1.8) {
//           newCardIndex = 2; // Third card (Event Discovery) - trigger earlier
//         } else if (scrolledDistance >= scrollThreshold * 0.8) {
//           newCardIndex = 1; // Second card (AI Event Planning) - trigger earlier
//         } else {
//           newCardIndex = 0; // First card (Event Management)
//         }

//         // Ensure we don't go beyond the last card
//         const clampedIndex = Math.min(newCardIndex, serviceCards.length - 1);

//         // Debug logging to see what's happening (remove in production)
//         // console.log("Scroll Debug:", { scrolledDistance, scrollThreshold, newCardIndex, clampedIndex });

//         // Always update to ensure smooth transitions
//         setCurrentCardIndex(clampedIndex);
//       } else {
//         setIsFixed(false);

//         // Handle both scrolling up and down consistently
//         if (sectionTop > 0) {
//           // Scrolling up above the section - show first card
//           setCurrentCardIndex(0);
//         }
//         // Remove the else if to prevent showing last card when scrolling down
//         // This should eliminate the white space
//       }
//     };

//     window.addEventListener("scroll", handleScroll, { passive: true });
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, [serviceCards.length, currentCardIndex]);

//   return (
//     <SectionWrapper
//       ref={sectionRef}
//       style={{ height: `${serviceCards.length * 100}vh` }}
//     >
//       <FixedContent $isFixed={isFixed} ref={containerRef}>
//         <SectionHeader>
//           <ServiceSubtitle>Services</ServiceSubtitle>
//           <ServiceTitle>
//             <span style={{ color: "#6F6F6F" }}> Smarter Event Management</span>
//             <br />
//             Seamless Tools for Unforgettable Events.
//           </ServiceTitle>
//         </SectionHeader>
//         <Container size="xl" px="md">
//           <ContentWrapper>
//             <LeftColumnContainer>
//               <LeftColumn key={`card-${currentCardIndex}`}>
//                 <MobileImageContainer>
//                   <PhoneImage
//                     src={serviceCards[currentCardIndex].image}
//                     alt="Kuepass Mobile App Interface"
//                     width={300}
//                     height={100}
//                     priority
//                   />
//                 </MobileImageContainer>
//                 <CardTitle>{serviceCards[currentCardIndex].title}</CardTitle>
//                 <DescriptionText>
//                   {serviceCards[currentCardIndex].description}
//                 </DescriptionText>
//               </LeftColumn>
//             </LeftColumnContainer>
//             <RightColumn>
//               <ServiceDescription>
//                 Kuepass blends smart technology with simplicity, helping you
//                 plan and manage events with ease.
//               </ServiceDescription>
//               <LearnMoreButton>Learn More</LearnMoreButton>
//               <FeaturesList>
//                 <FeatureItem>
//                   <CheckIcon color={currentCardIndex >= 0 ? "#4CAF50" : "#999"}>
//                     <FaCheck />
//                   </CheckIcon>
//                   <FeatureText>Event Hosting & Ticketing</FeatureText>
//                 </FeatureItem>
//                 <FeatureItem>
//                   <CheckIcon color={currentCardIndex >= 1 ? "#4CAF50" : "#999"}>
//                     <FaCheck />
//                   </CheckIcon>
//                   <FeatureText>AI-Powered Event Planning</FeatureText>
//                 </FeatureItem>
//                 <FeatureItem>
//                   <CheckIcon color={currentCardIndex >= 2 ? "#4CAF50" : "#999"}>
//                     <FaCheck />
//                   </CheckIcon>
//                   <FeatureText>Event Discovery</FeatureText>
//                 </FeatureItem>
//               </FeaturesList>
//               <ProgressIndicator>
//                 {serviceCards.map((_, index) => (
//                   <ProgressDot
//                     key={index}
//                     $isActive={index === currentCardIndex}
//                   />
//                 ))}
//               </ProgressIndicator>
//             </RightColumn>
//           </ContentWrapper>
//         </Container>
//       </FixedContent>
//     </SectionWrapper>
//   );
// };

// const SectionWrapper = styled.section`
//   position: relative;
//   background: white;
// `;

// const FixedContent = styled.div<{ $isFixed: boolean }>`
//   position: ${(props) => (props.$isFixed ? "fixed" : "relative")};
//   top: ${(props) => (props.$isFixed ? "0" : "auto")};
//   left: ${(props) => (props.$isFixed ? "0" : "auto")};
//   right: ${(props) => (props.$isFixed ? "0" : "auto")};
//   width: 100%;
//   height: ${(props) => (props.$isFixed ? "100vh" : "auto")};
//   background: white;
//   z-index: ${(props) => (props.$isFixed ? "10" : "auto")};
//   padding: 1rem 0;
//   display: flex;
//   flex-direction: column;
//   justify-content: center;
// `;

// const SectionHeader = styled.div`
//   text-align: left;
//   margin-bottom: 2rem;
//   padding-left: 32px;
// `;

// const ContentWrapper = styled.div`
//   display: grid;
//   grid-template-columns: 1fr 1fr;
//   align-items: center;
//   height: 100%;

//   @media (max-width: 768px) {
//     grid-template-columns: 1fr;
//     gap: 2rem;
//   }
// `;

// const LeftColumnContainer = styled.div`
//   display: flex;
//   flex-direction: column;
//   gap: 2rem;
//   height: 100%;
//   justify-content: center;
// `;

// const LeftColumn = styled.div`
//   display: flex;
//   width: 90%;
//   flex-direction: column;
//   align-items: center;
//   gap: 1.5rem;
//   background-color: #f4f5f7;
//   border-radius: 20px;
//   padding: 2rem;
//   transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
//   transform: translateY(0);
//   opacity: 1;
//   animation: fadeInUp 0.8s ease-out;

//   @keyframes fadeInUp {
//     from {
//       opacity: 0;
//       transform: translateY(30px);
//     }
//     to {
//       opacity: 1;
//       transform: translateY(0);
//     }
//   }
// `;

// const MobileImageContainer = styled.div`
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   height: 300px;
//   position: relative;
// `;

// const PhoneImage = styled(Image)`
//   max-width: 100%;
//   height: auto;
//   border-radius: 20px;
// `;

// const CardTitle = styled.h3`
//   font-size: 24px;
//   font-weight: 600;
//   color: #151515;
//   text-align: center;
//   margin: 0;
// `;

// const DescriptionText = styled(Text)`
//   color: #666;
//   background-color: #f9fafb;
//   text-align: center;
//   line-height: 1.5;
//   font-weight: 400;
//   font-size: 18px;
//   padding: 20px;
//   border-radius: 15px;
//   margin: 0;
//   transition: all 0.6s ease-in-out;
//   animation: fadeInText 0.6s ease-out 0.2s both;

//   @keyframes fadeInText {
//     from {
//       opacity: 0;
//       transform: translateY(20px);
//     }
//     to {
//       opacity: 1;
//       transform: translateY(0);
//     }
//   }
// `;

// const RightColumn = styled.div`
//   display: flex;
//   flex-direction: column;
//   gap: 1.5rem;
//   height: 100%;
//   justify-content: center;
// `;

// const ServiceSubtitle = styled(Text)`
//   font-size: 20px;
//   color: #606060;
//   font-weight: 500;
//   letter-spacing: 0.5px;
//   margin: 0;
// `;

// const ServiceTitle = styled(Text)`
//   font-size: 50px;
//   font-weight: 500;
//   color: #151515;
//   line-height: 1.2;
//   margin: 0;

//   @media (max-width: 768px) {
//     font-size: 30px;
//   }
// `;

// const ServiceDescription = styled(Text)`
//   font-size: 32px;
//   font-weight: 400;
//   color: #151515;
//   line-height: 1.5;
// `;

// const LearnMoreButton = styled.button`
//   background: #f5b645;
//   color: #000;
//   border: none;
//   border-radius: 70px;
//   padding: 12px 104px;
//   font-size: 1rem;
//   font-weight: 600;
//   cursor: pointer;
//   transition: transform 0.2s ease;
//   align-self: flex-start;

//   &:hover {
//     transform: translateY(-2px);
//   }
// `;

// const FeaturesList = styled.div`
//   display: flex;
//   flex-direction: column;
//   gap: 1rem;
// `;

// const FeatureItem = styled(Group)`
//   align-items: center;
//   gap: 0.75rem;
// `;

// const CheckIcon = styled.div<{ color: string }>`
//   width: 20px;
//   height: 20px;
//   border-radius: 50%;
//   background: ${(props) => props.color};
//   color: white;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   font-size: 12px;
//   transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
//   transform: scale(1);

//   &:hover {
//     transform: scale(1.1);
//   }
// `;

// const FeatureText = styled(Text)`
//   font-size: 1rem;
//   color: #333;
//   margin: 0;
// `;

// const ProgressIndicator = styled.div`
//   display: flex;
//   gap: 8px;
//   margin-top: 1rem;
// `;

// const ProgressDot = styled.div<{ $isActive: boolean }>`
//   width: 12px;
//   height: 12px;
//   border-radius: 50%;
//   background: ${(props) => (props.$isActive ? "#f5b645" : "#ddd")};
//   transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
//   transform: ${(props) => (props.$isActive ? "scale(1.2)" : "scale(1)")};
//   box-shadow: ${(props) =>
//     props.$isActive
//       ? "0 0 0 3px rgba(245, 182, 69, 0.2)"
//       : "0 0 0 0px rgba(245, 182, 69, 0.2)"};
// `;

// export default ServicesSection;

"use client";
import type React from "react";
import { useState, useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import { Container, Text, Group } from "@mantine/core";
import { FaCheck } from "react-icons/fa";
import Image from "next/image";
import AnimatedCopy from "../AnimatedCopy";

const ServicesSection: React.FC = () => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  const serviceCards = [
    {
      id: 1,
      title: "Event Management",
      image: "/images/phone.png",
      description:
        "Create your event, sell tickets, and manage registrations with ease. From QR-code entry to real-time tracking, Kuepass gives organizers full control in one seamless platform.",
    },
    {
      id: 2,
      title: "AI Event Planning",
      image: "/images/phone.png",
      description:
        "Let our AI assistant help you plan the perfect event. From venue suggestions to timeline optimization, get intelligent recommendations tailored to your needs.",
    },
    {
      id: 3,
      title: "Event Discovery",
      image: "/images/phone.png",
      description:
        "Discover amazing events in your area and connect with like-minded attendees. Build your network and never miss out on experiences that matter to you.",
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const sectionRect = sectionRef.current.getBoundingClientRect();
      const sectionTop = sectionRect.top;

      // Only run calculations when the section is sticky (at or above the top of the viewport)
      if (sectionTop <= 200) {
        const sectionHeight = sectionRef.current.offsetHeight;
        const windowHeight = window.innerHeight;
        const scrolledDistance = Math.abs(sectionTop);

        // The total distance we can scroll *while the element is sticky*
        const maxScrollDistance = sectionHeight - windowHeight;

        if (scrolledDistance >= maxScrollDistance) {
          setCurrentCardIndex(serviceCards.length - 1); // Lock to the last card at the end
          return;
        }

        const scrollFraction = scrolledDistance / maxScrollDistance;
        const newCardIndex = Math.floor(scrollFraction * serviceCards.length);
        const clampedIndex = Math.min(newCardIndex, serviceCards.length - 1);

        if (clampedIndex !== currentCardIndex) {
          setCurrentCardIndex(clampedIndex);
        }
      } else {
        // Reset to the first card if we scroll back up above the section
        setCurrentCardIndex(0);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [currentCardIndex, serviceCards.length]);

  return (
    // 1. The wrapper's height is now explicitly set to create the scroll track.
    <SectionWrapper ref={sectionRef} $cardCount={serviceCards.length}>
      {/* The main content uses `position: sticky` */}
      <StickyContent>
        <SectionHeader>
          <ServiceSubtitle>Services</ServiceSubtitle>
          <ServiceTitle>
            <span style={{ color: "#6F6F6F" }}> Smarter Event Management</span>
            <br />
            Seamless Tools for Unforgettable Events.
          </ServiceTitle>
        </SectionHeader>
        <Container size="xl" px="md">
          <ContentWrapper>
            <LeftColumnContainer>
              <LeftColumn key={`card-${currentCardIndex}`}>
                <MobileImageContainer>
                  <PhoneImage
                    src={serviceCards[currentCardIndex].image}
                    alt="Kuepass Mobile App Interface"
                    width={300}
                    height={100}
                    priority
                  />
                </MobileImageContainer>
                <CardTitle>{serviceCards[currentCardIndex].title}</CardTitle>
                <DescriptionText>
                  {serviceCards[currentCardIndex].description}
                </DescriptionText>
              </LeftColumn>
            </LeftColumnContainer>
            <RightColumn>
              <AnimatedCopy>
                <ServiceDescription>
                  Kuepass blends smart technology with simplicity, helping you
                  plan and manage events with ease.
                </ServiceDescription>
              </AnimatedCopy>
              <LearnMoreButton>Learn More</LearnMoreButton>
              <FeaturesList>
                <FeatureItem>
                  <CheckIcon color={currentCardIndex >= 0 ? "#4CAF50" : "#999"}>
                    <FaCheck />
                  </CheckIcon>
                  <FeatureText>Event Hosting & Ticketing</FeatureText>
                </FeatureItem>
                <FeatureItem>
                  <CheckIcon color={currentCardIndex >= 1 ? "#4CAF50" : "#999"}>
                    <FaCheck />
                  </CheckIcon>
                  <FeatureText>AI-Powered Event Planning</FeatureText>
                </FeatureItem>
                <FeatureItem>
                  <CheckIcon color={currentCardIndex >= 2 ? "#4CAF50" : "#999"}>
                    <FaCheck />
                  </CheckIcon>
                  <FeatureText>Event Discovery</FeatureText>
                </FeatureItem>
              </FeaturesList>
            </RightColumn>
          </ContentWrapper>
        </Container>
      </StickyContent>
    </SectionWrapper>
  );
};

// 2. SectionWrapper now uses a clear height calculation.
// Each card gets 100vh of scroll space.
const SectionWrapper = styled.section<{ $cardCount: number }>`
  position: relative;
  background: white;
  height: ${(props) => props.$cardCount * 100}vh;
`;

// 3. StickyContent is simplified. No more overflow property.
const StickyContent = styled.div`
  position: sticky;
  top: 0;
  width: 100%;
  height: 120vh;
  background: white;
  z-index: 10;
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
  justify-content: center;

  @media (max-width: 768px) {
    height: auto;
    padding: 0.5rem 0;
  }

  @media (max-width: 480px) {
    padding: 0.25rem 0;
  }
`;

// ... (The rest of your styled-components remain the same)

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;
const SectionHeader = styled.div`
  text-align: left;
  margin-bottom: 2rem;
  padding-left: 32px;

  @media (max-width: 768px) {
    padding-left: 1rem;
    margin-bottom: 1.5rem;
  }

  @media (max-width: 480px) {
    padding-left: 0.5rem;
    margin-bottom: 1rem;
  }
`;
const ContentWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  height: 100%;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
    height: auto;
    padding: 1rem 0;
  }

  @media (max-width: 480px) {
    gap: 1.5rem;
    padding: 0.5rem 0;
  }
`;
const LeftColumnContainer = styled.div`
  display: flex;
  gap: 2rem;
  height: 100%;
  justify-content: center;

  @media (max-width: 768px) {
    height: auto;
    gap: 1rem;
  }

  @media (max-width: 480px) {
    gap: 0.5rem;
  }
`;
const LeftColumn = styled.div`
  display: flex;
  width: 80%;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  background-color: #f4f5f7;
  border-radius: 20px;
  animation: ${fadeInUp} 0.8s ease-out;

  @media (max-width: 768px) {
    width: 95%;
    padding: 1.5rem;
    gap: 1rem;
  }

  @media (max-width: 480px) {
    width: 98%;
    padding: 1rem;
    gap: 0.8rem;
    border-radius: 15px;
  }
`;
const MobileImageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  position: relative;
  top: 100px;

  @media (max-width: 768px) {
    height: 150px;
    top: 50px;
  }

  @media (max-width: 480px) {
    height: 120px;
    top: 30px;
  }
`;
const PhoneImage = styled(Image)`
  max-width: 100%;
  height: auto;
  border-radius: 20px;

  @media (max-width: 768px) {
    max-width: 80%;
    border-radius: 15px;
  }

  @media (max-width: 480px) {
    max-width: 70%;
    border-radius: 12px;
  }
`;
const CardTitle = styled.h3`
  font-size: 24px;
  font-weight: 600;
  color: #151515;
  text-align: center;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 20px;
  }

  @media (max-width: 480px) {
    font-size: 18px;
  }
`;
const fadeInText = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;
const DescriptionText = styled(Text)`
  color: #666;
  background-color: #f9fafb;
  text-align: left;
  line-height: 1.5;
  font-weight: 400;
  font-size: 16px;
  padding: 20px;
  border-radius: 15px;
  margin: 0;
  animation: ${fadeInText} 0.6s ease-out 0.2s both;
  position: relative;
  bottom: 0px;
  height: 22vh;

  @media (max-width: 768px) {
    font-size: 18px;
    padding: 15px;
    line-height: 1.4;
  }

  @media (max-width: 480px) {
    font-size: 16px;
    padding: 12px;
    line-height: 1.3;
  }
`;
const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  height: 100%;
  /* justify-content: center; */

  @media (max-width: 768px) {
    height: auto;
    gap: 1rem;
    padding: 0 1rem;
  }

  @media (max-width: 480px) {
    gap: 0.8rem;
    padding: 0 0.5rem;
  }
`;
const ServiceSubtitle = styled(Text)`
  font-size: 20px;
  color: #606060;
  font-weight: 500;
  letter-spacing: 0.5px;
  margin: 0;
`;
const ServiceTitle = styled(Text)`
  font-size: 40px;
  font-weight: 500;
  color: #151515;
  line-height: 1.2;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 28px;
    line-height: 1.3;
  }

  @media (max-width: 480px) {
    font-size: 24px;
    line-height: 1.3;
  }
`;
const ServiceDescription = styled(Text)`
  font-size: 24px;
  font-weight: 400;
  color: #151515;
  line-height: 1.5;

  @media (max-width: 768px) {
    font-size: 24px;
    line-height: 1.4;
  }

  @media (max-width: 480px) {
    font-size: 20px;
    line-height: 1.3;
  }
`;
const LearnMoreButton = styled.button`
  background: #f5b645;
  color: #000;
  border: none;
  border-radius: 70px;
  padding: 12px 104px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;
  align-self: flex-start;

  &:hover {
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    padding: 10px 80px;
    font-size: 0.9rem;
    align-self: center;
  }

  @media (max-width: 480px) {
    padding: 8px 60px;
    font-size: 0.8rem;
    border-radius: 50px;
  }
`;
const FeaturesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @media (max-width: 768px) {
    gap: 0.8rem;
  }

  @media (max-width: 480px) {
    gap: 0.6rem;
  }
`;
const FeatureItem = styled(Group)`
  align-items: center;
  gap: 0.75rem;
`;
const CheckIcon = styled.div<{ color: string }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${(props) => props.color};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  transform: scale(1);
  &:hover {
    transform: scale(1.1);
  }
`;
const FeatureText = styled(Text)`
  font-size: 1rem;
  color: #333;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }

  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;
// const ProgressIndicator = styled.div`
//   display: flex;
//   gap: 8px;
//   margin-top: 1rem;
// `;
// const ProgressDot = styled.div<{ $isActive: boolean }>`
//   width: 12px;
//   height: 12px;
//   border-radius: 50%;
//   background: ${(props) => (props.$isActive ? "#f5b645" : "#ddd")};
//   transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
//   transform: ${(props) => (props.$isActive ? "scale(1.2)" : "scale(1)")};
//   box-shadow: ${(props) =>
//     props.$isActive
//       ? "0 0 0 3px rgba(245, 182, 69, 0.2)"
//       : "0 0 0 0px rgba(245, 182, 69, 0.2)"};
// `;

export default ServicesSection;
