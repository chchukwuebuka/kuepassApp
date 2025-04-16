"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import styled, { keyframes } from "styled-components";
import { Button, Flex, Group, Image, Stack, Text } from "@mantine/core";
import NextImage from "next/image";

const HeroSection: React.FC = () => {
  // State to toggle between "Create" and "Discover"
  const [isCreate, setIsCreate] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  // Use useCallback to prevent unnecessary re-renders
  const toggleWord = useCallback(() => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsCreate((prev) => !prev);
      setIsAnimating(false);
    }, 500); // Half of the animation time for smooth transition
  }, []);

  useEffect(() => {
    const interval = setInterval(toggleWord, 3000); // Increased to 3 seconds for better readability
    return () => clearInterval(interval);
  }, [toggleWord]);

  return (
    <HeroContainer>
      <ContentWrapper>
        <TextSection>
          <HeroText>
            <AnimatedWord isCreate={isCreate} isAnimating={isAnimating}>
              {isCreate ? "Create" : "Discover"}
            </AnimatedWord>{" "}
            Your <br className="desktop-break" />
            Events With Ease
          </HeroText>

          <SubText>
            Welcome to your one-stop destination for everything event-related.
            Search for events and create your own all in one intuitive
            application.
          </SubText>

          <ButtonGroup>
            <Link href="/eventSchedule/exploreEvent" passHref>
              <PrimaryButton>Explore Events</PrimaryButton>
            </Link>
            <Link href="/eventSchedule/createEventForm" passHref>
              <SecondaryButton>Create Event</SecondaryButton>
            </Link>
          </ButtonGroup>

          <StatsContainer>
            <StatBox>
              <StatLabel>Hosted</StatLabel>
              <StatNumber>200+</StatNumber>
              <StatLabel>Events</StatLabel>
            </StatBox>
            <StatDivider />
            <StatBox>
              <StatLabel>Trusted By</StatLabel>
              <StatNumber>50+</StatNumber>
              <StatLabel>Brands</StatLabel>
            </StatBox>
          </StatsContainer>
        </TextSection>

        <ImageSection>
          <MainImageWrapper>
            <Image
              src="/images/club.jpg"
              alt="Featured event"
              style={{
                objectFit: "cover",
                borderRadius: "20px",
                width: "100%",
                height: "100%",
              }}
            />
          </MainImageWrapper>
          <SecondaryImageWrapper>
            <Image
              src="/images/happyImage.png"
              alt="People enjoying an event"
              style={{
                objectFit: "cover",
                borderRadius: "20px 20px 0 0",
                width: "100%",
                height: "100%",
              }}
            />
          </SecondaryImageWrapper>
        </ImageSection>
      </ContentWrapper>
    </HeroContainer>
  );
};

export default HeroSection;

// Keyframes
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideInFromTop = keyframes`
  0% {
    transform: translateY(-100%);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
`;

// Styled Components with improved design
const HeroContainer = styled.section`
  padding: 2rem 1rem;
  width: 100%;
  overflow: hidden;
  max-width: 1440px;
  margin: 0 auto;

  @media (min-width: 768px) {
    padding: 3rem 2rem;
  }

  @media (min-width: 1024px) {
    padding: 4rem 2rem;
  }
`;

const ContentWrapper = styled(Flex)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  width: 100%;

  @media (min-width: 1024px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    text-align: left;
  }
`;

const TextSection = styled.div`
  width: 100%;
  animation: ${fadeInUp} 0.8s ease-out;
  text-align: center;

  @media (min-width: 1024px) {
    flex: 1;
    text-align: left;
  }
`;

const HeroText = styled(Text)`
  font-size: 2rem;
  font-weight: 800;
  color: #1a1a2e;
  line-height: 1.2;
  margin-bottom: 1.5rem;

  .desktop-break {
    display: none;
  }

  @media (min-width: 640px) {
    font-size: 2.5rem;
  }

  @media (min-width: 768px) {
    font-size: 3rem;
  }

  @media (min-width: 1024px) {
    font-size: 3.5rem;
    line-height: 1.1;

    .desktop-break {
      display: inline;
    }
  }
`;

const HighlightedSpan = styled.span`
  color: #7465ce;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    bottom: 4px;
    left: 0;
    width: 100%;
    height: 6px;
    background-color: rgba(116, 101, 206, 0.2);
    z-index: -1;

    @media (min-width: 768px) {
      bottom: 6px;
      height: 8px;
    }
  }
`;

const SubText = styled(Text)`
  font-size: 1rem;
  font-weight: 400;
  color: #4a4a68;
  margin-bottom: 2rem;
  line-height: 1.6;
  max-width: 100%;

  @media (min-width: 640px) {
    font-size: 1.125rem;
    margin-bottom: 2.25rem;
  }

  @media (min-width: 1024px) {
    font-size: 1.25rem;
    max-width: 36rem;
    margin-bottom: 2.5rem;
  }
`;

const ButtonGroup = styled(Group)`
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  @media (min-width: 640px) {
    flex-direction: row;
    justify-content: center;
  }

  @media (min-width: 1024px) {
    margin-bottom: 3rem;
    justify-content: flex-start;
  }
`;

const PrimaryButton = styled(Button)`
  height: 3rem;
  background-color: #025a3a;
  color: white;
  width: 100%;
  max-width: 12rem;
  padding: 0 1.5rem;
  border-radius: 46px;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 14px rgba(2, 90, 58, 0.2);

  @media (min-width: 640px) {
    height: 3.25rem;
    font-size: 1rem;
  }

  &:hover {
    background-color: #013e28;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(2, 90, 58, 0.25);
  }

  &:active {
    transform: translateY(0);
  }
`;

const SecondaryButton = styled(Button)`
  height: 3rem;
  background-color: transparent;
  color: #025a3a;
  width: 100%;
  max-width: 12rem;
  padding: 0 1.5rem;
  border-radius: 46px;
  border: 2px solid #025a3a;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  @media (min-width: 640px) {
    height: 3.25rem;
    font-size: 1rem;
  }

  &:hover {
    background-color: transparent;
    transform: translateY(-2px);
    color: #025a3a;
  }

  &:active {
    transform: translateY(0);
  }
`;

const StatsContainer = styled(Flex)`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-items: center;

  @media (min-width: 480px) {
    flex-direction: row;
    justify-content: center;
    gap: 3rem;
  }

  @media (min-width: 1024px) {
    justify-content: flex-start;
  }
`;

const StatBox = styled(Stack)`
  text-align: center;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const StatLabel = styled(Text)`
  font-size: 0.875rem;
  font-weight: 500;
  color: #4a4a68;
  text-transform: uppercase;
  letter-spacing: 1px;

  @media (min-width: 640px) {
    font-size: 1rem;
  }
`;

const StatNumber = styled(Text)`
  font-size: 2.5rem;
  font-weight: 800;
  color: #7465ce;
  line-height: 1;
  margin: 0.5rem 0;

  @media (min-width: 640px) {
    font-size: 3rem;
  }
`;

const StatDivider = styled.div`
  height: 2px;
  width: 100px;
  background-color: rgba(74, 74, 104, 0.2);

  @media (min-width: 480px) {
    height: 60px;
    width: 2px;
  }
`;

const ImageSection = styled.div`
  position: relative;
  width: 100%;
  height: 350px;
  margin-top: 1rem;

  @media (min-width: 640px) {
    height: 400px;
  }

  @media (min-width: 1024px) {
    flex: 1;
    height: 500px;
    margin-top: 0;
  }
`;

const MainImageWrapper = styled.div`
  position: absolute;
  width: 100%;
  max-width: 400px;
  height: 220px;
  border-radius: 150px 0 0 150px;
  right: -28px;
  z-index: 1;
  overflow: hidden;
  transition: transform 0.5s ease;

  &:hover {
    transform: scale(1.02);
  }

  @media (min-width: 480px) {
    max-width: 350px;
    height: 280px;
  }

  @media (min-width: 640px) {
    max-width: 400px;
    height: 320px;
  }

  @media (min-width: 1024px) {
    max-width: 32rem;
    height: 25rem;
  }
`;

const SecondaryImageWrapper = styled.div`
  position: absolute;
  bottom: 0px;
  left: 0;
  width: 160px;
  height: 180px;
  border-radius: 20px 20px 0 0;
  z-index: 2;
  transition: transform 0.5s ease;
  overflow: hidden;

  &:hover {
    transform: scale(1.05) rotate(2deg);
  }

  @media (min-width: 480px) {
    width: 200px;
    height: 220px;
  }

  @media (min-width: 640px) {
    width: 220px;
    height: 240px;
  }

  @media (min-width: 768px) {
    width: 240px;
    height: 260px;
  }

  @media (min-width: 1024px) {
    width: 300px;
    height: 340px;
    left: auto;
    right: 320px;
  }
`;

interface AnimatedWordProps {
  isCreate: boolean;
  isAnimating: boolean;
}

const AnimatedWord = styled.span<AnimatedWordProps>`
  display: inline-block;
  animation: ${slideInFromTop} 1s ease-out;
  color: ${({ isCreate }) => (isCreate ? "#FFD700" : "#025a3a")};
  opacity: ${({ isAnimating }) => (isAnimating ? 0.5 : 1)};
  transition: color 0.3s ease, opacity 0.3s ease;
  font-weight: 900;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    bottom: 4px;
    left: 0;
    width: 100%;
    height: 6px;
    background-color: ${({ isCreate }) =>
      isCreate ? "rgba(255, 215, 0, 0.3)" : "rgba(2, 90, 58, 0.2)"};
    z-index: -1;
    transition: background-color 0.3s ease;

    @media (min-width: 768px) {
      bottom: 8px;
      height: 8px;
    }
  }
`;
