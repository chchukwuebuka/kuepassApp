

// import React from "react";
// import { Ticket } from "../../store/types"; 
// import {
//   Card,
//   Flex,
//   Image,
//   Text,
//   Button,
//   RadioGroup,
//   Stack,
// } from "@mantine/core";
// import styles from "./styles.module.css";

// interface TicketsStepProps {
//   tickets: Ticket[];
//   openModal: () => void;
//   handleTicketTypeChange: (index: number, value: string) => void;
//   handleSendInvite: (ticketId: string) => void;
// }

// const TicketsStep: React.FC<TicketsStepProps> = ({
//   tickets,
//   openModal,
//   handleTicketTypeChange,
//   handleSendInvite,
// }) => {
//   const formatPrice = (price: number): string => {
//     return new Intl.NumberFormat("en-US", {
//       style: "currency",
//       currency: "USD",
//     }).format(price);
//   };

//   return (
//     <div>
//       <h2>Tickets</h2>
//       <Stack className={styles.ticketStack}>
//         {tickets.map((ticket, index) => (
//           <Card
//             key={ticket.id}
//             shadow="sm"
//             padding="lg"
//             className={styles.card}
//           >
//             <Flex className={styles.inputFlex} align="flex-start">
//               <div className={styles.inputFlex1}>
//                 <Text>{ticket.name}</Text>
//                 <Text size="sm" color="dimmed">
//                   {formatPrice(ticket.price)} 
//                 </Text>
//                 <Text size="sm" color="dimmed">
//                   Type: {ticket.type}
//                 </Text>
//                 {ticket.type !== "Invite" && (
//                   <Text size="sm" color="dimmed">
//                     Quantity: {ticket.quantity === "Unlimited" ? "Unlimited" : ticket.quantity}
//                   </Text>
//                 )}
//                 {ticket.type === "Invite" && ticket.inviteEmail && (
//                   <Text size="sm" color="dimmed">
//                     Invite Email: {ticket.inviteEmail}
//                   </Text>
//                 )}
//                 <Image
//                   src="/images/menu.png"
//                   alt="menu"
//                   width={24}
//                   height={24}
//                 />
//               </div>

//               <div className={styles.ticketActions}>
//                 <RadioGroup
//                   onChange={(value: string) =>
//                     handleTicketTypeChange(index, value)
//                   }
//                   size="xs"
//                   className={styles.radioGroup}
//                 >
//                 </RadioGroup>

//                 {ticket.type === "Invite" && !ticket.inviteEmail && (
//                   <Button
//                     variant="outline"
//                     size="xs"
//                     mt="sm"
//                     onClick={() => handleSendInvite(ticket.id)} 
//                   >
//                     Send Invite
//                   </Button>
//                 )}
//               </div>
//             </Flex>
//           </Card>
//         ))}

//         <div className={styles.inputIMGcard}>
//           <button
//             type="button"
//             onClick={openModal}
//             aria-label="Add Ticket"
//             className={styles.addButton}
//           >
//             <Image
//               src="/images/addsquare.png"
//               alt="Add Ticket"
//               className={styles.inputIMG}
//             />
//           </button>
//           <Text className={styles.inputText}>CREATE A NEW TICKET</Text>
//         </div>
//       </Stack>
//     </div>
//   );
// };

// export default TicketsStep;

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
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  return (
    <div>
      <h2>Tickets</h2>
      <Stack className={styles.ticketStack}>
        {tickets.map((ticket, index) => (
          <Card
            key={ticket.id}
            shadow="sm"
            padding="lg"
            className={styles.card}
          >
            <Flex className={styles.inputFlex} align="flex-start">
              <div className={styles.inputFlex1}>
                <Text>{ticket.name || "Unnamed Ticket"}</Text>
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
                <Image
                  src="/images/menu.png"
                  alt="menu"
                  width={24}
                  height={24}
                />
              </div>

              <div className={styles.ticketActions}>
                <RadioGroup
                  value={ticket.type}
                  onChange={(value: string) =>
                    handleTicketTypeChange(index, value)
                  }
                  size="xs"
                  className={styles.radioGroup}
                >
                  <Flex gap="xs">
                    <Radio value="Paid" label="Paid" />
                    <Radio value="Free" label="Free" />
                    <Radio value="Invite" label="Invite" />
                  </Flex>
                </RadioGroup>

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
        ))}

        <div className={styles.inputIMGcard}>
          <button
            type="button"
            onClick={openModal}
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