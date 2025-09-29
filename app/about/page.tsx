"use client";

import React from "react";
import Image from "next/image";
// import Navbar from "@/components/navbar";
import Footer from "@/components/Footer";
import StatsSection from "@/components/StatsSection";
import styles from "./styles.module.css";
import OurValuesSection from "@/components/OurValuesSection";
import TestimonialCarousel from "@/components/TestimonialCarousel";
import LevelUpEventSection from "@/components/LevelUpEventSection";

const AboutPage: React.FC = () => {
  return (
    <div className={styles.pageContainer}>
      {/* <Navbar /> */}

      {/* Mission Statement Section */}
      <div className={styles.missionSection}>
        <div className={styles.missionContent}>
          <h1 className={styles.missionTitle}>
            We&apos;re on a{" "}
            <span className={styles.missionHighlight}>mission</span>
          </h1>
          <p className={styles.missionDescription}>
            It&apos;s easy to get lost in the logistics of ticketing and crowd
            management, but at its core, Kuepass is about bringing people
            together.
          </p>
        </div>
      </div>

      {/* Why We Built Kuepass Section */}
      <div className={styles.whyBuiltSection}>
        <div className={styles.whyBuiltContainer}>
          {/* Event Image */}
          <div className={styles.eventImageContainer}>
            <Image
              src="/images/aboutUs.png"
              alt="People enjoying an event"
              width={600}
              height={400}
              className={styles.eventImage}
              priority
            />
          </div>

          {/* Text Content */}
          <div className={styles.whyBuiltContent}>
            <h2 className={styles.whyBuiltTitle}>Why we built Kuepass</h2>
            <p className={styles.whyBuiltDescription}>
              Kuepass was born from a simple obsession: finding a better way to
              host events without the logistical headaches. Today, our
              passionate team channels that obsession into empowering creators,
              partnering with top artists and venues to help bring their visions
              to life.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section without header and testimonials */}
      <StatsSection
        showHeader={false}
        showTestimonials={false}
        containerWidth="lg"
        customPadding="3rem 0"
        customBackgroundColor="white"
      />

      <OurValuesSection />
      <TestimonialCarousel />
      <LevelUpEventSection />

      <Footer />
    </div>
  );
};

export default AboutPage;
