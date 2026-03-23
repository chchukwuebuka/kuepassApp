"use client";
import React, { useState } from "react";
import styled from "styled-components";
import { Container, Text } from "@mantine/core";
import AnimatedCopy from "../AnimatedCopy";

const FAQSection: React.FC = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const faqItems = [
    {
      id: 1,
      question: "How do I buy a ticket for an event on Kuepass?",
      answer:
        "To buy a ticket, simply browse our events page, select the event you want to attend, and click 'Buy Ticket'. You can pay securely through our integrated payment system and receive your ticket via email and QR code.",
    },
    {
      id: 2,
      question: "Can I host my own event on Kuepass?",
      answer:
        "Yes! Kuepass allows you to create and host your own events. Simply create an organizer account, use our event creation tools to set up your event details, and start selling tickets to your audience.",
    },
    {
      id: 3,
      question: "How does ticket scanning and access control work at events",
      answer:
        "Our QR code system allows for seamless entry at events. Event organizers can scan attendee QR codes using our mobile app or scanning devices to verify tickets and manage access control in real-time.",
    },
    {
      id: 4,
      question: "What happens if I lose my ticket or QR code?",
      answer:
        "Don't worry! You can access your tickets anytime through your Kuepass account. Simply log in and view your ticket details, or contact our support team who can help you retrieve your ticket information.",
    },
    {
      id: 5,
      question: "Does Kuepass help with event planning and logistics?",
      answer:
        "Yes! Kuepass provides comprehensive event management tools including attendee management, real-time analytics, check-in systems, and customer support to help make your event a success.",
    },
  ];

  const toggleItem = (id: number) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <SectionWrapper>
      <Container size="xl" px="md">
        <Header>
          <AnimatedCopy>
            <Title>Frequently Asked Questions</Title>
          </AnimatedCopy>
          <AnimatedCopy>
            <Subtitle>Answers to commonly asked questions</Subtitle>
          </AnimatedCopy>
        </Header>

        <FAQList>
          {faqItems.map((item, index) => (
            <React.Fragment key={item.id}>
              <FAQItem onClick={() => toggleItem(item.id)}>
                <QuestionText>{item.question}</QuestionText>
                <PlusIcon $isOpen={openItems.includes(item.id)}>+</PlusIcon>
              </FAQItem>

              {openItems.includes(item.id) && (
                <AnswerItem>
                  <AnswerText>{item.answer}</AnswerText>
                </AnswerItem>
              )}

              {index < faqItems.length - 1 && <Separator />}
            </React.Fragment>
          ))}
        </FAQList>
      </Container>
    </SectionWrapper>
  );
};

// Styled Components
const SectionWrapper = styled.section`
  background-color: #f8f8f8;
  padding: 4rem 10rem;

  @media (max-width: 768px) {
    padding: 2rem 0;
  }

  @media (max-width: 480px) {
    padding: 1.5rem 0;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    margin-bottom: 2rem;
  }

  @media (max-width: 480px) {
    margin-bottom: 1.5rem;
  }
`;

const Title = styled(Text)`
  font-size: 2.5rem;
  font-weight: 500;
  color: #000000;
  margin: 0 0 0.5rem 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  @media (max-width: 768px) {
    font-size: 2.2rem;
  }

  @media (max-width: 480px) {
    font-size: 1.8rem;
  }
`;

const Subtitle = styled(Text)`
  font-size: 1.2rem;
  font-weight: 400;
  color: #151515;
  font-style: italic;
  margin: 0;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 1rem;
  }

  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const FAQList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const FAQItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 0;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.02);
  }

  @media (max-width: 768px) {
    padding: 1.2rem 0;
  }

  @media (max-width: 480px) {
    padding: 1rem 0;
  }
`;

const QuestionText = styled(Text)`
  font-size: 1.1rem;
  font-weight: 500;
  color: #151515;
  margin: 0;
  flex: 1;
  line-height: 1.4;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  @media (max-width: 768px) {
    font-size: 1rem;
  }

  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const PlusIcon = styled.div<{ $isOpen: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: transparent;
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 500;
  transition: transform 0.2s ease;
  transform: ${(props) => (props.$isOpen ? "rotate(45deg)" : "rotate(0deg)")};
  flex-shrink: 0;

  @media (max-width: 480px) {
    width: 20px;
    height: 20px;
    font-size: 16px;
  }
`;

const AnswerItem = styled.div`
  padding: 0 0 1.5rem 0;
  animation: fadeIn 0.3s ease-in-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 768px) {
    padding: 0 0 1.2rem 0;
  }

  @media (max-width: 480px) {
    padding: 0 0 1rem 0;
  }
`;

const AnswerText = styled(Text)`
  font-size: 1rem;
  font-weight: 400;
  color: #666;
  line-height: 1.6;
  margin: 0;
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

const Separator = styled.div`
  height: 1px;
  background-color: #e0e0e0;
  width: 100%;
`;

export default FAQSection;
