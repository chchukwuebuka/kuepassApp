"use client";
import React from "react";
import styles from "./styles.module.css";
import Image from "next/image";
import { Stack } from "@mantine/core";
import Navbar from "@/components/navbar";
import CustomFooter from "@/components/Footer";
import { logout, persistor, useAppDispatch } from "@/store/store";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleLogout = async () => {
    dispatch(logout());
    await persistor.purge();
    router.push("/");
  };

  return (
    <Stack>
      <Stack className={styles.navStark}>
        <Navbar />
      </Stack>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>Profile</h1>
        </header>
        <main className={styles.main}>
          <div className={styles.profileCard}>
            <div className={styles.profileCard1}>
              <div className={styles.profileImage}>
                <Image
                  src="/images/profile.png"
                  alt="Profile"
                  width={150}
                  height={150}
                  className={styles.image}
                />
              </div>
              <div className={styles.profileDetails}>
                <h2>William Kassien</h2>
                <p>wkassien@example.com</p>
                <p>+123 456 7890</p>
              </div>
            </div>
            <div className={styles.actions}>
              <Link href="/profile/edithProfile">
                <button className={styles.editButton}>Edit Profile</button>
              </Link>
              <button onClick={handleLogout} className={styles.logoutButton}>
                Log Out
              </button>
            </div>
          </div>
        </main>
        {/* <Link  href="/dashboard">
        <div>My Events</div>
        </Link> */}
        <div className={styles.eventsFlex}>
          <div className={styles.eventsCards}>
            <h2>My Events</h2>
            <p>
              View events that has been uploade with this profile and also
              search for events of your choice.
            </p>
            <Link  href="/eventSchedule/exploreEvent">
            <button className={styles.editButton}>View</button>
            </Link>
          </div>
          <div className={styles.eventsCards}>
            <h2>My Buildings</h2>
            <p>
              View events that has been uploade with this profile and also
              search for events of your choice.
            </p>
            <Link  href="/building/my-buildings">
            <button className={styles.editButton}>View</button>
            </Link>
          </div>
          <div className={styles.eventsCards}>
            <h2>My Invites</h2>
            <p>
              View events that has been uploade with this profile and also
              search for events of your choice.
            </p>
            <Link  href="/dashboard">
            <button className={styles.editButton}>View</button>
            </Link>
          </div>
        </div>
      </div>
      <div>
        <CustomFooter />
      </div>
    </Stack>
  );
};

export default ProfilePage;
