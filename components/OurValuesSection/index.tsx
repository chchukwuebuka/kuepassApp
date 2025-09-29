"use client";

import React from "react";
import styled from "styled-components";
import { Container, Text } from "@mantine/core";

const OurValuesSection: React.FC = () => {
  const values = [
    {
      id: 1,
      title: "Community at Our Core",
      description:
        "Our work is about more than tickets; it's about strengthening our community by fostering the connections and lasting memories created events.",
    },
    {
      id: 2,
      title: "Empower Creators",
      description:
        "We empower event creators with powerful, intuitive tools, giving them the freedom to focus on what matters most: creating incredible experiences. Their success is our success.",
    },
    {
      id: 3,
      title: "Radical Simplicity",
      description:
        "We exist to eliminate the messy logistics of event management. We do this by relentlessly focusing on making every step from creation to check-in feel simple, powerful, and seamless.",
    },
    {
      id: 4,
      title: "Passionate Culture",
      description:
        "We're not just a platform, we're an extension of your team. We are deeply invested in your success and believe in the power of creating amazing events together",
    },
    {
      id: 5,
      title: "Champion the Attendee",
      description:
        "An event's success depends on its audience. That's why we obsessively craft the discovery experience, making it easy to explore your passions and connect with your community.",
    },
  ];

  return (
    <SectionWrapper>
      <Container size="xl" px="md">
        <SectionTitle>Our Values</SectionTitle>

        <ValuesGrid>
          <FirstRow>
            {values.slice(0, 3).map((value) => (
              <ValueCard key={value.id}>
                <ValueTitle>{value.title}</ValueTitle>
                <ValueDescription>{value.description}</ValueDescription>
              </ValueCard>
            ))}
          </FirstRow>
          <SecondRow>
            {values.slice(3, 5).map((value) => (
              <ValueCard key={value.id}>
                <ValueTitle>{value.title}</ValueTitle>
                <ValueDescription>{value.description}</ValueDescription>
              </ValueCard>
            ))}
          </SecondRow>
        </ValuesGrid>
      </Container>
    </SectionWrapper>
  );
};

// Styled Components
const SectionWrapper = styled.section`
  background-color: white;
  padding: 4rem 0;
  font-family: "DM Sans", sans-serif;

  @media (max-width: 768px) {
    padding: 3rem 0;
  }

  @media (max-width: 480px) {
    padding: 2rem 0;
  }
`;

const SectionTitle = styled(Text)`
  font-size: 2.5rem;
  font-weight: 500;
  color: #000000;
  text-align: center;
  margin-bottom: 2rem;
  font-family: "DM Sans", sans-serif;

  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 2rem;
  }

  @media (max-width: 480px) {
    font-size: 1.75rem;
    margin-bottom: 1.5rem;
  }
`;

const ValuesGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 1000px;
  margin: 0 auto;

  @media (max-width: 768px) {
    gap: 1.5rem;
    max-width: 600px;
  }

  @media (max-width: 480px) {
    gap: 1rem;
    padding: 0 1rem;
  }
`;

const FirstRow = styled.div`
  display: flex;
  gap: 2rem;
  justify-content: center;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1.5rem;
  }

  @media (max-width: 480px) {
    gap: 1rem;
  }
`;

const SecondRow = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1.5rem;
  }

  @media (max-width: 480px) {
    gap: 1rem;
  }
`;

const ValueCard = styled.div`
  background-color: #f8faf8;
  border-radius: 8px;
  padding: 20px;
  text-align: left;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  width: 280px;
  /* height:100%; */
  display: flex;
  flex-direction: column;
  justify-content: flex-start;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 768px) {
    width: 100%;
    height: auto;
    min-height: 180px;
    padding: 1.5rem;
  }

  @media (max-width: 480px) {
    min-height: 160px;
    padding: 1.25rem;
  }
`;

const ValueTitle = styled(Text)`
  font-size: 20px;
  font-weight: 500;
  color: #15302B;
  margin-bottom: 1rem;
  line-height: 1.3;
  font-family: "DM Sans", sans-serif;

  @media (max-width: 768px) {
    font-size: 1.125rem;
    margin-bottom: 0.8rem;
  }

  @media (max-width: 480px) {
    font-size: 1rem;
    margin-bottom: 0.6rem;
  }
`;

const ValueDescription = styled(Text)`
  font-size: 1rem;
  color: #000000;
  font-weight: 400;
  line-height: 1.6;
  font-family: "DM Sans", sans-serif;

  @media (max-width: 768px) {
    font-size: 0.95rem;
    line-height: 1.5;
  }

  @media (max-width: 480px) {
    font-size: 0.9rem;
    line-height: 1.4;
  }
`;

export default OurValuesSection;
