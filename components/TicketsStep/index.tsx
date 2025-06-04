

import React from "react";
import { Ticket } from "../../store/types";
import {
  Card,
  Flex,
  Image,
  Text,
  Button,
  RadioGroup,
  Radio,
  Stack,
  Badge,
} from "@mantine/core";
import styles from "./styles.module.css";

interface TicketsStepProps {
  tickets: Ticket[];
  openModal: () => void;
  handleTicketTypeChange: (index: number, value: string) => void;
  handleSendInvite: (ticketId: string) => void;
}


const TicketsStep: React.FC<TicketsStepProps> = ({
    tickets,
    openModal,
    handleTicketTypeChange,
    handleSendInvite,
  }) => {
    const formatPrice = (price: number): string => {
      return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
      }).format(price);
    };  

  const getTicketTypeBadge = (type: string) => {
    const colors = {
      Paid: "green",
      Free: "blue", 
      Invite: "orange"
    };
    return <Badge color={colors[type as keyof typeof colors] || "gray"}>{type}</Badge>;
  };

  return (
    <div>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Event Tickets</h2>
        <Text className={styles.sectionSubtitle}>
          Create and manage different ticket types for your event
        </Text>
      </div>

      <Stack className={styles.ticketStack}>
        {tickets.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>🎫</div>
            <Text className={styles.emptyStateText}>No tickets created yet</Text>
            <Text className={styles.emptyStateSubtext}>
              Create your first ticket to get started
            </Text>
          </div>
        ) : (
          tickets.map((ticket, index) => (
            <Card
              key={ticket.id}
              className={styles.card}
              padding="xl"
            >
              <Flex className={styles.inputFlex}>
                <div className={styles.inputFlex1}>
                  <div className={styles.ticketHeader}>
                    <div>
                      <Text className={styles.ticketName}>
                        {ticket.name || "Unnamed Ticket"}
                      </Text>
                      {getTicketTypeBadge(ticket.type)}
                    </div>
                    <Text className={styles.ticketPrice}>
                      {ticket.type === "Free" ? "FREE" : formatPrice(ticket.price)}
                    </Text>
                  </div>

                  <div className={styles.ticketDetails}>
                    <div className={styles.ticketDetail}>
                      <Text size="sm" color="dimmed">
                        Type: {ticket.type}
                      </Text>
                    </div>
                    
                    {ticket.type !== "Invite" && (
                      <div className={styles.ticketDetail}>
                        <Text size="sm" color="dimmed">
                          Quantity: {ticket.quantity === "Unlimited" ? "Unlimited" : ticket.quantity}
                        </Text>
                      </div>
                    )}
                    
                    {ticket.type === "Invite" && ticket.inviteEmail && (
                      <div className={styles.ticketDetail}>
                        <Text size="sm" color="dimmed">
                          Invite Email: {ticket.inviteEmail}
                        </Text>
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.ticketActions}>
                  <RadioGroup
                    value={ticket.type}
                    onChange={(value: string) =>
                      handleTicketTypeChange(index, value)
                    }
                    size="sm"
                    className={styles.radioGroup}
                  >
                    <Flex gap="md" direction={{ base: 'column', sm: 'row' }}>
                      <Radio value="Paid" label="Paid" />
                      <Radio value="Free" label="Free" />
                      <Radio value="Invite" label="Invite" />
                    </Flex>
                  </RadioGroup>

                  {ticket.type === "Invite" && !ticket.inviteEmail && (
                    <Button
                      variant="filled"
                      size="sm"
                      className={styles.inviteButton}
                      onClick={() => handleSendInvite(ticket.id)}
                    >
                      Send Invite
                    </Button>
                  )}

                  <button
                    className={styles.menuButton}
                    aria-label="Ticket options"
                  >
                    <Image
                      src="/images/menu.png"
                      alt="menu"
                      width={20}
                      height={20}
                    />
                  </button>
                </div>
              </Flex>
            </Card>
          ))
        )}

        <div className={styles.inputIMGcard} onClick={openModal}>
          <button
            type="button"
            aria-label="Add Ticket"
            className={styles.addButton}
          >
            <Image
              src="/images/addsquare.png"
              alt="Add Ticket"
              className={styles.inputIMG}
            />
          </button>
          <Text className={styles.inputText}>CREATE A NEW TICKET</Text>
        </div>
      </Stack>
    </div>
  );
};

export default TicketsStep;