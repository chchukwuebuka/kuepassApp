"use client";
import React from "react";
import styled from "styled-components";
import { Container, Text } from "@mantine/core";
import Image from "next/image";

const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      id: 1,
      name: "Champion Taylor",
      username: "@champ_tay",
      quote:
        "This platform is the future. Artists finally getting 100% of their earnings 🙌",
      avatar: "/images/testimonial1.jpg", // You'll need to add these images
    },
    {
      id: 2,
      name: "Victor Morgan",
      username: "@morganspeed",
      quote:
        "Just minted my first track here 🔥 love how smooth the process was!",
      avatar: "/images/testimonial2.jpg",
    },
    {
      id: 3,
      name: "Conqueror Ashley",
      username: "@ashley_win",
      quote:
        "Uploading here was easier than I thought. Big W for independent musicians.",
      avatar: "/images/testimonial3.jpg",
    },
  ];

  return (
    <SectionWrapper>
      <Container size="xl" px="md">
        <SectionHeader>What people say</SectionHeader>

        <TestimonialsGrid>
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id}>
              <AvatarContainer>
                <Avatar
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  width={60}
                  height={60}
                />
              </AvatarContainer>

              <UserInfo>
                <UserName>{testimonial.name}</UserName>
                <UserHandle>{testimonial.username}</UserHandle>
              </UserInfo>

              <Quote>"{testimonial.quote}"</Quote>
            </TestimonialCard>
          ))}
        </TestimonialsGrid>
      </Container>
    </SectionWrapper>
  );
};

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
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
  }

  @media (max-width: 480px) {
    padding: 1.2rem;
  }
`;

const AvatarContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 0.5rem;
`;

const Avatar = styled(Image)`
  border-radius: 50%;
  object-fit: cover;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
`;

const UserName = styled(Text)`
  font-size: 1.1rem;
  font-weight: 600;
  color: #151515;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  @media (max-width: 768px) {
    font-size: 1rem;
  }

  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const UserHandle = styled(Text)`
  font-size: 0.9rem;
  font-weight: 400;
  color: #666;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  @media (max-width: 768px) {
    font-size: 0.85rem;
  }

  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

const Quote = styled(Text)`
  font-size: 1rem;
  font-weight: 400;
  color: #151515;
  line-height: 1.5;
  text-align: center;
  font-style: italic;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  @media (max-width: 768px) {
    font-size: 0.95rem;
    line-height: 1.4;
  }

  @media (max-width: 480px) {
    font-size: 0.85rem;
    line-height: 1.3;
  }
`;

export default TestimonialsSection;
