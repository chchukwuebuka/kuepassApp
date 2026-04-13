"use client";

import React from "react";
import styles from "./styles.module.css";
import { Container, Button, Center, Text, Loader, Badge, Flex } from "@mantine/core";
import { Users, CheckCircle, Wallet, Plus, Calendar } from "lucide-react";
import TopBanner from "@/components/TopBanner";
import StatsCard from "@/components/StatsCard";
import UserTable from "@/components/UserTable";

interface EventData {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  banner_url: string;
  location: string;
  is_active: boolean;
  creator: { id: number; username: string };
  customizations: any[];
}

interface OverviewDashboardProps {
  eventId: string;
  event: EventData | null;
  registeredUsers: number;
  validatedUsers: number;
  totalBalance: string;
  onNavigateToCreate: () => void;
}

const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  eventId,
  event,
  registeredUsers,
  validatedUsers,
  totalBalance,
  onNavigateToCreate,
}) => {
  if (!eventId || !event) {
    return (
      <Container size="md" className={styles.emptyState}>
        <div className={styles.emptyCard}>
          <div className={styles.iconWrapper}>
            <Calendar size={48} className={styles.emptyIcon} />
          </div>
          <h2 className={styles.emptyTitle}>No Event Selected</h2>
          <p className={styles.emptyDesc}>
            Select an event from your sidebar or create a new event to view your powerful analytics overview.
          </p>
          <Button
            className={styles.createBtn}
            onClick={onNavigateToCreate}
            leftSection={<Plus size={16} />}
          >
            Create New Event
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <div className={styles.overviewContainer}>
      <TopBanner event={event} />
      
      <div className={styles.statsGrid}>
        <StatsCard 
          title="Total Registrations" 
          value={registeredUsers}
        />
        <StatsCard 
          title="Checked-in Attendees" 
          value={validatedUsers}
        />
        <StatsCard 
          title="Total Revenue" 
          value={totalBalance}
        />
      </div>

      <div className={styles.recentActivityHeader}>
        <h3>Recent Registrations</h3>
        <Badge variant="light" color="green">Live</Badge>
      </div>
      
      <div className={styles.tableWrapper}>
        <UserTable eventId={eventId} />
      </div>
    </div>
  );
};

export default OverviewDashboard;
