"use client";

import type React from "react";
import { useState } from "react";
import { useSelector } from "react-redux";
import {
  type RootState,
  logout,
  persistor,
  useAppDispatch,
} from "@/store/store";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  IconSearch,
  IconChevronDown,
  IconHome,
  IconInfoCircle,
  IconCalendarEvent,
} from "@tabler/icons-react";
import {
  Avatar,
  Group,
  Image,
  Menu,
  Button,
  TextInput,
  Burger,
  Drawer,
  Stack,
  Text,
  Box,
  UnstyledButton,
  Divider,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import styles from "./styles.module.css";
import { clearAuth } from "@/app/services/auth";
import { IconHelpCircle } from "@tabler/icons-react";

const Navbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [opened, { open, close }] = useDisclosure(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const isLogged = useSelector((state: RootState) => state.user.isLogged);
  const userInfo = useSelector((state: RootState) => state.user.userInfo);

  console.log("Navbar user state:", { isLogged, userInfo });

  const handleLogin = () => {
    router.push("/auth/signin");
  };

  const handleSignup = () => {
    router.push("/auth/signnup");
  };

  const handleLogout = async () => {
    try {
      await clearAuth();
      dispatch(logout());
      await persistor.purge();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
      dispatch(logout());
      await persistor.purge();
      router.push("/");
    }
  };

  const handleGoHome = () => {
    router.push("/");
  };

  const navLinks = [
    { href: "/", label: "Home", icon: <IconHome size={18} stroke={1.5} /> },
    // Removed "/about" link as per previous discussion
    {
      href: "/#trending-events-section", // Link to the "Trending Events" section on the homepage
      label: "Events", // Or "Trending Events" if you prefer
      icon: <IconCalendarEvent size={18} stroke={1.5} />,
    },
    {
      href: "/#why-kuepass-section", // Link to the section on the homepage
      label: "Why Kuepass",
      icon: <IconHelpCircle size={18} stroke={1.5} />, // Example icon
    },
    // Add any other actual links you have here
  ];

  console.log("Navbar userInfo:", userInfo);
  console.log("Profile URL:", userInfo?.profile_url);

  const getAvatarSrc = () => {
    return userInfo?.profile_url || "https://via.placeholder.com/150";
  };

  return (
    <>
      <header className={styles.navFlexEnhanced}>
        <div className={styles.navContainer}>
          <Link href="/">
            <Image
              src="/images/Kuepass.svg"
              alt="Kuepass"
              className={styles.kuepass}
            />
          </Link>

          <div className={styles.searchContainer}>
            <TextInput
              placeholder="Search events..."
              leftSection={<IconSearch size={18} stroke={1.5} />}
              classNames={{
                root: searchFocused
                  ? styles.searchRootFocused
                  : styles.searchRoot,
                input: styles.searchInput,
                section: styles.searchIcon,
              }}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </div>

          <nav className={styles.navLinkEnhanced}>
            {navLinks.map((link) => (
              <Link key={link.label} href={link.href} className={styles.link}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className={styles.groupBTN}>
            {!isLogged ? (
              <>
                <Button
                  variant="outline"
                  className={styles.navBTNEnhanced}
                  onClick={handleLogin}
                >
                  Sign In
                </Button>
                <Button
                  className={styles.navBTN1Enhanced}
                  onClick={handleSignup}
                >
                  Sign Up
                </Button>
              </>
            ) : (
              <Group>
                <Menu
                  position="bottom-end"
                  shadow="md"
                  width={200}
                  styles={{ dropdown: { marginRight: "10px" } }}
                >
                  <Menu.Target>
                    <UnstyledButton
                      className={styles.avatarButtonEnhanced}
                      style={{ marginRight: "5px" }}
                    >
                      <div className={styles.userProfileContainer}>
                        <Avatar
                          src={getAvatarSrc()}
                          radius="xl"
                          className={styles.userAvatar}
                          imageProps={{
                            onError: (
                              e: React.SyntheticEvent<HTMLImageElement>
                            ) => {
                              console.error(
                                "Avatar image failed to load, using fallback"
                              );
                              e.currentTarget.src =
                                "https://via.placeholder.com/150";
                            },
                          }}
                        />
                        <div className={styles.userNameContainer}>
                          <Text className={styles.userName}>
                            {userInfo?.username || "User"}
                          </Text>
                        </div>
                        <IconChevronDown size={16} stroke={1.5} />
                      </div>
                    </UnstyledButton>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item component={Link} href="/profile/profile">
                      Profile
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item onClick={handleLogout} color="red">
                      Logout
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>
            )}

            <Burger
              opened={opened}
              onClick={open}
              className={styles.mobileMenuButton}
              size="sm"
            />
          </div>
        </div>
      </header>

      <Drawer
        opened={opened}
        onClose={close}
        position="right"
        size="75%"
        title={<Image src="/images/Kuepass.svg" alt="Kuepass" w={120} />}
      >
        <Stack gap="md">
          <TextInput
            placeholder="Search events..."
            leftSection={<IconSearch size={18} stroke={1.5} />}
            size="md"
          />

          <Divider my="sm" />

          <Stack gap="xs">
            {navLinks.map((link) => (
              <UnstyledButton
                key={link.label}
                component={Link}
                href={link.href}
                className={styles.mobileNavLink}
                onClick={close}
              >
                <Group>
                  {link.icon}
                  <Text>{link.label}</Text>
                </Group>
              </UnstyledButton>
            ))}
          </Stack>

          <Divider my="sm" />

          {!isLogged ? (
            <Stack gap="sm">
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  handleLogin();
                  close();
                }}
                className={styles.mobileNavBTN}
              >
                Sign In
              </Button>
              <Button
                fullWidth
                onClick={() => {
                  handleSignup();
                  close();
                }}
                className={styles.mobileNavBTN1}
              >
                Sign Up
              </Button>
            </Stack>
          ) : (
            <Stack gap="md">
              <Box
                p="md"
                bg="gray.0"
                style={{ borderRadius: 8, marginBottom: "15px" }}
              >
                <div
                  className={styles.userProfileContainer}
                  style={{ margin: 0 }}
                >
                  <Avatar
                    src={getAvatarSrc()}
                    radius="xl"
                    className={styles.userAvatar}
                    imageProps={{
                      onError: (e: React.SyntheticEvent<HTMLImageElement>) => {
                        console.error(
                          "Avatar image failed to load, using fallback"
                        );
                        e.currentTarget.src = "https://via.placeholder.com/150";
                      },
                    }}
                  />
                  <div className={styles.userNameContainer}>
                    <Text className={styles.userName}>
                      {userInfo?.username || "User"}
                    </Text>
                  </div>
                </div>
              </Box>

              <UnstyledButton
                component={Link}
                href="/profile/profile"
                className={styles.mobileNavLink}
                onClick={close}
              >
                Profile
              </UnstyledButton>

              <UnstyledButton
                className={styles.mobileLogoutButton}
                onClick={() => {
                  handleLogout();
                  close();
                }}
              >
                Logout
              </UnstyledButton>

              <Button
                fullWidth
                onClick={() => {
                  handleGoHome();
                  close();
                }}
                className={styles.mobileNavBTN1}
              >
                Go Home
              </Button>
            </Stack>
          )}
        </Stack>
      </Drawer>
    </>
  );
};

export default Navbar;
