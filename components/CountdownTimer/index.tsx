"use client"; 
import React, { useState, useEffect } from "react";
import { Stack, Text, Flex } from "@mantine/core";
import styles from "./styles.module.css"; 

interface CountdownTimerProps {
  size?: "default" | "small"; 
  targetDate?: Date; 
  onComplete?: () => void; 
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ size = "default", targetDate, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!targetDate) {
      setTimeLeft({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      });
      return;
    }

    const targetTime = targetDate.getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference <= 0) {
        clearInterval(interval);
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        });
        if (onComplete) onComplete(); 
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate, onComplete]);

  const sizeClass = size === "small" ? styles.small : "";

  return (
    <Flex className={`${styles.countdownSection} ${sizeClass}`}>
      <Flex className={styles.countdownTimer}>
        <Flex>
          <Stack className={styles.timeBlock}>
            <Text className={styles.timeValue}>{timeLeft.days}</Text>
            <Text className={styles.timeLabel}>DAYS</Text>
          </Stack>
          <Text className={styles.colon}>:</Text>
          <Stack className={styles.timeBlock}>
            <Text className={styles.timeValue}>{timeLeft.hours}</Text>
            <Text className={styles.timeLabel}>HOURS</Text>
          </Stack>
        </Flex>
        <Flex>
          <Stack className={styles.timeBlock}>
            <Text className={styles.timeValue}>{timeLeft.minutes}</Text>
            <Text className={styles.timeLabel}>MINUTES</Text>
          </Stack>
          <Text className={styles.colon}>:</Text>
          <Stack className={styles.timeBlock}>
            <Text className={styles.timeValue}>{timeLeft.seconds}</Text>
            <Text className={styles.timeLabel}>SECONDS</Text>
          </Stack>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default CountdownTimer;
