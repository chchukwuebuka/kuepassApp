
import React from "react";
import { Card, Flex, Image, Text, Button, RadioGroup, Radio } from "@mantine/core";
import styles from "./ticketCard.module.css"; 
import { Ticket } from "../../store/types"; 

interface TicketCardProps {
  ticket: Ticket;
  index: number;
  handleTicketTypeChange: (index: number, value: string) => void;
  handleSendInvite: (ticketId: string) => void;
}

const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  index,
  handleTicketTypeChange,
  handleSendInvite,
}) => {
  // Function to format the price as currency
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  return (
    <Card shadow="sm" padding="lg" mb="sm" className={styles.card}>
      <Flex className={styles.inputFlex} align="flex-start">
        {/* Ticket Information Section */}
        <div className={styles.inputFlex1}>
          <Text>{ticket.name}</Text>
          <Text size="sm" color="dimmed">
            {formatPrice(ticket.price)} 
          </Text>
          <Text size="sm" color="dimmed">
            Type: {ticket.type}
          </Text>
          {ticket.type !== "Invite" && (
            <Text size="sm" color="dimmed">
              Quantity: {ticket.quantity === "Unlimited" ? "Unlimited" : ticket.quantity}
            </Text>
          )}
          {ticket.type === "Invite" && ticket.inviteEmail && (
            <Text size="sm" color="dimmed">
              Invite Email: {ticket.inviteEmail}
            </Text>
          )}
          <Image src="/images/menu.png" alt="menu" width={24} height={24} />
        </div>

        {/* Ticket Actions Section */}
        <div className={styles.ticketActions}>
          {/* Ticket Type Selection */}
          <RadioGroup
            label="Ticket Type"
            value={ticket.type}
            onChange={(value: string) => handleTicketTypeChange(index, value)}
            size="xs"
            className={styles.radioGroup}
          >
            <Radio value="Paid" label="Paid" />
            <Radio value="Free" label="Free" />
            <Radio value="Invite" label="By Invite" />
          </RadioGroup>

          {/* Show Send Invite Button for Invite Tickets */}
          {ticket.type === "Invite" && !ticket.inviteEmail && (
            <Button
              variant="outline"
              size="xs"
              mt="sm"
              onClick={() => handleSendInvite(ticket.id)} 
            >
              Send Invite
            </Button>
          )}
        </div>
      </Flex>
    </Card>
  );
};

export default TicketCard;
