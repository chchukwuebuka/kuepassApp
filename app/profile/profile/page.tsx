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
  IconLogout,
  IconUser,
  IconDeviceMobile,
  IconMail,
  IconPlus,
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


  const [detectedCountry, setDetectedCountry] = useState<string>("Not provided");
  const [detectedLanguage, setDetectedLanguage] = useState<string>("English");

  useEffect(() => {
    // Detect Language
    if (typeof navigator !== 'undefined') {
      try {
        const langCode = navigator.language.split('-')[0];
        const langName = new Intl.DisplayNames(['en'], { type: 'language' }).of(langCode) || 'English';
        setDetectedLanguage(langName);
      } catch (e) {
        setDetectedLanguage('English');
      }
    }

    // Detect Country via IP
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        if (data && data.country_name) {
          setDetectedCountry(data.country_name);
        }
      })
      .catch(() => console.log("Failed to fetch IP country"));
  }, []);

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

    // Add a cache-busting timestamp if not already present, but NEVER for Google images
    if (profile_url && !profile_url.includes("?t=") && !profile_url.includes("googleusercontent.com")) {
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
      country: userInfo.country || "",
      currency: userInfo.currency || "Not provided",
      language: userInfo.language || "",
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

    if (!userProfile) {
    return (
      <Stack>
        <Stack className={styles.navStark}>
          <Navbar alwaysDark />
        </Stack>
        <Container className={styles.container}>
          <Paper className={styles.loadingCard}>
            <Loader color="#025a3a" size="lg" />
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
    <Stack style={{ backgroundColor: "#f4f5f7", minHeight: "100vh" }} gap={0}>
      <Navbar alwaysDark />

      <Flex style={{ flex: 1, width: "100%", paddingTop: "80px", justifyContent: "center", paddingBottom: "60px" }}>
        <Container size="md" className={styles.container}>
          <Box mb={32}>
            <Title order={2} className={styles.pageTitle}>Account Settings</Title>
            <Text c="dimmed">Manage your profile details, email addresses, and security preferences.</Text>
          </Box>

          <Box className={styles.mainContent}>
                <Card className={styles.profileCard}>
                  {/* Header Row: Avatar, Name/Email, Edit Button */}
                  <Flex className={styles.profileHeaderFlex}>
                    <Flex align="center" gap={20}>
                      <Box className={styles.profileImage}>
                        <Avatar
                          src={imgSrc || ""}
                          alt="Profile"
                          size={70}
                          radius={70}
                          className={styles.avatar}
                          imageProps={{ onError: handleImageError }}
                        />
                        {imgError && <Text className={styles.imgErrorText}>Failed to load</Text>}
                      </Box>
                      <Box>
                        <Title order={3} className={styles.profileName}>
                          {userProfile.name}
                        </Title>
                        <Text className={styles.profileEmail}>
                          {userProfile.email}
                        </Text>
                      </Box>
                    </Flex>

                    <Link href="/profile/edithProfile" className={styles.actionLink}>
                      <button className={styles.editButton}>
                        Edit
                      </button>
                    </Link>
                  </Flex>

                  {/* User Info Grid */}
                  <div className={styles.infoGrid}>
                    <div className={styles.infoBlock}>
                      <Text className={styles.infoLabel}>Full Name</Text>
                      <Text className={styles.infoValue}>{userProfile.name}</Text>
                    </div>
                    <div className={styles.infoBlock}>
                      <Text className={styles.infoLabel}>Display Name</Text>
                      <Text className={styles.infoValue}>{userProfile.username || userProfile.name}</Text>
                    </div>
                    <div className={styles.infoBlock}>
                      <Text className={styles.infoLabel}>Phone Number</Text>
                      <Text className={styles.infoValue}>{userProfile.phoneNumber || "Not provided"}</Text>
                    </div>
                    <div className={styles.infoBlock}>
                      <Text className={styles.infoLabel}>Gender</Text>
                      <Text className={styles.infoValue}>I'd prefer not to say</Text>
                    </div>
                    <div className={styles.infoBlock}>
                      <Text className={styles.infoLabel}>Country/Region</Text>
                      <Text className={styles.infoValue}>
                        {userProfile.country || detectedCountry}
                      </Text>
                    </div>
                    <div className={styles.infoBlock}>
                      <Text className={styles.infoLabel}>Language</Text>
                      <Text className={styles.infoValue}>{userProfile.language || detectedLanguage}</Text>
                    </div>
                    <div className={styles.infoBlock}>
                      <Text className={styles.infoLabel}>Time zone</Text>
                      <Text className={styles.infoValue}>(GMT +01:00) West Africa Standard Time</Text>
                    </div>
                  </div>
                </Card>

                {/* Email Addresses Card */}
                <Card className={styles.profileCard} mt="md">
                  <Title order={4} className={styles.sectionTitle}>My Email Addresses</Title>
                  <Text className={styles.sectionDesc}>
                    View and manage the email addresses associated with your account. They can be used to sign in and to reset password if you ever forget.
                  </Text>
                  <div className={styles.emailBlock}>
                    <Text className={styles.infoValue}>{userProfile.email}</Text>
                    <Badge color="green" variant="light">Primary</Badge>
                  </div>
                </Card>


            {/* Separated Logout Action - Always visible safely at the bottom */}
            <Flex justify="flex-start" mt={40} mb={40}>
               <button onClick={handleLogout} className={styles.logoutButton}>
                 <IconLogout size={18} className={styles.buttonIcon} />
                 Log Out
               </button>
            </Flex>

          </Box>
        </Container>
      </Flex>

      <Box>
        <CustomFooter />
      </Box>
    </Stack>
  );
};

export default ProfilePage;
  