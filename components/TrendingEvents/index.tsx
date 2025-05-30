// "use client";
// import React from "react";
// import styled from "styled-components";
// import { Stack, Flex, Text, Container } from "@mantine/core";
// import { FaArrowRight } from "react-icons/fa";
// import Link from "next/link";
// import eventCards from "./eventCards";
// import EventCard from "./cardsPromps";

// interface EventSectionProps {
//   title?: string;
//   viewAllLink?: string;
//   limit?: number;
// }

// export const EventSection: React.FC<EventSectionProps> = ({
//   title = "Trending Events",
//   viewAllLink = "/eventSchedule/events",
//   limit,
// }) => {
//   const displayedEvents = limit ? eventCards.slice(0, limit) : eventCards;

//   return (
//     <SectionWrapper>
//       <Container size="xl" px="md">
//         <SectionContent>
//           {/* Header Section */}
//           <SectionHeader>
//             <SectionTitle>{title}</SectionTitle>
//             <ViewMoreWrapper href={viewAllLink}>
//               <ViewMoreText>
//                 See More <ArrowIcon />
//               </ViewMoreText>
//             </ViewMoreWrapper>
//           </SectionHeader>

//           {/* Events Grid */}
//           <EventsGrid>
//             {displayedEvents.map((event, index) => (
//               <EventCard key={index} {...event} />
//             ))}
//           </EventsGrid>
//         </SectionContent>
//       </Container>
//     </SectionWrapper>
//   );
// };

// // Styled Components with responsive design
// const SectionWrapper = styled.section`
//   background-color: rgb(253, 248, 247);
//   width: 100%;
//   padding: 3rem 0;

//   @media (max-width: 768px) {
//     padding: 2rem 0;
//   }
// `;

// const SectionContent = styled(Stack)`
//   gap: 2rem;
// `;

// const SectionHeader = styled(Flex)`
//   justify-content: space-between;
//   align-items: center;

//   @media (max-width: 768px) {
//     padding: 0 1rem;
//   }
// `;

// const SectionTitle = styled(Text)`
//   font-size: 1.5rem;
//   font-weight: 700;
//   color: #000000;
//   position: relative;

//   &::after {
//     content: "";
//     position: absolute;
//     bottom: -8px;
//     left: 0;
//     width: 40px;
//     height: 3px;
//     background-color: #056348;
//   }

//   @media (max-width: 576px) {
//     font-size: 1.25rem;
//   }
// `;

// const ViewMoreWrapper = styled(Link)`
//   text-decoration: none;
//   transition: transform 0.2s ease;

//   &:hover {
//     transform: translateX(4px);
//   }
// `;

// const ViewMoreText = styled(Text)`
//   display: flex;
//   align-items: center;
//   font-size: 1rem;
//   font-weight: 700;
//   color: #056348;
// `;

// const ArrowIcon = styled(FaArrowRight)`
//   margin-left: 8px;
//   width: 16px;
//   height: 16px;
//   transition: transform 0.2s ease;

//   ${ViewMoreWrapper}:hover & {
//     transform: translateX(2px);
//   }
// `;

// const EventsGrid = styled(Flex)`
//   gap: 1.5rem;
//   flex-wrap: wrap;
//   justify-content: center;

//   @media (max-width: 768px) {
//     gap: 1rem;
//   }
// `;

// export default EventSection;




"use client";
import React from "react";
import styled from "styled-components";
import { Stack, Flex, Text, Container } from "@mantine/core";
import { FaArrowRight } from "react-icons/fa";
import Link from "next/link";
import eventCards from "./eventCards"; // Assuming this is your mock data
import EventCard from "./cardsPromps";   // Assuming this is your card component

interface EventSectionProps {
  id?: string; // Add id as an optional prop
  title?: string;
  viewAllLink?: string;
  limit?: number;
}

export const EventSection: React.FC<EventSectionProps> = ({
  id = "trending-events-section", // Default id, can be overridden by prop
  title = "Trending Events",
  viewAllLink = "/eventSchedule/events", // This should likely go to a page listing ALL events
  limit,
}) => {
  const displayedEvents = limit ? eventCards.slice(0, limit) : eventCards;

  return (
    // Apply the id to the SectionWrapper
    <SectionWrapper id={id}> 
      <Container size="xl" px="md">
        <SectionContent>
          {/* Header Section */}
          <SectionHeader>
            <SectionTitle>{title}</SectionTitle>
            <ViewMoreWrapper href={viewAllLink}>
              <ViewMoreText>
                See More <ArrowIcon />
              </ViewMoreText>
            </ViewMoreWrapper>
          </SectionHeader>

          {/* Events Grid */}
          <EventsGrid>
            {displayedEvents.map((event, index) => (
              <EventCard key={index} {...event} />
            ))}
          </EventsGrid>
        </SectionContent>
      </Container>
    </SectionWrapper>
  );
};

// Styled Components with responsive design (keep these as they are)
const SectionWrapper = styled.section`
  background-color: rgb(253, 248, 247);
  width: 100%;
  padding: 3rem 0;

  @media (max-width: 768px) {
    padding: 2rem 0;
  }
`;

const SectionContent = styled(Stack)`
  gap: 2rem;
`;

const SectionHeader = styled(Flex)`
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const SectionTitle = styled(Text)`
  font-size: 1.5rem;
  font-weight: 700;
  color: #000000;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 40px;
    height: 3px;
    background-color: #056348;
  }

  @media (max-width: 576px) {
    font-size: 1.25rem;
  }
`;

const ViewMoreWrapper = styled(Link)`
  text-decoration: none;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateX(4px);
  }
`;

const ViewMoreText = styled(Text)`
  display: flex;
  align-items: center;
  font-size: 1rem;
  font-weight: 700;
  color: #056348;
`;

const ArrowIcon = styled(FaArrowRight)`
  margin-left: 8px;
  width: 16px;
  height: 16px;
  transition: transform 0.2s ease;

  ${ViewMoreWrapper}:hover & {
    transform: translateX(2px);
  }
`;

const EventsGrid = styled(Flex)`
  gap: 1.5rem;
  flex-wrap: wrap;
  justify-content: center;

  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

export default EventSection;
