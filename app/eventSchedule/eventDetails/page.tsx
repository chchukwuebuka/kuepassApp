"use client"; 

import React from "react";
import {
  Container,
  Button,
  Text,
  Group,
  Stack,
  Image,
  Flex,
} from "@mantine/core";
import styles from "./styles.module.css";
import Link from "next/link";
import CountdownTimer from "@/components/CountdownTimer";

const OsiIteDetails: React.FC = () => {
  return (
    <Container fluid className={styles.container}>
      <Stack className={styles.detailsPage}>
        {/* Header Section */}
        <div className={styles.header}>
          <Image
            src="/images/osiite.png"
            alt="Event Banner"
            className={styles.bannerImage}
          />
          <div className={styles.headerContent}>
            <Text className={styles.eventTitle}>
              Osi-Ite Cooking Competition
            </Text>
            <Flex className={styles.eventtime}>
              <Text className={styles.eventdate}>March 20, 2024,</Text>
              <Text className={styles.eventdate}> 10:00 PM</Text>
            </Flex>
            <Group className={styles.eventBTN}>
              <Link
                href="/eventSchedule/eventDetails"
                style={{ textDecoration: "underline" }}
              >
                <Button className={styles.registerButton}>Register</Button>
              </Link>
              <Button variant="outline" className={styles.shareButton}>
                Share Link
              </Button>
            </Group>
          </div>
        </div>

        {/* Flex Section */}
        <Flex className={styles.desSection}>
          {/* Countdown Timer Component */}
          <CountdownTimer/>

          {/* Description Section */}
          <Stack className={styles.descriptionSection}>
            <Text className={styles.detailsDescription}>
              Scan the QR code to register for the Osi-Ite Cooking Competition
              and be part of this amazing event.
            </Text>
            <Image
              src="/images/QRcode.png"
              alt="QR Code"
              className={styles.QRImage}
            />
          </Stack>
        </Flex>

        {/* Navigation Button */}
        <Group className={styles.actionGroup}>
          <Button
            className={styles.backButton}
            onClick={() => window.history.back()} 
          >
            View Event Schedule
          </Button>
        </Group>
      </Stack>
    </Container>
  );
};

export default OsiIteDetails;
