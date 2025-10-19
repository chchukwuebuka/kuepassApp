"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  type RootState,
  logout,
  persistor,
  useAppDispatch,
} from "@/store/store";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  IconChevronDown,
  IconHome,
  IconCalendarEvent,
  IconHelpCircle,
} from "@tabler/icons-react";
import {
  Avatar,
  Group,
  Image,
  Menu,
  Button,
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

const Navbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [opened, { open, close }] = useDisclosure(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const isLogged = useSelector((state: RootState) => state.user.isLogged);
  const userInfo = useSelector((state: RootState) => state.user.userInfo);

  // Check if we're on the dashboard page
  const isOnDashboard = pathname?.startsWith("/dashboard");

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const navLinks = [
    {
      href: "/",
      label: "How it works",
      icon: <IconHome size={18} stroke={1.5} />,
    },
    {
      // href: "/#trending-events-section",
      href: "/eventSchedule/exploreEvent",
      label: "Discover Events ",
      icon: <IconCalendarEvent size={18} stroke={1.5} />,
    },
    {
      href: "/about",
      label: "About Us",
      icon: <IconHelpCircle size={18} stroke={1.5} />,
    },
    {
      href: "/#why-kuepass-section",
      label: "Services",
      icon: <IconHelpCircle size={18} stroke={1.5} />,
    },
  ];

  const avatarSrc = userInfo?.profile_url || "/images/avatar.png";

  return (
    <>
      <header
        className={`${styles.navFlexEnhanced} ${
          isScrolled ? styles.scrolled : ""
        } ${isOnDashboard ? styles.dashboardNav : ""}`}
      >
        <div className={styles.navContainer}>
          <Link href="/">
            <Image
              src={isScrolled ? "/images/Kuepass.svg" : "/images/Kuepass1.png"}
              alt="Kuepass"
              width={120}
              height={40}
              className={styles.kuepass}
            />
          </Link>

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
                  Login
                </Button>
                <Button
                  className={styles.navBTN1Enhanced}
                  onClick={handleSignup}
                >
                  Sign up
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
                          src={avatarSrc}
                          alt={userInfo?.username || "User Avatar"}
                          radius="xl"
                          className={styles.userAvatar}
                        />
                        <div className={styles.userNameContainer}>
                          <Text className={styles.userName} truncate>
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
        title={
          <Image
            src={isScrolled ? "/images/Kuepass.svg" : "/images/Kuepass1.png"}
            alt="Kuepass"
            width={120}
            height={40}
          />
        }
      >
        <Stack gap="md">
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
                Login
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
                    src={avatarSrc}
                    alt={userInfo?.username || "User Avatar"}
                    radius="xl"
                    className={styles.userAvatar}
                  />
                  <div className={styles.userNameContainer}>
                    <Text className={styles.userName} truncate>
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
            </Stack>
          )}
        </Stack>
      </Drawer>
    </>
  );
};

export default Navbar;
