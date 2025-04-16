"use client";
import React, { useEffect, useRef, useState } from "react";
import { Button, Flex, Image, Stack, Text, Container } from "@mantine/core";
import styles from "./styles.module.css";
import Link from "next/link";
import { FaCircle } from "react-icons/fa";

interface QuickPageProps {
  title?: string;
  btnText?: string;
  btnLink?: string;
}

/**
 * QuickPage component showcases the benefits of using Kuepass
 * for organizing events with a visually appealing layout and scroll animations.
 */
export const QuickPage: React.FC<QuickPageProps> = ({
  title = "Why Choose Kuepass",
  btnText = "Get Started",
  btnLink = "/eventSchedule/createEventForm",
}) => {
  // Benefits list to make the component more maintainable
  const benefits = [
    "Easily Upload Your Event.",
    "Get People Registered for the Event.",
    "Keep Track of Registered Attendees.",
    "Easily Verify Attendee using QR code Provided.",
  ];

  // Refs and state for animation
  const contentRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsVisible(entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.2, // Trigger when 20% of the element is visible
      }
    );

    if (contentRef.current) {
      observer.observe(contentRef.current);
    }

    return () => {
      if (contentRef.current) {
        observer.unobserve(contentRef.current);
      }
    };
  }, []);

  return (
    <Container fluid className={styles.quickPageContainer}>
      <Stack className={styles.cardStack}>
        <Text component="h2" className={styles.cardText}>
          {title}
        </Text>

        <Flex
          ref={contentRef}
          className={`${styles.cardFlex} ${isVisible ? styles.animate : ''}`}
          direction={{ base: "column", md: "row" }}
          align={{ base: "center", md: "flex-start" }}
          gap="xl"
        >
          <div className={`${styles.imageWrapper} ${isVisible ? styles.animateFromLeft : ''}`}>
            <Image
              src="/images/quicklady.png"
              alt="Event Organizer Illustration"
              className={styles.ladyeasy}
              width={350}
              height={400}
            />
          </div>

          <Stack className={`${styles.contentStack} ${isVisible ? styles.animateFromRight : ''}`}>
            <Text component="h3" className={styles.cardeasy}>
              Organize Events With Ease
            </Text>

            <Text component="p" className={styles.cardKuepass}>
              With Kuepass you can:
            </Text>

            <Stack>
              {benefits.map((benefit, index) => (
                <Flex 
                  key={`benefit-${index}`} 
                  align="center" 
                  gap="sm"
                  className={`${styles.benefitItem} ${isVisible ? styles.fadeIn : ''}`}
                  style={{ animationDelay: `${0.1 + index * 0.1}s` }}
                >
                  <FaCircle
                    size={8}
                    color="#025a3a"
                    style={{ minWidth: 8, marginTop: 8 }}
                  />
                  <Text
                    component="p"
                    className={styles.cardDescriptions}
                    style={{ margin: 0 }}
                  >
                    {benefit}
                  </Text>
                </Flex>
              ))}
            </Stack>

            <Link href={btnLink} passHref>
              <Button
                className={`${styles.cardBTN} ${isVisible ? styles.fadeInUp : ''}`}
                size="lg"
                aria-label="Get started with Kuepass"
              >
                {btnText}
              </Button>
            </Link>
          </Stack>
        </Flex>
      </Stack>
    </Container>
  );
};

export default QuickPage;