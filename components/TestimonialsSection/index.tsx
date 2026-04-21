"use client";
import React, { useRef, useState, useEffect } from "react";
import styled from "styled-components";
import { Container, Text } from "@mantine/core";
import { motion } from "framer-motion";

// SVG Icons
const PlayIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
  </svg>
);

const PauseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="5" width="4" height="14" fill="currentColor"/>
    <rect x="14" y="5" width="4" height="14" fill="currentColor"/>
  </svg>
);

// Styled Components
const SectionWrapper = styled.section`
  background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);
  padding: 6rem 0;
  position: relative;
  overflow: hidden;

  /* Subtle background blobs for the airy feel */
  &::before {
    content: '';
    position: absolute;
    top: -50%; left: -10%;
    width: 60%; height: 100%;
    background: radial-gradient(circle, rgba(16, 185, 129, 0.03) 0%, rgba(255,255,255,0) 70%);
    filter: blur(60px);
    z-index: 0;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -50%; right: -10%;
    width: 60%; height: 100%;
    background: radial-gradient(circle, rgba(245, 182, 69, 0.05) 0%, rgba(255,255,255,0) 70%);
    filter: blur(60px);
    z-index: 0;
  }

  @media (max-width: 768px) {
    padding: 4rem 0;
  }
`;

const ContentContainer = styled.div`
  position: relative;
  z-index: 2;
`;

const SectionHeader = styled(Text)`
  font-size: 2.75rem;
  font-weight: 700;
  color: #111827;
  text-align: center;
  margin-bottom: 3.5rem;
  letter-spacing: -0.02em;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  span {
    color: #10b981;
    font-style: italic;
    font-weight: 400;
  }

  @media (max-width: 768px) {
    font-size: 2.25rem;
    margin-bottom: 2.5rem;
  }
`;

const TestimonialsGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2.5rem;

  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const CardWrapper = styled(motion.div)`
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  padding: 12px;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.05), inset 0 2px 5px rgba(255,255,255,0.8);
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px -15px rgba(16, 185, 129, 0.15), inset 0 2px 5px rgba(255,255,255,1);
  }
`;

const VideoContainer = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 9/12;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  background: #e2e8f0;
  box-shadow: inset 0 0 15px rgba(0,0,0,0.1);

  &::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    pointer-events: none;
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.2);
    border-radius: 16px;
  }
`;

const VideoElement = styled.video<{ $isPlaying: boolean }>`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 35%;
  display: block;
  transition: transform 0.6s ease;

  ${VideoContainer}:hover & {
    transform: ${(props) => (props.$isPlaying ? "scale(1)" : "scale(1.05)")};
  }
`;

const PlayGradientOverlay = styled.div<{ $isPlaying: boolean }>`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%);
  opacity: ${(props) => (props.$isPlaying ? 0 : 1)};
  transition: opacity 0.4s ease;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PlayPauseButton = styled.div<{ $isPlaying: boolean }>`
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.3s ease;
  opacity: ${(props) => (props.$isPlaying ? 0 : 1)};
  transform: ${(props) => (props.$isPlaying ? "scale(0.8)" : "scale(1)")};

  ${VideoContainer}:hover & {
    opacity: 1;
    transform: scale(1.1);
    background: rgba(255, 255, 255, 0.4);
  }
`;

const TestimonialContent = styled.div`
  padding: 0;
`;

const QuoteText = styled.p`
  font-size: 1.05rem;
  color: #374151;
  line-height: 1.5;
  margin: 0 0 1rem 0;
  font-weight: 500;
  font-style: italic;
`;

const AuthorBlock = styled.div`
  display: flex;
  flex-direction: column;
`;

const AuthorName = styled.h4`
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.1rem 0;
`;

const AuthorHandle = styled.span`
  font-size: 0.85rem;
  color: #6b7280;
  font-weight: 500;
`;

// Video Card Component to manage individual state
const TestimonialVideoCard = ({ data }: { data: any }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(e => console.error("Playback failed", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Ensure UI resets if video ends
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleEnded = () => setIsPlaying(false);
    const handlePause = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);

    videoElement.addEventListener('ended', handleEnded);
    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('play', handlePlay);

    return () => {
      videoElement.removeEventListener('ended', handleEnded);
      videoElement.removeEventListener('pause', handlePause);
      videoElement.removeEventListener('play', handlePlay);
    };
  }, []);

  // Framer Motion Item Variant
  const itemVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <CardWrapper variants={itemVariant}>
      <VideoContainer onClick={togglePlay}>
        <VideoElement
          ref={videoRef}
          src={data.video}
          playsInline
          loop
          muted={false}
          $isPlaying={isPlaying}
        />
        <PlayGradientOverlay $isPlaying={isPlaying}>
          <PlayPauseButton $isPlaying={isPlaying}>
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </PlayPauseButton>
        </PlayGradientOverlay>
      </VideoContainer>
      <TestimonialContent>
        <QuoteText>{data.quote}</QuoteText>
        <AuthorBlock>
          <AuthorName>{data.name}</AuthorName>
          <AuthorHandle>{data.username}</AuthorHandle>
        </AuthorBlock>
      </TestimonialContent>
    </CardWrapper>
  );
};


const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      id: 1,
      name: "Dr Yare Oluwatonyi",
      username: "@champ_tay",
      video: "/videos/testiVideo.MOV",
    },
    {
      id: 2,
      name: "Ezinne Bernard",
      username: "@morganspeed",
      video: "/videos/testiVideo1.MOV",
    },
    {
      id: 3,
      name: "Dr Chima Odimgbemi",
      username: "@ashley_win",
      video: "/videos/testiVideo2.MOV",
    },
  ];

  // Framer Motion Container Variant
  const containerVariant = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <SectionWrapper>
      <Container size="xl" px="md">
        <ContentContainer>
          <SectionHeader>
            Don't just take our <span>word</span> for it
          </SectionHeader>

          <TestimonialsGrid
            variants={containerVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {testimonials.map((testimonial) => (
              <TestimonialVideoCard key={testimonial.id} data={testimonial} />
            ))}
          </TestimonialsGrid>
        </ContentContainer>
      </Container>
    </SectionWrapper>
  );
};

export default TestimonialsSection;
