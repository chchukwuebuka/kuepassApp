import { Flex, Group, Image, Text } from "@mantine/core";
import styles from "./styles.module.css";
import Link from "next/link";

const TopBanner = () => {
  return (
    <div className={styles.header}>
      <Image
        src="/images/osiite.png"
        alt="Event Banner"
        className={styles.bannerImage}
      />

      <div className={styles.headerContent}>
        <Text className={styles.eventTitle}>Osi-Ite Cooking Competition</Text>
        <Flex className={styles.eventtime}>
          <p className={styles.eventdate}>March 20, 2024,</p>
          <p className={styles.eventdate}> 10:00 PM</p>
        </Flex>
        <Group className={styles.eventBTN}>
          <Link
            href="/eventSchedule/registerEvent"
            style={{ textDecoration: "underline" }}
          >
            <button className={styles.registerButton}>Register</button>
          </Link>
          <button className={styles.shareButton}>Share Link</button>
        </Group>
      </div>
    </div>
  );
};

export default TopBanner;
