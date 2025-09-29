"use client";

import React from "react";
import styled from "styled-components";
import { Container } from "@mantine/core";
import Image from "next/image";

const ConnectSection: React.FC = () => {
  return (
    <SectionWrapper>
      <Container size="lg" px="md">
        <ImageContainer>
          <EventImage
            src="/images/Box.png"
            alt="Wedding event"
            width={800}
            height={500}
          />
        </ImageContainer>

        <ContentSection>
          <Title>Let&apos;s connect and create your next <br /> great event.</Title>

          <Description>
            Kuepass provides powerful, flexible event management solutions to
            help you host unforgettable experiences. Whether you have a question
            about our features or need support for your next launch, our team is
            here to help you achieve seamless success.
          </Description>

          <FormSection>
            <EmailInput placeholder="Enter your email address" />
            <LearnMoreButton>Learn More</LearnMoreButton>
          </FormSection>
        </ContentSection>
      </Container>
    </SectionWrapper>
  );
};

// Styled Components
const SectionWrapper = styled.section`
  background-color: transparent;
  padding: 4rem 0;
  margin-top: 50px;

  @media (max-width: 768px) {
    padding: 3rem 0;
  }

  @media (max-width: 480px) {
    padding: 2rem 0;
  }
`;

const ImageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    margin-bottom: 2rem;
  }

  @media (max-width: 480px) {
    margin-bottom: 1.5rem;
  }
`;

const EventImage = styled(Image)`
  max-width: 800px;
  width: 100%;
  height: auto;
  border-radius: 12px;
  object-fit: contain;

  @media (max-width: 768px) {
    max-width: 450px;
  }

  @media (max-width: 480px) {
    max-width: 350px;
  }
`;

const ContentSection = styled.div`
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h2`
  font-size: 35px;
  font-weight: 600;
  color: #000000;
  margin: 0 0 2rem 0;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 1.5rem;
  }

  @media (max-width: 480px) {
    font-size: 1.75rem;
    margin-bottom: 1.25rem;
  }
`;

const Description = styled.p`
  font-size: 20px;
  font-weight: 400;
  color: #666666;
  margin: 0 0 2.5rem 0;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 16px;
    margin-bottom: 2rem;
  }

  @media (max-width: 480px) {
    font-size: 14px;
    margin-bottom: 1.5rem;
  }
`;

const FormSection = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  max-width: 500px;
  margin: 0 auto;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.75rem;
  }
`;

const EmailInput = styled.input`
  flex: 1;
  padding: 1rem 1.5rem;
  border: 2px solid #e5e5e5;
  border-radius: 50px;
  font-size: 1rem;
  font-family: "DM Sans", sans-serif;
  background-color: white;
  color: #333333;
  outline: none;
  transition: border-color 0.2s ease;

  &::placeholder {
    color: #999999;
  }

  &:focus {
    border-color: #ff8c00;
  }

  @media (max-width: 480px) {
    width: 100%;
    padding: 0.875rem 1.25rem;
  }
`;

const LearnMoreButton = styled.button`
  background-color: #f5b645;
  color: #151515;
  border: none;
  border-radius: 52px;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  font-family: "DM Sans", sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background-color: #e67e00;
    transform: translateY(-1px);
  }

  @media (max-width: 480px) {
    width: 100%;
    padding: 0.875rem 1.5rem;
  }
`;

export default ConnectSection;
