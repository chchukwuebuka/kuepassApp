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
import CustomFooter from "@/components/Footer";
import Link from "next/link";
import EventSection from "@/components/TrendingEvents";

const EventPage: React.FC = () => {
  return (
    <Stack>
      <Container fluid className={styles.container}>
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
            <Link href="/eventSchedule/registerEvent" style={{ textDecoration: "underline" }}>
              <Button className={styles.registerButton}>Register</Button>
            </Link>
              <Button variant="outline" className={styles.shareButton}>
                Share Link
              </Button>
            </Group>
          </div>
        </div>

        {/* Description Section */}
        <Stack className={styles.descriptionSection}>
          <Text className={styles.descriptionHeader}>Description</Text>
          <Text className={styles.descriptionText}>
            Osi-Ite is a culinary contest mainly for people in the eastern
            states of Nigeria. It is an opportunity for culinary experts to show
            their skills and for attendees to have a great time. Different
            partners provide prizes for the winners, and judges are culinary
            experts in the food industry.
          </Text>
        </Stack>

        <Stack className={styles.otherEvents}>
         
<Stack className={styles.otherEvents}>
  <EventSection limit={3}/>
</Stack>
        </Stack>
      </Container>
      <CustomFooter />
    </Stack>
  );
};

export default EventPage;
