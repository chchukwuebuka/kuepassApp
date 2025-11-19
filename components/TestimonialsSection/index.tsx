"use client";
import React from "react";
import styled from "styled-components";
import { Container, Text } from "@mantine/core";

// Styled Components
const SectionWrapper = styled.section`
  background-color: #f8f8f8;
  padding: 4rem 0;

  @media (max-width: 768px) {
    padding: 2rem 0;
  }

  @media (max-width: 480px) {
    padding: 1.5rem 0;
  }
`;

const SectionHeader = styled(Text)`
  font-size: 2.5rem;
  font-weight: 500;
  color: #151515;
  text-align: left;
  margin-bottom: 3rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 2rem;
  }

  @media (max-width: 480px) {
    font-size: 1.6rem;
    margin-bottom: 1.5rem;
  }
`;

const TestimonialsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  @media (max-width: 480px) {
    gap: 1rem;
  }
`;

const TestimonialCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
  aspect-ratio: 1;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
`;

const VideoAvatar = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 35%;
  display: block;

  /* Style the native video controls */
  &::-webkit-media-controls-panel {
    background-color: rgba(0, 0, 0, 0.5);
  }

  &::-webkit-media-controls-play-button {
    color: white;
  }

  &::-webkit-media-controls-volume-slider {
    background-color: white;
  }
`;

const NameOverlay = styled(Text)`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem 1.5rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0));
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  text-align: center;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  margin: 0;

  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
    font-size: 1rem;
  }

  @media (max-width: 480px) {
    padding: 0.5rem 0.75rem;
    font-size: 0.9rem;
  }
`;

const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      id: 1,
      name: "Dr Yare Oluwatonyi",
      username: "@champ_tay",
      quote:
        "This platform is the future. Artists finally getting 100% of their earnings 🙌",
      video: "/videos/testiVideo.MOV", // Video file path
    },
    {
      id: 2,
      name: "Ezinne Bennerd",
      username: "@morganspeed",
      quote:
        "Just minted my first track here 🔥 love how smooth the process was!",
      video: "/videos/testiVideo1.MOV",
    },
    {
      id: 3,
      name: "Dr Chima Odimgbemi",
      username: "@ashley_win",
      quote:
        "Uploading here was easier than I thought. Big W for independent musicians.",
      video: "/videos/testiVideo2.MOV",
    },
  ];

  return (
    <SectionWrapper>
      <Container size="xl" px="md">
        <SectionHeader>What people say</SectionHeader>

        <TestimonialsGrid>
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id}>
              <VideoAvatar
                src={testimonial.video}
                autoPlay
                loop
                muted
                playsInline
                controls
              />
              <NameOverlay>{testimonial.name}</NameOverlay>
            </TestimonialCard>
          ))}
        </TestimonialsGrid>
      </Container>
    </SectionWrapper>
  );
};

export default TestimonialsSection;
