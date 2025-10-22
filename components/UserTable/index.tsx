// UserTable.tsx (Updated)
"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  Text,
  Group,
  Badge,
  ScrollArea,
  Center,
  Tooltip,
  ActionIcon,
  Loader,
  Alert,
  Skeleton,
} from "@mantine/core";
import {
  Check,
  X,
  ChevronDown,
  AlertCircle,
  Users,
  RefreshCw,
} from "lucide-react";
import styles from "./styles.module.css";
import { authenticatedRequest } from "@/app/services/auth";

interface Attendee {
  id: string;
  name: string;
  phone_number: string | null;
  email: string;
  is_validated: boolean;
  validated_at: string | null;
}

interface UserTableProps {
  eventId: string;
  searchQuery?: string;
  filter?: "all" | "validated" | "unvalidated";
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://keupass-48c2ae65f897.herokuapp.com/api";

const UserTable: React.FC<UserTableProps> = ({
  eventId,
  searchQuery = "",
  filter = "all",
}) => {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchAttendees = async () => {
    setLoading(true);
    setError(null);
    try {
      // --- THIS IS THE FIX: Changed '?event=' to '?event_id=' ---
      const response = await authenticatedRequest<Attendee[]>(
        `${API_BASE_URL}/attendees/?event_id=${eventId}`,
        "GET"
      );
      console.log("UserTable attendees:", response); // Debug log
      setAttendees(response || []);
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message || "Failed to fetch attendees. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("UserTable eventId:", eventId); // Debug log
    if (!eventId) {
      setError("No event selected. Please provide a valid event ID.");
      setAttendees([]);
      setLoading(false);
      return;
    }

    fetchAttendees();
  }, [eventId]); // The dependency array is correct

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAttendees();
    setTimeout(() => setRefreshing(false), 500);
  };

  // Score an attendee based on completeness
  const scoreAttendee = (attendee: Attendee): number => {
    let score = 0;
    if (attendee.phone_number) score += 2;
    if (attendee.name && attendee.name.trim()) score += 1;
    if (attendee.is_validated) score += 1;
    if (attendee.validated_at) score += 1;
    return score;
  };

  const filteredAttendees = attendees
    // Deduplicate by email, keeping the most complete record
    .reduce((unique, attendee) => {
      const existing = unique.find(
        (u) => u.email.toLowerCase() === attendee.email.toLowerCase()
      );
      if (!existing) return [...unique, attendee];
      // Replace if the current attendee has a higher score
      const currentScore = scoreAttendee(attendee);
      const existingScore = scoreAttendee(existing);
      return currentScore > existingScore
        ? unique.map((u) =>
            u.email.toLowerCase() === attendee.email.toLowerCase()
              ? attendee
              : u
          )
        : unique;
    }, [] as Attendee[])
    // Apply search and filter
    .filter((attendee) => {
      const matchesSearch = searchQuery
        ? attendee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          attendee.email.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      const matchesFilter =
        filter === "all" ||
        (filter === "validated" && attendee.is_validated) ||
        (filter === "unvalidated" && !attendee.is_validated);

      return matchesSearch && matchesFilter;
    });

  // Limit to 10 attendees unless showAll is true
  const displayedAttendees = showAll
    ? filteredAttendees
    : filteredAttendees.slice(0, 10);

  const totalAttendees = filteredAttendees.length;
  const validatedCount = filteredAttendees.filter((a) => a.is_validated).length;

  if (error) {
    return (
      <div className={styles.tableContainer}>
        <Alert
          icon={<AlertCircle size={16} />}
          title="Error Loading Attendees"
          color="red"
        >
          {error}
        </Alert>
        <Center mt="md">
          <button className={styles.tableBTN} onClick={fetchAttendees}>
            Try Again
          </button>
        </Center>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableUser}>
        <Group spacing="xs">
          <Users size={20} className={styles.headerIcon} />
          <h3>Registered Users</h3>
          {!loading && totalAttendees > 0 && (
            <Badge
              size="lg"
              radius="xl"
              color="green"
              className={styles.attendeeCount}
            >
              {totalAttendees} {totalAttendees === 1 ? "Attendee" : "Attendees"}
            </Badge>
          )}
        </Group>

        <Group spacing="md">
          {!loading && totalAttendees > 0 && (
            <Tooltip label="Validated attendees">
              <Badge size="md" color="green" variant="light" radius="xl">
                {validatedCount} Validated
              </Badge>
            </Tooltip>
          )}

          <Tooltip label="Refresh attendee list">
            <ActionIcon
              color="green"
              variant="light"
              onClick={handleRefresh}
              loading={refreshing}
              className={styles.refreshButton}
              radius="xl"
              size="lg"
            >
              <RefreshCw size={16} />
            </ActionIcon>
          </Tooltip>

          {filteredAttendees.length > 10 && (
            <button
              className={styles.tableBTN}
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? "Show Less" : "View All"}
            </button>
          )}
        </Group>
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>
          <Skeleton height={50} radius="sm" mb="sm" />
          <Skeleton height={40} radius="sm" mb="sm" />
          <Skeleton height={40} radius="sm" mb="sm" />
          <Skeleton height={40} radius="sm" mb="sm" />
          <Skeleton height={40} radius="sm" mb="sm" />
          <Center mt="xl">
            <Loader color="green" size="md" />
          </Center>
        </div>
      ) : filteredAttendees.length === 0 ? (
        <div className={styles.emptyContainer}>
          <Text align="center" color="dimmed" size="lg">
            No attendees found for this event.
          </Text>
          <Text align="center" color="dimmed" size="sm" mt="xs">
            {searchQuery
              ? "Try adjusting your search criteria."
              : "Attendees will appear here once they register."}
          </Text>
        </div>
      ) : (
        <ScrollArea>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>#</th>
                <th className={styles.th}>Name</th>
                <th className={styles.th}>Phone Number</th>
                <th className={styles.th}>Email Address</th>
                <th className={styles.th}>Validated</th>
              </tr>
            </thead>
            <tbody>
              {displayedAttendees.map((attendee, index) => (
                <tr key={attendee.id} className={styles.trName}>
                  <td className={styles.td}>{index + 1}</td>
                  <td className={styles.td}>{attendee.name}</td>
                  <td className={styles.td}>
                    {attendee.phone_number || (
                      <Text color="dimmed" size="sm" italic>
                        Not provided
                      </Text>
                    )}
                  </td>
                  <td className={styles.td}>{attendee.email}</td>
                  <td className={styles.td}>
                    {attendee.is_validated ? (
                      <Badge
                        color="green"
                        variant="filled"
                        radius="xl"
                        className={styles.validBadge}
                      >
                        <Check size={12} className={styles.badgeIcon} />{" "}
                        Validated
                      </Badge>
                    ) : (
                      <Badge
                        color="gray"
                        variant="outline"
                        radius="xl"
                        className={styles.pendingBadge}
                      >
                        <X size={12} className={styles.badgeIcon} /> Pending
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollArea>
      )}

      {!loading && filteredAttendees.length > 10 && !showAll && (
        <div className={styles.viewMoreFooter}>
          <button
            className={styles.viewMoreBtn}
            onClick={() => setShowAll(true)}
          >
            View {filteredAttendees.length - 10} more attendees{" "}
            <ChevronDown size={16} className={styles.btnIcon} />
          </button>
        </div>
      )}
    </div>
  );
};
export default UserTable;
