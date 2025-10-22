"use client";

import React from "react";
import styled from "styled-components";
import { Container } from "@mantine/core";
import Image from "next/image";
import { useRouter } from "next/navigation";

const LevelUpEventSection: React.FC = () => {
  const router = useRouter();

  const handleContactUs = () => {
    router.push("/connect");
  };

  const handleHostEvent = () => {
    router.push("/eventSchedule/createEventForm");
  };

  return (
    <SectionWrapper>
      <Container size="lg" px="md">
        <ContentWrapper>
          <IllustrationCard>
            <IllustrationImage
              src="/images/aboutLady.png"
              alt="Event management illustration"
              width={400}
              height={400}
            />
          </IllustrationCard>

          <TextContent>
            <Title>LEVEL UP YOUR EVENT</Title>
            <Description>
              Join the top artists and organizers who choose Kuepass to bring
              their live experiences to life.
            </Description>

            <ActionButtons>
              <ContactButton onClick={handleContactUs}>
                Contact Us
              </ContactButton>
              <HostEventLink onClick={handleHostEvent}>
                Host an event <ArrowIcon>→</ArrowIcon>
              </HostEventLink>
            </ActionButtons>
          </TextContent>
        </ContentWrapper>
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

const ContentWrapper = styled.div`
  display: flex;
  align-items: center;
  /* gap: 3rem; */
  max-width: 1000px;
  margin: 0 auto;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 2rem;
    text-align: center;
  }
`;

const IllustrationCard = styled.div`
  flex: 1;
  max-width: 400px;
  /* height: 400px; */
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    max-width: 300px;
    height: 300px;
  }

  @media (max-width: 480px) {
    max-width: 280px;
    height: 280px;
  }
`;

const IllustrationImage = styled(Image)`
  width: 100%;
  height: 100%;
  object-fit: contain;
  position: relative;
  z-index: 2;
`;

const TextContent = styled.div`
  flex: 1;
  padding-left: 1rem;
  padding: 50px;
  border-radius: 16px;
  background-color: #f9f9f9;

  @media (max-width: 768px) {
    padding-left: 0;
    text-align: center;
  }
`;

const Title = styled.h2`
  font-size: 30px;
  font-weight: 700;
  color: #151515;
  margin: 0 0 1.5rem 0;
  text-transform: uppercase;
  letter-spacing: -0.02em;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  @media (max-width: 480px) {
    font-size: 1.75rem;
  }
`;

const Description = styled.p`
  font-size: 20px;
  font-weight: 500;
  color: #6f6f6f;
  margin: 0 0 2rem 0;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 1.5rem;
  }

  @media (max-width: 480px) {
    font-size: 0.95rem;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }
`;

const ContactButton = styled.button`
  background-color: #f5b645;
  color: #000000;
  border: none;
  border-radius: 70px;
  padding: 0.875rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  font-family: "DM Sans", sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #e67e00;
    transform: translateY(-1px);
  }

  @media (max-width: 480px) {
    padding: 0.75rem 1.5rem;
    font-size: 0.95rem;
  }
`;

const HostEventLink = styled.a`
  color: #f5b645;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 700;
  font-family: "DM Sans", sans-serif;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: #666666;
  }

  @media (max-width: 480px) {
    font-size: 0.95rem;
  }
`;

const ArrowIcon = styled.span`
  font-size: 1.125rem;
  transition: transform 0.2s ease;

  ${HostEventLink}:hover & {
    transform: translateX(2px);
  }
`;

export default LevelUpEventSection;
