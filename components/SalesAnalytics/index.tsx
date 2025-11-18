"use client";

import React, { useState, useEffect } from "react";
import {
  Accordion,
  Container,
  Title,
  Text,
  Loader,
  Center,
  Alert,
} from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import SalesDashboard from "../SalesDashboard";
import { authenticatedRequest } from "@/app/services/auth";
import styles from "./styles.module.css";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://api.kuepass.com/api/"
).replace(/\/$/, "");

interface TicketData {
  id: string;
  name: string;
  quantity: number | "Unlimited";
}

interface SalesAnalyticsPageProps {
  eventId: string;
}

const SalesAnalyticsPage: React.FC<SalesAnalyticsPageProps> = ({ eventId }) => {
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) {
      setIsLoading(false);
      setError(
        "No event selected. Please go back to the overview and select an event."
      );
      return;
    }

    const fetchTicketsForEvent = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await authenticatedRequest<TicketData[]>(
          `${API_BASE_URL}/tickets/?event=${eventId}`
        );

        let ticketData = response;
        if (
          response &&
          (response as any).data &&
          Array.isArray((response as any).data)
        ) {
          ticketData = (response as any).data;
        } else if (
          response &&
          (response as any).results &&
          Array.isArray((response as any).results)
        ) {
          ticketData = (response as any).results;
        }

        if (!Array.isArray(ticketData)) {
          throw new Error("Received an invalid format for ticket data.");
        }

        setTickets(ticketData);
      } catch (err: any) {
        console.error("Failed to fetch tickets:", err);
        setError(err.message || "Could not load tickets for this event.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTicketsForEvent();
  }, [eventId]);

  if (isLoading) {
    return (
      <Center style={{ padding: "2rem" }}>
        <Loader />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertTriangle size={16} />} title="Error" color="red">
        {error}
      </Alert>
    );
  }

  return (
    <Container size="lg" py="xl" className={styles.analyticsContainer}>
      <Title order={2} mb="xs">
        Sales Analytics
      </Title>
      <Text c="dimmed" mb="xl">
        View sales forecasts and performance for each of your event&apos;s
        tickets.
      </Text>

      {tickets.length > 0 ? (
        <Accordion variant="separated">
          {tickets.map((ticket) => (
            <Accordion.Item key={ticket.id} value={ticket.name}>
              <Accordion.Control>{ticket.name}</Accordion.Control>
              <Accordion.Panel>
                <SalesDashboard
                  ticketTypeId={ticket.id}
                  ticketName={ticket.name}
                  totalQuantity={ticket.quantity}
                />
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      ) : (
        <Text>No tickets have been created for this event yet.</Text>
      )}
    </Container>
  );
};

export default SalesAnalyticsPage;
