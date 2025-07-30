"use client";

import React, { useState, useEffect } from "react";
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
  Autocomplete,
  Loader,
} from "@mantine/core";
import { useDisclosure, useDebouncedValue } from "@mantine/hooks";
import styles from "./styles.module.css";
import { clearAuth } from "@/app/services/auth";

// Define a type for the event data we expect from the API
interface EventSearchResult {
  id: string;
  title: string;
  value: string;
  label: string;
}

const Navbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [opened, { open, close }] = useDisclosure(false);

  // --- Search State Management ---
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearchValue] = useDebouncedValue(searchValue, 400);
  const [searchResults, setSearchResults] = useState<EventSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const isLogged = useSelector((state: RootState) => state.user.isLogged);
  const userInfo = useSelector((state: RootState) => state.user.userInfo);

  // --- API Call for Event Search ---
  useEffect(() => {
    const searchEvents = async () => {
      if (debouncedSearchValue.trim() === "") {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const response = await fetch(
          `https://keupass-48c2ae65f897.herokuapp.com/api/events/?search=${debouncedSearchValue}`
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        const events = data.data || [];

        // --- FIX APPLIED HERE ---
        // Use a Map to ensure we only have events with unique titles.
        const uniqueEventsMap = new Map();
        events.forEach((event: any) => {
          uniqueEventsMap.set(event.title, event); // The Map key is the title, so duplicates are automatically overwritten.
        });

        // Convert the Map values back to an array and then format for Autocomplete.
        const formattedResults = Array.from(uniqueEventsMap.values()).map(
          (event: any) => ({
            id: event.id,
            title: event.title,
            value: event.title,
            label: event.title,
          })
        );

        setSearchResults(formattedResults);
        // --- END OF FIX ---
      } catch (error) {
        console.error("Failed to fetch search results:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    searchEvents();
  }, [debouncedSearchValue]);

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
    { href: "/", label: "Home", icon: <IconHome size={18} stroke={1.5} /> },
    {
      href: "/#trending-events-section",
      label: "Events",
      icon: <IconCalendarEvent size={18} stroke={1.5} />,
    },
    {
      href: "/#why-kuepass-section",
      label: "Why Kuepass",
      icon: <IconHelpCircle size={18} stroke={1.5} />,
    },
  ];

  const avatarSrc = userInfo?.profile_url || "/images/avatar.png";

  return (
    <>
      <header className={styles.navFlexEnhanced}>
        <div className={styles.navContainer}>
          <Link href="/">
            <Image
              src="/images/Kuepass.svg"
              alt="Kuepass"
              width={120}
              height={40}
              className={styles.kuepass}
            />
          </Link>

          <div className={styles.searchContainer}>
            <Autocomplete
              placeholder="Search events..."
              leftSection={
                isSearching ? (
                  <Loader size={18} />
                ) : (
                  <IconSearch size={18} stroke={1.5} />
                )
              }
              data={searchResults}
              value={searchValue}
              onChange={setSearchValue}
              onOptionSubmit={(itemValue) => {
                const selectedEvent = searchResults.find(
                  (event) => event.value === itemValue
                );
                if (selectedEvent) {
                  router.push(
                    `/eventSchedule/eventDetails/${selectedEvent.id}`
                  );
                  setSearchValue("");
                  setSearchResults([]);
                }
              }}
              classNames={{
                root: styles.searchRoot,
                input: styles.searchInput,
                section: styles.searchIcon,
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                }
              }}
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
            src="/images/Kuepass.svg"
            alt="Kuepass"
            width={120}
            height={40}
          />
        }
      >
        <Stack gap="md">
          <Autocomplete
            placeholder="Search events..."
            leftSection={
              isSearching ? (
                <Loader size={18} />
              ) : (
                <IconSearch size={18} stroke={1.5} />
              )
            }
            data={searchResults}
            value={searchValue}
            onChange={setSearchValue}
            onOptionSubmit={(itemValue) => {
              const selectedEvent = searchResults.find(
                (event) => event.value === itemValue
              );
              if (selectedEvent) {
                router.push(`/eventSchedule/eventDetails/${selectedEvent.id}`);
                setSearchValue("");
                setSearchResults([]);
                close();
              }
            }}
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
