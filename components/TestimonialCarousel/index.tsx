"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Container } from "@mantine/core";

const TestimonialCarousel: React.FC = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const testimonials = [
    {
      id: 1,
      quote:
        "Honestly, Kuepass is a game-changer. I used to spend days managing ticket sales on a spreadsheet. Now, I can track everything in real-time from my phone. It gives me the freedom to actually focus on making the event great.",
      author: "Oracle Triple E.",
      title: "Music Promoter & Artist Manager",
      avatar: "/images/oracle.jpg",
    },
    {
      id: 2,
      quote:
        "The platform has revolutionized how we manage our events. The real-time tracking and seamless user experience make event management effortless.",
      author: "Adewale M.",
      title: "Event Coordinator",
      avatar: "/images/testiman.png",
    },
    {
      id: 3,
      quote:
        "Kuepass has transformed our event planning process. The intuitive interface and powerful features help us deliver exceptional experiences.",
      author: "Michael K.",
      title: "Festival Director",
      avatar: "/images/testiwoman.png",
    },
    {
      id: 4,
      quote:
        "This platform has made event management so much easier. The analytics and real-time updates give us complete control over our events.",
      author: "Chika Okolo.",
      title: "Concert Manager",
      avatar: "/images/members1.jpg",
    },
  ];

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prevIndex) =>
        prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000); // 3 seconds

    return () => clearInterval(interval);
  }, []);

  const currentTestimonial = testimonials[activeTestimonial];

  return (
    <SectionWrapper>
      <Container size="lg" px="md">
        <HeaderSection>
          <HeaderText>
            Hear it from our <HighlightText>members</HighlightText>
          </HeaderText>
        </HeaderSection>

        <PaginationDots>
          {testimonials.map((_, index) => (
            <Dot
              key={index}
              $active={index === activeTestimonial}
              onClick={() => setActiveTestimonial(index)}
            />
          ))}
        </PaginationDots>

        <TestimonialContent>
          <QuoteText>"{currentTestimonial.quote}"</QuoteText>

          <AuthorSection>
            <AvatarContainer>
              <Picture>
                {(currentTestimonial.avatar.includes("testiman") ||
                  currentTestimonial.avatar.includes("testiwoman")) && (
                  <source
                    srcSet={currentTestimonial.avatar.replace(".png", ".webp")}
                    type="image/webp"
                  />
                )}
                <Avatar
                  src={currentTestimonial.avatar}
                  alt={currentTestimonial.author}
                />
              </Picture>
            </AvatarContainer>
            <AuthorInfo>
              <AuthorName>{currentTestimonial.author}</AuthorName>
              <AuthorTitle>{currentTestimonial.title}</AuthorTitle>
            </AuthorInfo>
          </AuthorSection>
        </TestimonialContent>
      </Container>
    </SectionWrapper>
  );
};

// Styled Components
const SectionWrapper = styled.section`
  background-color: #f9f9f9;
  padding: 4rem 0;
  font-family: "DM Sans", sans-serif;

  @media (max-width: 768px) {
    padding: 3rem 0;
  }

  @media (max-width: 480px) {
    padding: 2rem 0;
  }
`;

const HeaderSection = styled.div`
  margin-bottom: 2rem;
`;

const HeaderText = styled.h2`
  font-size: 2rem;
  font-weight: 500;
  color: #000000;
  margin: 0;
  text-align: left;

  @media (max-width: 768px) {
    font-size: 1.75rem;
    text-align: center;
  }

  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`;

const HighlightText = styled.span`
  background-color: #dcff40;
  padding: 0 0.25rem;
  border-radius: 2px;
`;

const PaginationDots = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
`;

const Dot = styled.button<{ $active: boolean }>`
  width: 12px;
  height: 12px;
  border: none;
  border-radius: 2px;
  background-color: ${(props) => (props.$active ? "#FFA500" : "#CCCCCC")};
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${(props) => (props.$active ? "#FFA500" : "#999999")};
  }
`;

const TestimonialContent = styled.div`
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
`;

const QuoteText = styled.blockquote`
  font-size: 20px;
  font-weight: 500;
  color: #000000;
  line-height: 1.6;
  font-style: italic;
  margin: 0 0 2rem 0;
  padding: 0;

  @media (max-width: 768px) {
    font-size: 1.125rem;
    margin-bottom: 1.5rem;
  }

  @media (max-width: 480px) {
    font-size: 1rem;
    margin-bottom: 1.25rem;
  }
`;

const AuthorSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.75rem;
  }
`;

const AvatarContainer = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #cccccc;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  @media (max-width: 480px) {
    width: 50px;
    height: 50px;
  }
`;

const Picture = styled.picture`
  width: 100%;
  height: 100%;
  display: block;
`;

const Avatar = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
`;

const AuthorInfo = styled.div`
  text-align: left;

  @media (max-width: 480px) {
    text-align: center;
  }
`;

const AuthorName = styled.h4`
  font-size: 1.125rem;
  font-weight: 600;
  color: #333333;
  margin: 0 0 0.25rem 0;

  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

const AuthorTitle = styled.p`
  font-size: 0.95rem;
  font-weight: 400;
  color: #666666;
  margin: 0;

  @media (max-width: 480px) {
    font-size: 0.875rem;
  }
`;

export default TestimonialCarousel;
