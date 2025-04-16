// "use client";
// import React from "react";
// import styled from "styled-components";
// import { Card, Image, Text, Group, Button, Box } from "@mantine/core";
// import Link from "next/link";

// interface EventCardProps {
//   image: string;
//   title: string;
//   date: string;
//   time: string;
//   organizer: string;
//   location: string;
// }

// const EventCard: React.FC<EventCardProps> = ({
//   image,
//   title,
//   date,
//   time,
//   organizer,
//   location,
// }) => {
//   return (
//     <StyledCard>
//       <Card.Section>
//         <StyledImage src={image} alt={title} />
//       </Card.Section>

//       <Group position="apart" mt="md" mb="xs">
//         <CardTitle>{title}</CardTitle>
//       </Group>

//       <Text size="sm" color="dimmed">
//         📅 {date}, {time}
//       </Text>
//       <Text size="sm" color="dimmed">
//         📺 {organizer}
//       </Text>
//       <Text size="sm" color="dimmed">
//         📍 {location}
//       </Text>

//       <Box mt="md">
//         <StyledLink href="/eventSchedule/events">
//           <LightButton>View Details</LightButton>
//         </StyledLink>
//       </Box>
//     </StyledCard>
//   );
// };

// export default EventCard;

// // Styled Components

// // Styled Card replacing .card
// const StyledCard = styled(Card)`
//   box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
//   padding: 16px;
//   border-radius: 8px;
//   border: 1px solid #ddd;
//   width: 260px;
//   background-color: #fff;
// `;

// const StyledImage = styled(Image)`
//   /* Add any specific styles if .cardIMG had styles */
// `;

// // Styled Text replacing .cardTitle
// const CardTitle = styled(Text)`
//   font-size: 16px;
//   font-weight: 500;
//   color: #000000;
// `;

// // Styled Button replacing .lightButton
// const LightButton = styled(Button)`
//   background-color: #ebf8ff;
//   color: rgb(164, 150, 255);
//   border: none;
//   border-radius: 8px;
//   width: 100%;
//   margin-top: 16px;
//   padding: 10px 16px;
//   cursor: pointer;
//   text-align: center;
//   font-size: 16px;

//   /* Optional: Add hover effects */
//   &:hover {
//     background-color: #d6eaff;
//     color: skyblue;
//   }
// `;

// // Styled Link (optional: to remove default link styles)
// const StyledLink = styled(Link)`
//   text-decoration: underline;
//   display: block; /* Ensure it occupies full width if needed */
// `;


"use client";
import React from "react";
import styled from "styled-components";
import { Card, Image, Text, Box, Badge, Group } from "@mantine/core";
import Link from "next/link";
import { FaCalendar, FaUser, FaMapMarkerAlt, FaClock } from "react-icons/fa";

export interface EventCardProps {
  image: string;
  title: string;
  date: string;
  time: string;
  organizer: string;
  location: string;
  category?: string;
  isFeatured?: boolean;
  eventId?: string;
}

const EventCard: React.FC<EventCardProps> = ({
  image,
  title,
  date,
  time,
  organizer,
  location,
  category,
  isFeatured = false,
  eventId = "event-details",
}) => {
  return (
    <CardWrapper>
      <CardContent>
        <ImageWrapper>
          {category && <CategoryBadge>{category}</CategoryBadge>}
          {isFeatured && <FeaturedBadge>Featured</FeaturedBadge>}
          <CardImage src={image} alt={title} radius="md" height={180} />
        </ImageWrapper>

        <CardBody>
          <CardTitle>{title}</CardTitle>

          <MetaInfo>
            <MetaItem>
              <CalendarIcon />
              <MetaText>{date}</MetaText>
            </MetaItem>
            
            <MetaItem>
              <TimeIcon />
              <MetaText>{time}</MetaText>
            </MetaItem>
            
            <MetaItem>
              <OrganizerIcon />
              <MetaText>{organizer}</MetaText>
            </MetaItem>
            
            <MetaItem>
              <LocationIcon />
              <MetaText>{location}</MetaText>
            </MetaItem>
          </MetaInfo>

          <StyledLink href="/eventSchedule/events">
            <ViewDetailsButton>View Details</ViewDetailsButton>
          </StyledLink>
        </CardBody>
      </CardContent>
    </CardWrapper>
  );
};

// Styled Components with enhanced design
const CardWrapper = styled.div`
  width: 300px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-6px);
  }
  
  @media (max-width: 576px) {
    width: 100%;
    max-width: 300px;
  }
`;

const CardContent = styled(Card)`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background-color: white;
  
  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
`;

const ImageWrapper = styled.div`
  position: relative;
  overflow: hidden;
`;

const CardImage = styled(Image)`
  transition: transform 0.5s ease;
  width: 100%;
  
  ${CardContent}:hover & {
    transform: scale(1.05);
  }
`;

const CategoryBadge = styled(Badge)`
  position: absolute;
  top: 12px;
  left: 12px;
  background-color: rgba(5, 99, 72, 0.85);
  color: white;
  font-size: 0.75rem;
  z-index: 2;
  padding: 0.3rem 0.6rem;
`;

const FeaturedBadge = styled(Badge)`
  position: absolute;
  top: 12px;
  right: 12px;
  background-color: rgba(164, 150, 255, 0.85);
  color: white;
  font-size: 0.75rem;
  z-index: 2;
  padding: 0.3rem 0.6rem;
`;

const CardBody = styled.div`
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
`;

const CardTitle = styled(Text)`
  font-size: 1.125rem;
  font-weight: 600;
  color: #000;
  line-height: 1.4;
  margin-bottom: 0.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const MetaInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const MetaItem = styled(Group)`
  align-items: center;
  gap: 0.5rem;
  flex-wrap: nowrap;
`;

const MetaText = styled(Text)`
  font-size: 0.875rem;
  color: #555;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CalendarIcon = styled(FaCalendar)`
  color: #056348;
  width: 14px;
  height: 14px;
  min-width: 14px;
`;

const TimeIcon = styled(FaClock)`
  color: #056348;
  width: 14px;
  height: 14px;
  min-width: 14px;
`;

const OrganizerIcon = styled(FaUser)`
  color: #056348;
  width: 14px;
  height: 14px;
  min-width: 14px;
`;

const LocationIcon = styled(FaMapMarkerAlt)`
  color: #056348;
  width: 14px;
  height: 14px;
  min-width: 14px;
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  margin-top: auto;
`;

const ViewDetailsButton = styled.button`
  background-color: #ebf8ff;
  color: rgb(164, 150, 255);
  border: none;
  border-radius: 8px;
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 0.5rem;
  
  &:hover {
    background-color: #056348;
    color: #FFF;
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

export default EventCard;