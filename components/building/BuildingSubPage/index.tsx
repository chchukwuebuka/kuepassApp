"use client";

import React from "react";
import { Container, Button, Group, Stack, Image, Flex } from "@mantine/core";
import styles from "./styles.module.css";
import TableComponent from "./tableComponent";
// import Link from "next/link";

const BuildingSubPage: React.FC = () => {
  return (
    <Container fluid className={styles.container}>
      <Stack className={styles.detailsPage}>
        {/* Header Section */}
        <div className={styles.header}>
          <Image
            src="/images/subImage.png"
            alt="Event Banner"
            className={styles.bannerImage}
          />
          <div className={styles.info}>
            <h3 className={styles.infoTitle}>Crisp TV</h3>
            <p className={styles.infoTitle}>
              Location: Nza Street, Enugu, Nigeria
            </p>
            <button className={styles.shareBtn}>🔗 Share Link</button>
          </div>
        </div>

        {/* Flex Section */}
        <Flex className={styles.desSection}>
          <div className={styles.inviteDes}>
            <h3 className={styles.inviteText}>Crisp Tv Invite</h3>
            <p className={styles.inviteText1}>
              {" "}
              Hello John, you have been invited to the Crisp Tv building located
              at No, 9 Nza street, Enugu Nigeria. Kindly find the details of
              your invite below.
            </p>

            <div>
              <TableComponent
                name="John Benson"
                date="18/05/2024"
                time="2pm–4pm"
                invitee="Sam Samson"
              />
            </div>
          </div>
          {/* Description Section */}
          <Stack className={styles.descriptionSection}>
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

export default BuildingSubPage;
