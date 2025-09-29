"use client";
import React from "react";
import styled from "styled-components";
import { Card, Text, Badge, Group } from "@mantine/core";
import Link from "next/link";
import Image from "next/image";
import { FaCalendar, FaUser, FaMapMarkerAlt, FaClock } from "react-icons/fa";

export interface EventCardProps {
  image: string;
  title: string;
  date: string;
  time: string;
  organizer: string;
  location: string;
  address: string;
  category?: string;
  isFeatured?: boolean;
  eventId?: string;
  price?: string;
}

const EventCard: React.FC<EventCardProps> = ({
  image,
  title,
  date,
  organizer,
  address,
  category,
  isFeatured = false,
  eventId = "event-details",
  price,
}) => {
  // Compute the href for "View Details" button
  const detailsHref =
    eventId && eventId.startsWith("static-event-")
      ? `/event-unavailable?title=${encodeURIComponent(title)}`
      : `/eventSchedule/eventDetails/${eventId}`;

  return (
    <CardWrapper>
      <CardContent>
        <ImageWrapper>
          {category && (
            <CategoryBadge category={category}>{category}</CategoryBadge>
          )}
          {isFeatured && <FeaturedBadge>Featured</FeaturedBadge>}
          <CardImage src={image} alt={title} />
        </ImageWrapper>

        <CardBody>
          <div
            style={{ borderBottom: "1px solid #e9ecef", paddingBottom: "10px" }}
          >
            <CardTitle>{title}</CardTitle>
          </div>

          <MetaInfo>
            <MetaItem>
              <Image
                src="/images/location.png"
                alt="Location"
                width="30"
                height="30"
                style={{ width: "30px", height: "30x", objectFit: "contain" }}
              />
              <MetaText>{address}</MetaText>
            </MetaItem>

            <MetaItem>
              <Image
                src="/images/Edate.png"
                alt="Location"
                width="30"
                height="30"
                style={{ width: "30px", height: "30x", objectFit: "contain" }}
              />
              <MetaText>{date}</MetaText>
            </MetaItem>

            <MetaItem>
              <MetaText>
                {price && price !== "0" && price !== "free"
                  ? `N${price}`
                  : "Free"}
              </MetaText>
            </MetaItem>
          </MetaInfo>
        </CardBody>
      </CardContent>
    </CardWrapper>
  );
};

// Styled Components

const CardWrapper = styled.div`
  width: 100%;
  max-width: 350px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-4px);
  }

  @media (max-width: 576px) {
    width: 100%;
    max-width: 300px;
  }
`;

// const CardHeader = styled.div`
//   border-bottom: 1px solid #e9ecef;
// `;

const CardContent = styled(Card)`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  overflow: hidden;
  border: none;
  background-color: white;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
`;

const ImageWrapper = styled.div`
  position: relative;
  overflow: hidden;
`;

const CardImage = styled.img`
  transition: transform 0.3s ease;
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 16px 16px 0 0;

  ${CardContent}:hover & {
    transform: scale(1.02);
  }
`;

const CategoryBadge = styled(Badge)<{ category?: string }>`
  position: absolute;
  top: 12px;
  left: 12px;
  background-color: ${(props) => {
    switch (props.category?.toLowerCase()) {
      case "upcoming":
        return "#F5B645";
      case "ongoing":
        return "#15302B";
      case "past":
        return "red";
      default:
        return "red";
    }
  }};
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
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
`;

const CardTitle = styled(Text)`
  font-size: 1.25rem;
  font-weight: 500;
  color: #151515;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 0;
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
  font-size: 0.9rem;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CalendarIcon = styled(FaCalendar)`
  color: #999;
  width: 14px;
  height: 14px;
  min-width: 14px;
`;

const TimeIcon = styled(FaClock)`
  color: #999;
  width: 14px;
  height: 14px;
  min-width: 14px;
`;

const OrganizerIcon = styled(FaUser)`
  color: #999;
  width: 14px;
  height: 14px;
  min-width: 14px;
`;

const LocationIcon = styled(FaMapMarkerAlt)`
  color: #999;
  width: 14px;
  height: 14px;
  min-width: 14px;
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  margin-top: auto;
`;

const ViewDetailsButton = styled.button`
  background-color: #f8f9fa;
  color: #000;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 0.5rem;

  &:hover {
    background-color: #ff6b35;
    color: #fff;
    border-color: #ff6b35;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

export default EventCard;
