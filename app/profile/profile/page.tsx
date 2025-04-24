"use client";
import type React from "react";
import { useEffect, useState } from "react";
import styles from "./styles.module.css";
import {
  Stack,
  Card,
  Avatar,
  Text,
  Group,
  Container,
  Flex,
  Box,
  Divider,
  Paper,
  Loader,
  Badge,
  Title,
} from "@mantine/core";
import {
  IconEdit,
  IconLogout,
  IconCalendarEvent,
  IconBuilding,
  IconMail,
  IconUser,
  IconPhone,
  IconWorld,
  IconCurrencyDollar,
  IconLanguage,
} from "@tabler/icons-react";
import Navbar from "@/components/navbar";
import CustomFooter from "@/components/Footer";
import { logout, persistor, type RootState } from "@/store/store";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";

// Type for user information
interface UserProfile {
  name: string;
  email: string;
  phoneNumber?: string;
  profile_url?: string;
  username?: string;
  country?: string;
  currency?: string;
  language?: string;
  active?: boolean;
}

const ProfilePage: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [imgSrc, setImgSrc] = useState<string>("/images/profile.png");
  const [imgError, setImgError] = useState<boolean>(false);

  // Access userInfo from the Redux store based on our store structure
  const userInfo = useSelector((state: RootState) => state.user.userInfo);
  const isLogged = useSelector((state: RootState) => state.user.isLogged);

  useEffect(() => {
    // Log the user data to see what we have
    console.log("Redux userInfo:", userInfo);
    console.log("Is user logged in?", isLogged);

    if (!isLogged || !userInfo) {
      console.warn("No user data found or user not logged in");
      router.push("/auth/signin");
      return;
    }

    // Get profile picture URL directly from profile_url
    let profile_url = userInfo.profile_url || "";

    // Add a cache-busting timestamp if not already present
    if (profile_url && !profile_url.includes("?t=")) {
      const timestamp = new Date().getTime();
      profile_url = profile_url.includes("?")
        ? `${profile_url}&t=${timestamp}`
        : `${profile_url}?t=${timestamp}`;
    }

    console.log("Profile picture URL:", profile_url);
    setImgSrc(profile_url);
    setImgError(false); // Reset error state when loading new image

    // Check for phone number in various possible fields
    const phoneNumber =
      userInfo.phone_number ||
      (userInfo as { phone?: string }).phone ||
      "Not provided";

    console.log("Phone number:", phoneNumber);

    // Set user profile data from the userInfo in the Redux store
    setUserProfile({
      name: userInfo.name || userInfo.username || "User",
      email: userInfo.email || "",
      phoneNumber: phoneNumber,
      profile_url: profile_url,
      username: userInfo.username || "",
      country: userInfo.country || "Not provided",
      currency: userInfo.currency || "Not provided",
      language: userInfo.language || "Not provided",
      active: userInfo.active ?? true,
    });
  }, [userInfo, isLogged, router]);

  const handleLogout = async () => {
    dispatch(logout());
    await persistor.purge();
    router.push("/");
  };

  // Handle image load error
  const handleImageError = () => {
    console.error("Error loading image from source:", imgSrc);
    setImgError(true);
    setImgSrc(""); // Clear the image source on error
  };

  // Show loading state if user data isn't ready
  if (!userProfile) {
    return (
      <Stack>
        <Stack className={styles.navStark}>
          <Navbar />
        </Stack>
        <Container className={styles.container}>
          <Paper className={styles.loadingCard}>
            <Loader color="#024d3a" size="lg" />
            <Text className={styles.loadingText}>Loading profile...</Text>
          </Paper>
        </Container>
        <Box>
          <CustomFooter />
        </Box>
      </Stack>
    );
  }

  return (
    <Stack>
      <Stack className={styles.navStark}>
        <Navbar />
      </Stack>
      <Container className={styles.container}>
        <Card className={styles.profileCard}>
          <Flex className={styles.profileCard1}>
            <Box className={styles.profileImage}>
              <Avatar
                src={imgSrc || ""}
                alt="Profile"
                size={150}
                radius={150}
                className={styles.avatar}
                imageProps={{ onError: handleImageError }}
              />
              {imgError && (
                <Text className={styles.imgErrorText}>
                  Failed to load profile image from server
                </Text>
              )}
            </Box>
            <Box className={styles.profileDetails}>
              <Title order={2} className={styles.profileName}>
                {userProfile.name}
              </Title>
              <Divider className={styles.profileDivider} />

              <Group className={styles.profileInfo}>
                <IconUser className={styles.infoIcon} />
                <Text component="span" className={styles.infoLabel}>
                  Username:
                </Text>
                <Text component="span">{userProfile.username}</Text>
              </Group>

              <Group className={styles.profileInfo}>
                <IconMail className={styles.infoIcon} />
                <Text component="span" className={styles.infoLabel}>
                  Email:
                </Text>
                <Text component="span">{userProfile.email}</Text>
              </Group>

              <Group className={styles.profileInfo}>
                <IconPhone className={styles.infoIcon} />
                <Text component="span" className={styles.infoLabel}>
                  Phone:
                </Text>
                <Text component="span">{userProfile.phoneNumber}</Text>
              </Group>

              <Group className={styles.profileInfo}>
                <IconWorld className={styles.infoIcon} />
                <Text component="span" className={styles.infoLabel}>
                  Country:
                </Text>
                <Text component="span">{userProfile.country}</Text>
              </Group>

              <Group className={styles.profileInfo}>
                <IconCurrencyDollar className={styles.infoIcon} />
                <Text component="span" className={styles.infoLabel}>
                  Currency:
                </Text>
                <Text component="span">{userProfile.currency}</Text>
              </Group>

              <Group className={styles.profileInfo}>
                <IconLanguage className={styles.infoIcon} />
                <Text component="span" className={styles.infoLabel}>
                  Language:
                </Text>
                <Text component="span">{userProfile.language}</Text>
              </Group>

              <Group className={styles.profileInfo}>
                <Text component="span" className={styles.infoLabel}>
                  Account Status:
                </Text>
                <Badge
                  color={userProfile.active ? "green" : "red"}
                  variant="light"
                  size="lg"
                >
                  {userProfile.active ? "Active" : "Inactive"}
                </Badge>
              </Group>
            </Box>
          </Flex>

          <Group className={styles.actions}>
            <Link href="/profile/edithProfile" className={styles.actionLink}>
              <button className={styles.editButton}>
                <IconEdit size={18} className={styles.buttonIcon} />
                Edit Profile
              </button>
            </Link>
            <button onClick={handleLogout} className={styles.logoutButton}>
              <IconLogout size={18} className={styles.buttonIcon} />
              Log Out
            </button>
          </Group>
        </Card>

        <Flex className={styles.eventsFlex}>
          <Card className={styles.eventsCards}>
            <Title order={3} className={styles.cardTitle}>
              My Events
            </Title>
            <Text className={styles.cardDescription}>
              View events that has been uploaded with this profile and also
              search for events of your choice.
            </Text>
            <Link
              href="/eventSchedule/exploreEvent"
              className={styles.actionLink}
            >
              <button className={styles.editButton}>
                <IconCalendarEvent size={18} className={styles.buttonIcon} />
                View
              </button>
            </Link>
          </Card>

          <Card className={styles.eventsCards}>
            <Title order={3} className={styles.cardTitle}>
              My Buildings
            </Title>
            <Text className={styles.cardDescription}>
              View events that has been uploaded with this profile and also
              search for events of your choice.
            </Text>
            <Link href="/building/my-buildings" className={styles.actionLink}>
              <button className={styles.editButton}>
                <IconBuilding size={18} className={styles.buttonIcon} />
                View
              </button>
            </Link>
          </Card>

          <Card className={styles.eventsCards}>
            <Title order={3} className={styles.cardTitle}>
              My Invites
            </Title>
            <Text className={styles.cardDescription}>
              View events that has been uploaded with this profile and also
              search for events of your choice.
            </Text>
            <Link href="/dashboard" className={styles.actionLink}>
              <button className={styles.editButton}>
                <IconCalendarEvent size={18} className={styles.buttonIcon} />
                View
              </button>
            </Link>
          </Card>
        </Flex>
      </Container>
      <Box>
        <CustomFooter />
      </Box>
    </Stack>
  );
};

export default ProfilePage;
