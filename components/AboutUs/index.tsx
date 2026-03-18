"use client";

import React from "react";
import { Button, Grid, Image } from "@mantine/core";
import styled from "styled-components";
import AnimatedCopy from "../AnimatedCopy";

const AboutUs: React.FC = () => {
  return (
    <AboutUsContainer>
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 2rem" }}>
        <Grid gutter="xl" align="center">
          {/* Left Section - Text Content */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <LeftSection>
              <AboutUsLabel>About Us</AboutUsLabel>

              <TagContainer>
                <ExperienceTag>Experience More</ExperienceTag>
                <MomentsTag>Moments Made</MomentsTag>
              </TagContainer>

              <AnimatedCopy>
                <MainTagline>
                  <Image
                    src="/images/tr3.png"
                    alt="Spark"
                    style={{
                      position: "absolute",
                      width: "35px",
                      height: "35px",
                      left: "-30px",
                      top: "-10px",
                    }}
                  />
                  We believe events inspire.{" "}
                  <ItalicKuepass>Kuepass</ItalicKuepass> helps you create, share,
                  and enjoy them effortlessly.
                </MainTagline>
              </AnimatedCopy>

              <LearnMoreButtonContainer>
                <LearnMoreButton>Learn More</LearnMoreButton>
                <Image
                  src="/images/curl.png"
                  alt="Spark"
                  style={{
                    position: "absolute",
                    width: "65px",
                    height: "65px",
                    left: "150px",
                    bottom: "-30px",
                  }}
                />
              </LearnMoreButtonContainer>
            </LeftSection>
          </Grid.Col>

          {/* Right Section - Image */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <RightSection>
              <ImageContainer>
                <Image
                  src="/images/gem.png"
                  alt="Kuepass Events Graphic"
                  style={{
                    width: "100%",
                    height: "auto",
                    maxHeight: "500px",
                    objectFit: "contain",
                  }}
                />
              </ImageContainer>
            </RightSection>
          </Grid.Col>
        </Grid>
      </div>
    </AboutUsContainer>
  );
};

export default AboutUs;

// Styled Components
const AboutUsContainer = styled.div`
  background-color: #ffffff;
  min-height: 80vh;
  /* padding: 80px 0; */
  display: flex;
  align-items: center;
`;

const LeftSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-right: 2rem;

  @media (max-width: 768px) {
    padding-right: 0;
    text-align: center;
  }
`;

const AboutUsLabel = styled.div`
  font-size: 20px;
  font-weight: 500;
  color: #606060;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const TagContainer = styled.div`
  display: flex;
  position: relative;
  width: fit-content;

  @media (max-width: 768px) {
    justify-content: center;
    margin: 0 auto;
  }
`;

const ExperienceTag = styled.div`
  background-color: #4fff40;
  color: #000000;
  padding: 6px 20px;
  border-radius: 5px;
  font-size: 14px;
  font-weight: 600;
  position: relative;

  white-space: nowrap;
`;

const MomentsTag = styled.div`
  background-color: #ffe240;
  color: #000000;
  padding: 6px 20px;
  border-radius: 5px;
  font-size: 14px;
  font-weight: 600;
  position: absolute;
  top: 22px;
  left: 130px;

  white-space: nowrap;
`;

const MainTagline = styled.h2`
  font-size: 40px;
  font-weight: 600;
  line-height: 1.4;
  color: #151515;
  margin: 0;
  max-width: 500px;
  position: relative;

  @media (max-width: 768px) {
    font-size: 28px;
    text-align: center;
    max-width: 100%;
  }
`;

const ItalicKuepass = styled.span`
  font-style: italic;
  font-weight: 300;
`;

const LearnMoreButtonContainer = styled.div`
  position: relative;
`;

const LearnMoreButton = styled.button`
  background-color: #f5b645;
  color: #000000;
  border: none;
  border-radius: 70px;
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
  align-self: flex-start;
  position: relative;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(255, 107, 53, 0.3);
  }

  @media (max-width: 768px) {
    align-self: center;
  }
`;

const SparkDoodle = styled.div`
  position: absolute;
  left: -50px;
  top: -5px;
  width: 30px;
  height: 30px;

  &::before {
    content: "";
    position: absolute;
    width: 4px;
    height: 20px;
    background: #000000;
    left: 13px;
    top: 5px;
    transform: rotate(0deg);
  }

  &::after {
    content: "";
    position: absolute;
    width: 4px;
    height: 15px;
    background: #000000;
    left: 8px;
    top: 0px;
    transform: rotate(-30deg);
  }

  /* Additional spark lines */
  background: linear-gradient(
    45deg,
    transparent 0%,
    transparent 40%,
    #000000 40%,
    #000000 60%,
    transparent 60%,
    transparent 100%
  );
  background-size: 8px 8px;
  animation: sparkle 2s ease-in-out infinite;

  @keyframes sparkle {
    0%,
    100% {
      transform: scale(1) rotate(0deg);
      opacity: 0.8;
    }
    50% {
      transform: scale(1.2) rotate(180deg);
      opacity: 1;
    }
  }
`;

const CurlyArrow = styled.div`
  position: absolute;
  right: -60px;
  bottom: -20px;
  width: 40px;
  height: 40px;

  &::before {
    content: "";
    position: absolute;
    width: 3px;
    height: 30px;
    background: #000000;
    border-radius: 2px;
    left: 20px;
    top: 5px;
    transform: rotate(45deg);
  }

  &::after {
    content: "";
    position: absolute;
    width: 3px;
    height: 25px;
    background: #000000;
    border-radius: 2px;
    left: 15px;
    top: 10px;
    transform: rotate(-45deg);
  }

  /* Curved line */
  background: radial-gradient(
    circle at 20px 20px,
    transparent 15px,
    #000000 15px,
    #000000 18px,
    transparent 18px
  );
  animation: curl 3s ease-in-out infinite;

  @keyframes curl {
    0%,
    100% {
      transform: rotate(0deg) scale(1);
    }
    50% {
      transform: rotate(15deg) scale(1.1);
    }
  }
`;

const RightSection = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 500px;
  position: relative;

  @media (max-width: 768px) {
    min-height: 400px;
  }
`;

const ImageContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 20px;
  overflow: hidden;
`;
