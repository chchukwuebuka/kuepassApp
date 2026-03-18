"use client";
import React from "react";
import styled from "styled-components";
import { Container, Text } from "@mantine/core";
import Image from "next/image";
import { useRouter } from "next/navigation";
import AnimatedCopy from "../AnimatedCopy";

const HelpSection: React.FC = () => {
  const router = useRouter();

  const handleContactClick = () => {
    router.push("/connect");
  };

  return (
    <SectionWrapper>
      <Container size="lg" px="sm">
        <HelpCard>
          <LeftContent>
            <AnimatedCopy>
              <Heading>How Can We Help?</Heading>
            </AnimatedCopy>
            <AnimatedCopy>
              <Description>
                From your first question to your event day, our dedicated team is
                here to ensure your success. Let us know how we can support you.
              </Description>
            </AnimatedCopy>
            <ContactButton onClick={handleContactClick}>
              Contact Us
            </ContactButton>
          </LeftContent>

          <RightContent>
            <TeamImage
              src="/images/help.png"
              alt="Team collaboration"
              width={500}
              height={350}
            />
          </RightContent>
        </HelpCard>
      </Container>
    </SectionWrapper>
  );
};

// Styled Components
const SectionWrapper = styled.section`
  background-color: white;
  padding: 4rem 0;

  @media (max-width: 768px) {
    padding: 2rem 0;
  }

  @media (max-width: 480px) {
    padding: 1.5rem 0;
  }
`;

const HelpCard = styled.div`
  background-color: #f8f8f8;
  border-radius: 24px;
  padding: 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
    padding: 2rem;
    border-radius: 20px;
  }

  @media (max-width: 480px) {
    padding: 1.5rem;
    gap: 1.5rem;
    border-radius: 16px;
  }
`;

const LeftContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  text-align: left;
  height: 100%;
  padding: 2rem;
  padding-top: 50px;

  @media (max-width: 768px) {
    text-align: center;
    gap: 1.2rem;
  }

  @media (max-width: 480px) {
    gap: 1rem;
  }
`;

const Heading = styled(Text)`
  font-size: 2.5rem;
  font-weight: 600;
  color: #151515;
  /* margin: 0; */
  line-height: 1.2;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  @media (max-width: 768px) {
    font-size: 2.2rem;
  }

  @media (max-width: 480px) {
    font-size: 1.8rem;
  }
`;

const Description = styled(Text)`
  font-size: 1.1rem;
  font-weight: 400;
  color: #151515;
  /* margin: 0; */
  line-height: 1.6;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  @media (max-width: 768px) {
    font-size: 0.95rem;
    line-height: 1.5;
  }

  @media (max-width: 480px) {
    font-size: 0.9rem;
    line-height: 1.4;
  }
`;

const ContactButton = styled.button`
  background: #f5b645;
  color: #000;
  border: none;
  border-radius: 71px;
  padding: 12px 30px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  align-self: flex-start;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(245, 182, 69, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    align-self: center;
    padding: 10px 25px;
    font-size: 0.95rem;
  }

  @media (max-width: 480px) {
    padding: 8px 20px;
    font-size: 0.9rem;
  }
`;

const RightContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  @media (max-width: 768px) {
    order: -1;
  }
`;

const TeamImage = styled(Image)`
  width: 100%;
  height: auto;
  border-radius: 16px;
  object-fit: cover;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    border-radius: 12px;
  }

  @media (max-width: 480px) {
    border-radius: 10px;
  }
`;

export default HelpSection;
