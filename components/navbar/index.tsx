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
  IconEye,
  IconSquare,
  IconDotsVertical,
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

interface NavbarProps {
  alwaysDark?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ alwaysDark = false }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [opened, { open, close }] = useDisclosure(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const isLogged = useSelector((state: RootState) => state.user.isLogged);
  const userInfo = useSelector((state: RootState) => state.user.userInfo);

  // Check if we're on the dashboard or services page
  const isOnDashboard = pathname?.startsWith("/dashboard");
  const isOnServices = pathname?.startsWith("/services");

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
      // Clear event form drafts before logging out
      localStorage.removeItem("kuepassCreateEventFormDraft");
      await clearAuth();
      dispatch(logout());
      await persistor.purge();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
      localStorage.removeItem("kuepassCreateEventFormDraft");
      dispatch(logout());
      await persistor.purge();
      router.push("/");
    }
  };

  const navLinks = [
    {
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
      href: "/services",
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
        } ${isOnDashboard || isOnServices ? styles.dashboardNav : ""}`}
      >
        <div className={styles.navContainer}>
          {isOnDashboard ? (
            <>
              {/* Dashboard Navbar Layout */}
              <div className={styles.dashboardNavLeft}>
                <Link href="/" className={styles.dashboardLogoContainer}>
                  <div className={styles.desktopLogoOnly}>
                    <Image
                      src="/images/Kuepass.svg"
                      alt="Kuepass"
                      width={120}
                      height={40}
                      className={styles.kuepass}
                    />
                  </div>
                  <div className={styles.mobileLogoOnly}>
                    <Image
                      src="/images/klogo.png"
                      alt="Kuepass"
                      width={39}
                      height={60}
                    />
                  </div>
                </Link>
              </div>

              <div className={styles.dashboardNavCenter}>
                <button className={styles.dashboardViewEventButton}>
                  <IconEye
                    size={16}
                    stroke={2}
                    className={styles.viewEventIcon}
                  />
                  <span>View your event</span>
                </button>
                <div className={styles.dashboardNavSeparator}></div>
                <Menu position="bottom-end" shadow="md" width={200} transitionProps={{ transition: 'pop', duration: 150 }}>
                  <Menu.Target>
                    <button className={styles.dashboardMoreButton}>
                      <span>Explore</span>
                      <IconChevronDown size={16} stroke={2} />
                    </button>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      component={Link}
                      href="/eventSchedule/exploreEvent"
                    >
                      Discover Events
                    </Menu.Item>
                    <Menu.Item component={Link} href="/about">
                      About Us
                    </Menu.Item>
                    <Menu.Item component={Link} href="/services">
                      Services
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </div>

              <div className={styles.dashboardNavRight}>
                {isLogged ? (
                  <Menu position="bottom-end" shadow="md" width={200}>
                    <Menu.Target>
                      <UnstyledButton className={styles.dashboardUserButton}>
                        <Avatar
                          src={avatarSrc}
                          alt={userInfo?.username || "User Avatar"}
                          radius="xl"
                          size="sm"
                          className={styles.dashboardUserAvatar}
                          imageProps={{ referrerPolicy: 'no-referrer' }}
                        />
                        <Text className={styles.dashboardUserName} truncate>
                          {userInfo?.username || "User"}
                        </Text>
                        <IconChevronDown size={16} stroke={1.5} className={styles.dashboardChevron} />
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
                ) : (
                  <Group>
                    <Button
                      unstyled
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
                  </Group>
                )}
              </div>
              <Burger
                opened={opened}
                onClick={open}
                className={styles.mobileMenuButton}
                size="sm"
              />
            </>
          ) : (
            <>
              {/* Regular Navbar Layout */}
              <Link href="/">
                <div className={styles.desktopLogoOnly}>
                  <Image
                    src={
                      alwaysDark || isOnServices || isScrolled
                        ? "/images/Kuepass.svg"
                        : "/images/Kuepass1.png"
                    }
                    alt="Kuepass"
                    width={120}
                    height={40}
                    className={styles.kuepass}
                  />
                </div>
                <div className={styles.mobileLogoOnly}>
                  <Image
                    src="/images/klogo.png"
                    alt="Kuepass"
                    width={39}
                    height={60}
                  />
                </div>
              </Link>

              <nav className={styles.navLinkEnhanced}>
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={styles.link}
                    style={alwaysDark ? { color: "#000" } : undefined}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className={styles.groupBTN}>
                {!isLogged ? (
                  <>
                    <Button
                      unstyled
                      className={styles.navBTNEnhanced}
                      onClick={handleLogin}
                    >
                      Login
                    </Button>
                    <Button
                      unstyled
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
                              imageProps={{ referrerPolicy: 'no-referrer' }}
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
            </>
          )}
        </div>
      </header>

      <Drawer
        opened={opened}
        onClose={close}
        position="right"
        size="75%"
        title={
          <Image
            src="/images/klogo.png"
            alt="Kuepass"
            width={39}
            height={60}
          />
        }
      >
        <Stack gap="md">
          <Stack gap="xs">
            {isOnDashboard && (
              <>
                <UnstyledButton className={styles.mobileNavLink}>
                  <Group>
                    <IconCalendarEvent size={18} stroke={1.5} />
                    <Text style={{ color: "#000", fontWeight: 500 }}>My Events</Text>
                  </Group>
                </UnstyledButton>
                <Divider my={5} />
              </>
            )}
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
                  <Text style={alwaysDark ? { color: "#000" } : undefined}>
                    {link.label}
                  </Text>
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
                    imageProps={{ referrerPolicy: 'no-referrer' }}
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
