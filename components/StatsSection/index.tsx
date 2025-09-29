"use client";
import React from "react";
import styled from "styled-components";
import { Container, Text } from "@mantine/core";
import TestimonialsSection from "../TestimonialsSection";

interface StatsSectionProps {
  showHeader?: boolean;
  showTestimonials?: boolean;
  containerWidth?: string;
  customPadding?: string;
  customBackgroundColor?: string;
}

const StatsSection: React.FC<StatsSectionProps> = ({
  showHeader = true,
  showTestimonials = true,
  containerWidth = "xl",
  customPadding = "4rem 0",
  customBackgroundColor = "#f5f5f5",
}) => {
  const stats = [
    {
      id: 1,
      label: "Events Hosted",
      value: "+1200",
      description: "events hosted on Kuepass",
      labelColor: "#4FFF40",
      textColor: "#151515",
    },
    {
      id: 2,
      label: "Tickets Sold",
      value: "+50K",
      description: "tickets issued seamlessly",
      labelColor: "#FFE240",
      textColor: "#151515",
    },
    {
      id: 3,
      label: "Cities Covered",
      value: "+15",
      description: "cities across Nigeria",
      labelColor: "#DCFF40",
      textColor: "#151515",
    },
  ];

  return (
    <SectionWrapper
      $customPadding={customPadding}
      $customBackgroundColor={customBackgroundColor}
    >
      <Container size={containerWidth} px="md">
        {showHeader && (
          <HeaderText>
            <ItalicText>Kuepass</ItalicText> Delivers Results and experience for
            its Users. trusted by Event Organizers everywhere
          </HeaderText>
        )}

        <StatsGrid>
          {stats.map((stat) => (
            <StatColumn key={stat.id}>
              <StatLabel
                $backgroundColor={stat.labelColor}
                $textColor={stat.textColor}
              >
                {stat.label}
              </StatLabel>
              <StatValue>{stat.value}</StatValue>
              <StatDescription>{stat.description}</StatDescription>
            </StatColumn>
          ))}
        </StatsGrid>
      </Container>
      {showTestimonials && <TestimonialsSection />}
    </SectionWrapper>
  );
};

// Styled Components
const SectionWrapper = styled.section<{
  $customPadding: string;
  $customBackgroundColor: string;
}>`
  background-color: ${(props) => props.$customBackgroundColor};
  padding: ${(props) => props.$customPadding};

  @media (max-width: 768px) {
    padding: 2rem 0;
  }

  @media (max-width: 480px) {
    padding: 1.5rem 0;
  }
`;

const HeaderText = styled(Text)`
  padding: 0 12rem;
  font-size: 2.5rem;
  font-weight: 500;
  color: #151515;
  text-align: center;
  margin-bottom: 3rem;
  line-height: 1.3;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  @media (max-width: 768px) {
    font-size: 1.8rem;
    padding: 0 2rem;
    margin-bottom: 2rem;
    line-height: 1.4;
  }

  @media (max-width: 480px) {
    font-size: 1.4rem;
    padding: 0 1rem;
    margin-bottom: 1.5rem;
  }
`;

const ItalicText = styled.span`
  font-style: italic;
  font-weight: 300;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
  position: relative;
  background-color: #f5f5f5;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &::before {
    content: "";
    position: absolute;
    top: 2rem;
    left: 33.333%;
    width: 1px;
    height: calc(100% - 4rem);
    background-color: #e0e0e0;
    z-index: 1;
  }

  &::after {
    content: "";
    position: absolute;
    top: 2rem;
    left: 66.666%;
    width: 1px;
    height: calc(100% - 4rem);
    background-color: #e0e0e0;
    z-index: 1;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
    padding: 1.5rem;

    &::after,
    &::before {
      display: none;
    }
  }

  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

const StatColumn = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 1rem;

  @media (max-width: 768px) {
    padding: 0.5rem;
  }

  @media (max-width: 480px) {
    padding: 0.25rem;
  }
`;

const StatLabel = styled.div<{ $backgroundColor: string; $textColor: string }>`
  background-color: ${(props) => props.$backgroundColor};
  color: ${(props) => props.$textColor};
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 1rem;
  font-family: "DM Sans", sans-serif;
  display: inline-block;

  @media (max-width: 768px) {
    font-size: 0.8rem;
    padding: 0.3rem 0.6rem;
    margin-bottom: 0.8rem;
  }

  @media (max-width: 480px) {
    font-size: 0.7rem;
    padding: 0.25rem 0.5rem;
    margin-bottom: 0.6rem;
  }
`;

const StatValue = styled(Text)`
  font-size: 2.5rem;
  font-weight: 700;
  color: #000000;
  margin-bottom: 0.5rem;
  font-family: "DM Sans", sans-serif;

  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 0.4rem;
  }

  @media (max-width: 480px) {
    font-size: 1.6rem;
    margin-bottom: 0.3rem;
  }
`;

const StatDescription = styled(Text)`
  font-size: 1rem;
  color: #333333;
  font-weight: 400;
  line-height: 1.4;
  font-family: "DM Sans", sans-serif;

  @media (max-width: 768px) {
    font-size: 0.9rem;
    line-height: 1.3;
  }

  @media (max-width: 480px) {
    font-size: 0.8rem;
    line-height: 1.3;
  }
`;

export default StatsSection;
