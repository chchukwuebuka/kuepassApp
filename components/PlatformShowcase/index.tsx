"use client";

import React from "react";
import { Button, Container, Grid, Image, Text, Title } from "@mantine/core";
import Link from "next/link";
import styled from "styled-components";
import EventTypes from "../EventTypes";
import AboutUs from "../AboutUs";
import AnimatedCopy from "../AnimatedCopy";

const PlatformShowcase: React.FC = () => {
  return (
    <ShowcaseContainer>
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 2rem" }}>
        <HeroSection>
          <HeroContent>
            <HeroText>
              <MainHeading>
                Discover. Host. Manage Events. All in one place.
              </MainHeading>
              <AnimatedCopy>
                <Subtitle>
                  Whether you are attending or hosting, Kuepass makes the entire
                  journey simple, secure and stress free
                </Subtitle>
              </AnimatedCopy>
            </HeroText>
            <CTAButton>
              <Link href="/dashboard?mode=createEvent">
                <HostButton>Host an Event</HostButton>
              </Link>
            </CTAButton>
          </HeroContent>
        </HeroSection>

        <FeatureCardsSection>
          <Grid gutter="xl" justify="center">
            <Grid.Col span={{ base: 12, md: 3 }}>
              <FeatureCard>
                <CardImage>
                  <Image
                    src="/images/plat.png"
                    alt="People at event"
                    style={{
                      width: "35%",
                      height: "35%",
                      objectFit: "cover",
                    }}
                  />
                </CardImage>
                <CardContent>
                  <CardTitle>Discover Events</CardTitle>
                  <AnimatedCopy>
                    <CardDescription>
                      Browse upcoming concerts, conferences, and local gatherings.
                      Filter by category, date, or location to find experiences
                      made for you.
                    </CardDescription>
                  </AnimatedCopy>
                </CardContent>
              </FeatureCard>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 3 }}>
              <FeatureCard >
                <CardImage>
                  <Image
                    src="/images/plat1.png"
                    alt="Person typing on laptop"
                    style={{
                      width: "35%",
                      height: "35%",
                      objectFit: "cover",
                    }}
                  />
                </CardImage>
                <CardContent>
                  <CardTitle>Host Events & sell ticket</CardTitle>
                  <AnimatedCopy>
                    <CardDescription>
                      Build your audience and keep your ticket sales organized in
                      one dashboard. Secure payments, simple setup and stress free
                      ticketing.
                    </CardDescription>
                  </AnimatedCopy>
                </CardContent>
              </FeatureCard>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 3 }}>
              <FeatureCard>
                <CardImage>
                  <Image
                    src="/images/plat2.png"
                    alt="People collaborating"
                    style={{
                      width: "35%",
                      height: "35%",
                      objectFit: "cover",
                    }}
                  />
                </CardImage>
                <CardContent>
                  <CardTitle>Manage Every Detail</CardTitle>
                  <AnimatedCopy>
                    <CardDescription>
                      Track sales, budgets, and guests in one smart dashboard no
                      spreadsheets required.
                    </CardDescription>
                  </AnimatedCopy>
                </CardContent>
              </FeatureCard>
            </Grid.Col>
          </Grid>
        </FeatureCardsSection>
      </div>
      <EventTypes />
      <AboutUs />
    </ShowcaseContainer>
  );
};

export default PlatformShowcase;

// Styled Components
const ShowcaseContainer = styled.div`
  background-color: #ffffff;
  min-height: 100vh;
  padding: 80px 0;

  @media (max-width: 768px) {
    padding: 40px 0;
  }
`;

const HeroSection = styled.div`
  margin-bottom: 80px;

  @media (max-width: 768px) {
    margin-bottom: 40px;
  }
`;

const HeroContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 40px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 24px;
  }
`;

const HeroText = styled.div`
  flex: 1;
  max-width: 600px;
`;

const MainHeading = styled.h1`
  font-size: 40px;
  font-weight: 600;
  line-height: 1.2;
  color: #151515;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    font-size: 32px;
    margin-bottom: 16px;
  }
`;

const Subtitle = styled.p`
  font-size: 24px;
  font-weight: 500;
  line-height: 1.6;
  color: #151515;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const CTAButton = styled.div`
  flex-shrink: 0;
`;

const HostButton = styled(Button)`
  background-color: #f5b645;
  color: #000000;
  border: none;
  border-radius: 30px;
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 600;
  height: auto;
  transition: all 0.3s ease;

  &:hover {
    background-color: #d97706;
    transform: translateY(-2px);
  }
`;

const FeatureCardsSection = styled.div``;

const FeatureCard = styled.div<{ $highlighted?: boolean }>`
  background-color: ${(props) => (props.$highlighted ? "#e8f5e8" : "#f8f9fa")};
  border-radius: 16px;
  overflow: hidden;
  height: 100%;
  border: ${(props) => (props.$highlighted ? "1px solid #000000" : "none")};
  transition: transform 0.3s ease, box-shadow 0.3s ease,
    background-color 0.3s ease;
  width: 100%;
  max-width: 309px;
  border-radius: 20px;
  margin: 0 auto;

  &:hover {
    transform: translateY(-4px) scale(1.05);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    background-color: #dcff40;
    border: 1px solid #000000;
  }
`;

const CardImage = styled.div`
  width: 100%;
  padding: 20px;
  overflow: hidden;
`;

const CardContent = styled.div`
  padding: 24px;
`;

const CardTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #000000;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    font-size: 18px;
    margin-bottom: 12px;
  }
`;

const CardDescription = styled.p`
  font-size: 16px;
  font-weight: 400;
  line-height: 1.6;
  color: #000000;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 15px;
    line-height: 1.5;
  }
`;
