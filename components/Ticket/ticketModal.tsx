// "use client";

// import React, { useState } from "react";
// import {
//   Modal,
//   Button,
//   TextInput,
//   NumberInput,
//   Radio,
//   Group,
//   Stack,
//   Text,
//   Flex,
//   Alert,
//   Switch,
//   Collapse,
// } from "@mantine/core";
// import { IconInfoCircle } from "@tabler/icons-react";
// import styles from "./ticketModal.module.css";
// import { Ticket } from "../../store/types";
// import { authenticatedRequest } from "../../app/services/auth";

// interface TicketModalProps {
//   isModalOpen: boolean;
//   closeModal: () => void;
//   addTicket: (
//     ticket: Omit<Ticket, "id" | "category_price" | "category_name"> & {
//       price: number;
//       type: "Paid" | "Free" | "Invite";
//       quantity: number | "Unlimited";
//       inviteEmail?: string;
//       enable_dynamic_pricing?: boolean;
//       min_price?: number;
//       max_price?: number;
//     }
//   ) => void;
//   eventDetails: {
//     title: string;
//     description: string;
//     location: string;
//   };
// }

// const TicketModal: React.FC<TicketModalProps> = ({
//   isModalOpen,
//   closeModal,
//   addTicket,
//   eventDetails,
// }) => {
//   const initialTicketState = {
//     name: "",
//     price: 0,
//     quantity: 0 as number | "Unlimited",
//     type: "Paid" as "Paid" | "Free" | "Invite",
//     inviteEmail: "",
//     enable_dynamic_pricing: false,
//     min_price: undefined as number | undefined,
//     max_price: undefined as number | undefined,
//   };

//   const [newTicket, setNewTicket] = useState(initialTicketState);
//   const [isUnlimited, setIsUnlimited] = useState<boolean>(false);
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [isSuggesting, setIsSuggesting] = useState<boolean>(false);
//   const [suggestion, setSuggestion] = useState<{
//     suggested_price: number;
//     price_range: string;
//     reasoning: string;
//   } | null>(null);
//   const [suggestionError, setSuggestionError] = useState("");

//   const handleTicketChange = (
//     field: keyof typeof initialTicketState,
//     value: any
//   ) => {
//     setNewTicket((prev) => ({ ...prev, [field]: value }));
//   };

//   const handleTicketTypeChange = (value: string) => {
//     if (value === "Paid" || value === "Free" || value === "Invite") {
//       const ticketType = value as "Paid" | "Free" | "Invite";
//       setNewTicket((prev) => ({
//         ...prev,
//         type: ticketType,
//         price: ticketType === "Free" ? 0 : prev.price,
//         quantity:
//           ticketType === "Invite"
//             ? 1
//             : isUnlimited
//             ? "Unlimited"
//             : prev.quantity,
//         inviteEmail:
//           ticketType === "Invite" ? prev.inviteEmail || "" : undefined,
//       }));
//       if (ticketType === "Invite") {
//         setIsUnlimited(false);
//       }
//     }
//   };

//   const handleSuggestPrice = async () => {
//     if (!eventDetails.title) {
//       setSuggestionError(
//         "Please go back to Step 1 and enter an event title first."
//       );
//       return;
//     }

//     setIsSuggesting(true);
//     setSuggestion(null);
//     setSuggestionError("");

//     try {
//       const response = await authenticatedRequest<{
//         suggested_price: number;
//         price_range: string;
//         reasoning: string;
//       }>(
//         `https://keupass-48c2ae65f897.herokuapp.com/api/suggest-ticket-price/`,
//         "POST",
//         {
//           title: eventDetails.title,
//           description: eventDetails.description,
//           location: eventDetails.location,
//         }
//       );
//       if (response) {
//         setSuggestion(response);
//       }
//     } catch (error: any) {
//       setSuggestionError(error.message || "Failed to fetch suggestion.");
//     } finally {
//       setIsSuggesting(false);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setIsLoading(true);

//     if (newTicket.enable_dynamic_pricing) {
//       if (!newTicket.min_price || !newTicket.max_price) {
//         alert("Please set a minimum and maximum price for dynamic pricing.");
//         setIsLoading(false);
//         return;
//       }
//       if (newTicket.min_price >= newTicket.max_price) {
//         alert("Minimum price must be less than the maximum price.");
//         setIsLoading(false);
//         return;
//       }
//       if (
//         newTicket.price < newTicket.min_price ||
//         newTicket.price > newTicket.max_price
//       ) {
//         alert(
//           "The initial price must be between the minimum and maximum price limits."
//         );
//         setIsLoading(false);
//         return;
//       }
//     }

//     // Your existing validation logic...
//     if (!newTicket.name.trim()) {
//       alert("Ticket name is required.");
//       setIsLoading(false);
//       return;
//     }

//     const ticketToAdd = {
//       ...newTicket,
//       quantity: isUnlimited ? "Unlimited" : Number(newTicket.quantity),
//     };
//     addTicket(ticketToAdd);

//     setNewTicket(initialTicketState);
//     setIsUnlimited(false);
//     setIsLoading(false);
//     setSuggestion(null);
//     setSuggestionError("");
//     closeModal();
//   };

//   const priceParser = (value: string | undefined): string => {
//     if (value === undefined) return "";
//     return value.replace(/₦\s?|(,*)/g, "");
//   };

//   const priceFormatter = (value: string | undefined): string => {
//     if (value === undefined || value === "") return "₦";
//     const num = parseFloat(value);
//     return !Number.isNaN(num)
//       ? `₦${num.toLocaleString(undefined, {
//           minimumFractionDigits: 2,
//           maximumFractionDigits: 2,
//         })}`
//       : "₦";
//   };

//   const toggleUnlimited = () => {
//     const currentlyUnlimited = !isUnlimited;
//     setIsUnlimited(currentlyUnlimited);
//     if (currentlyUnlimited) {
//       handleTicketChange("quantity", "Unlimited" as any);
//     } else {
//       handleTicketChange("quantity", 0);
//     }
//   };

//   const handleCancel = () => {
//     setNewTicket(initialTicketState);
//     setIsUnlimited(false);
//     setSuggestion(null);
//     setSuggestionError("");
//     closeModal();
//   };

//   return (
//     <Modal
//       opened={isModalOpen}
//       onClose={isLoading ? () => {} : handleCancel}
//       title={
//         <Text fw={700} size="xl">
//           Create New Ticket
//         </Text>
//       }
//       centered
//       size="lg"
//       className={styles.modalContent}
//       overlayProps={{ blur: 3, backgroundOpacity: 0.2 }}
//       closeOnClickOutside={!isLoading}
//       closeOnEscape={!isLoading}
//     >
//       <form onSubmit={handleSubmit}>
//         <Stack spacing="lg">
//           <div className={styles.formSection}>
//             <Text className={styles.sectionTitle}>Basic Information</Text>
//             <TextInput
//               label="Ticket Name"
//               placeholder="e.g., General Admission, VIP Pass"
//               value={newTicket.name}
//               onChange={(e) =>
//                 handleTicketChange("name", e.currentTarget.value)
//               }
//               required
//               maxLength={255}
//               className={styles.textInput}
//             />
//             <Radio.Group
//               name="ticketType"
//               label="Ticket Type"
//               value={newTicket.type}
//               onChange={handleTicketTypeChange}
//               required
//               className={styles.radioGroup}
//             >
//               <Group mt="xs" className={styles.radioFlex}>
//                 <Radio value="Paid" label="Paid" />
//                 <Radio value="Free" label="Free" />
//                 <Radio value="Invite" label="By Invite" />
//               </Group>
//             </Radio.Group>
//           </div>

//           {newTicket.type === "Paid" && (
//             <div className={styles.formSection}>
//               <Text className={styles.sectionTitle}>Pricing</Text>
//               <Flex className={styles.priceInput}>
//                 <NumberInput
//                   style={{ flexGrow: 1 }}
//                   label="Price"
//                   placeholder="Enter ticket price"
//                   value={newTicket.price}
//                   onChange={(value) =>
//                     handleTicketChange(
//                       "price",
//                       typeof value === "number" ? value : 0
//                     )
//                   }
//                   required
//                   min={0.01}
//                   step={0.01}
//                   value={newTicket.price}
//                   onChange={(value) =>
//                     handleTicketChange(
//                       "price",
//                       typeof value === "number" ? value : 0
//                     )
//                   }
//                   prefix="₦"
//                   className={styles.numberInput}
//                 />
//                 <Button
//                   type="button"
//                   variant="light"
//                   onClick={handleSuggestPrice}
//                   loading={isSuggesting}
//                   leftSection={<span>✨</span>}
//                   className={styles.unlimitedButton}
//                 >
//                   Suggest Price
//                 </Button>
//               </Flex>
//               {suggestionError && (
//                 <Alert color="red" mt="md">
//                   {suggestionError}
//                 </Alert>
//               )}
//               {suggestion && (
//                 <Alert
//                   icon={<IconInfoCircle size={16} />}
//                   title="AI Suggestion"
//                   color="green"
//                   mt="md"
//                 >
//                   <Text size="sm">{suggestion.reasoning}</Text>
//                   <Text size="sm" mt="xs">
//                     <strong>Recommended Range:</strong> {suggestion.price_range}
//                   </Text>
//                   <Text fw={700} mt="xs">
//                     Our suggestion is{" "}
//                     {priceFormatter(suggestion.suggested_price.toString())}
//                   </Text>
//                   <Button
//                     variant="outline"
//                     size="xs"
//                     mt="sm"
//                     onClick={() =>
//                       handleTicketChange("price", suggestion.suggested_price)
//                     }
//                     className={styles.unlimitedButton}
//                   >
//                     Use This Price
//                   </Button>
//                 </Alert>
//               )}
//               {newTicket.price > 0 && (
//                 <div className={styles.priceDisplay}>
//                   Total: {priceFormatter(newTicket.price.toString())}
//                 </div>
//               )}
//             </div>
//           )}

//           {newTicket.type === "Paid" && (
//             <div className={styles.formSection}>
//               <Text className={styles.sectionTitle}>Advanced Settings</Text>
//               <Switch
//                 checked={newTicket.enable_dynamic_pricing}
//                 onChange={(event) =>
//                   handleTicketChange(
//                     "enable_dynamic_pricing",
//                     event.currentTarget.checked
//                   )
//                 }
//                 label="Enable AI Dynamic Pricing"
//                 description="Automatically adjust ticket price based on sales velocity to maximize revenue."
//               />
//               <Collapse in={newTicket.enable_dynamic_pricing}>
//                 <Flex mt="md" gap="md">
//                   <NumberInput
//                     style={{ flex: 1 }}
//                     label="Minimum Price"
//                     description="Lowest price allowed."
//                     placeholder="e.g., 5000"
//                     value={newTicket.min_price}
//                     onChange={(value) => handleTicketChange("min_price", value)}
//                     prefix="₦"
//                     required={newTicket.enable_dynamic_pricing}
//                   />
//                   <NumberInput
//                     style={{ flex: 1 }}
//                     label="Maximum Price"
//                     description="Highest price allowed."
//                     placeholder="e.g., 20000"
//                     value={newTicket.max_price}
//                     onChange={(value) => handleTicketChange("max_price", value)}
//                     prefix="₦"
//                     required={newTicket.enable_dynamic_pricing}
//                   />
//                 </Flex>
//               </Collapse>
//             </div>
//           )}

//           {newTicket.type !== "Invite" && (
//             <div className={styles.formSection}>
//               <Text className={styles.sectionTitle}>Availability</Text>
//               <Flex className={styles.unlimited}>
//                 <NumberInput
//                   style={{ flexGrow: 1 }}
//                   label="Quantity"
//                   placeholder="Enter number of tickets"
//                   value={
//                     isUnlimited ? undefined : (newTicket.quantity as number)
//                   }
//                   onChange={(value) =>
//                     handleTicketChange(
//                       "quantity",
//                       typeof value === "number" ? value : 0
//                     )
//                   }
//                   required={!isUnlimited}
//                   min={1}
//                   disabled={isUnlimited}
//                   className={styles.numberInput}
//                 />
//                 <Button
//                   type="button"
//                   onClick={toggleUnlimited}
//                   variant={isUnlimited ? "filled" : "outline"}
//                   className={styles.unlimitedButton}
//                 >
//                   {isUnlimited ? "Set Limit" : "Unlimited"}
//                 </Button>
//               </Flex>
//             </div>
//           )}

//           {newTicket.type === "Invite" && (
//             <div className={styles.formSection}>
//               <Text className={styles.sectionTitle}>Invitation Details</Text>
//               <TextInput
//                 label="Invite Email"
//                 placeholder="Enter email address for invitation"
//                 value={newTicket.inviteEmail || ""}
//                 onChange={(e) =>
//                   handleTicketChange("inviteEmail", e.currentTarget.value)
//                 }
//                 required
//                 type="email"
//                 className={styles.textInput}
//               />
//             </div>
//           )}

//           <Group justify="flex-end" mt="xl" className={styles.submitBtn}>
//             <Button
//               type="button"
//               variant="default"
//               onClick={handleCancel}
//               className={styles.cancelButton}
//               disabled={isLoading}
//             >
//               Cancel
//             </Button>
//             <Button
//               type="submit"
//               className={styles.submitButton}
//               disabled={isLoading}
//             >
//               Create Ticket
//             </Button>
//           </Group>
//         </Stack>
//       </form>
//     </Modal>
//   );
// };

// export default TicketModal;


"use client";

import React, { useState } from "react";
import {
  Modal,
  Button,
  TextInput,
  NumberInput,
  Radio,
  Group,
  Stack,
  Text,
  Flex,
  Alert,
  Switch,
  Collapse,
} from "@mantine/core";
import { IconInfoCircle } from '@tabler/icons-react';
import styles from "./ticketModal.module.css";
import { Ticket } from "../../store/types";
import { authenticatedRequest } from "../../app/services/auth";

interface TicketModalProps {
  isModalOpen: boolean;
  closeModal: () => void;
  addTicket: (
    ticket: Omit<Ticket, "id" | "category_price" | "category_name"> & {
      price: number;
      type: "Paid" | "Free" | "Invite";
      quantity: number | "Unlimited";
      inviteEmail?: string;
      enable_dynamic_pricing?: boolean;
      min_price?: number;
      max_price?: number;
    }
  ) => void;
  eventDetails: {
    title: string;
    description: string;
    location: string;
  };
}

const   TicketModal: React.FC<TicketModalProps> = ({
  isModalOpen,
  closeModal,
  addTicket,
  eventDetails,
}) => {
  const initialTicketState = {
    name: "",
    price: 0,
    quantity: 0 as number | "Unlimited",
    type: "Paid" as "Paid" | "Free" | "Invite",
    inviteEmail: "",
    enable_dynamic_pricing: false,
    min_price: undefined as number | undefined,
    max_price: undefined as number | undefined,
  };

  const [newTicket, setNewTicket] = useState(initialTicketState);
  const [isUnlimited, setIsUnlimited] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuggesting, setIsSuggesting] = useState<boolean>(false);
  const [suggestion, setSuggestion] = useState<{
    suggested_price: number;
    price_range: string | { min: number; max: number }; // Allow object or string
    reasoning: string;
  } | null>(null);
  const [suggestionError, setSuggestionError] = useState('');

  const handleTicketChange = (
    field: keyof typeof initialTicketState,
    value: any
  ) => {
    setNewTicket((prev) => ({ ...prev, [field]: value }));
  };

  const handleTicketTypeChange = (value: string) => {
    if (value === "Paid" || value === "Free" || value === "Invite") {
      const ticketType = value as "Paid" | "Free" | "Invite";
      setNewTicket((prev) => ({
        ...prev,
        type: ticketType,
        price: ticketType === "Free" ? 0 : prev.price,
        quantity:
          ticketType === "Invite"
            ? 1
            : isUnlimited
            ? "Unlimited"
            : prev.quantity,
        inviteEmail:
          ticketType === "Invite" ? prev.inviteEmail || "" : undefined,
      }));
      if (ticketType === "Invite") {
        setIsUnlimited(false);
      }
    }
  };

  const handleSuggestPrice = async () => {
    if (!eventDetails.title) {
      setSuggestionError("Please go back to Step 1 and enter an event title first.");
      return;
    }
    setIsSuggesting(true);
    setSuggestion(null);
    setSuggestionError('');
    try {
      const response = await authenticatedRequest<any>(
        `https://keupass-48c2ae65f897.herokuapp.com/api/suggest-ticket-price/`,
        "POST",
        {
          title: eventDetails.title,
          description: eventDetails.description,
          location: eventDetails.location,
        }
      );
      if (response) {
        setSuggestion(response);
      }
    } catch (error: any) {
      setSuggestionError(error.message || "Failed to fetch suggestion.");
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation logic
    if (!newTicket.name.trim()) {
      alert("Ticket name is required.");
      setIsLoading(false);
      return;
    }
    if (newTicket.enable_dynamic_pricing) {
        if (!newTicket.min_price || !newTicket.max_price) {
            alert("Please set a minimum and maximum price for dynamic pricing.");
            setIsLoading(false);
            return;
        }
        if (newTicket.min_price >= newTicket.max_price) {
            alert("Minimum price must be less than the maximum price.");
            setIsLoading(false);
            return;
        }
        if (newTicket.price < newTicket.min_price || newTicket.price > newTicket.max_price) {
            alert("The initial price must be between the minimum and maximum price limits.");
            setIsLoading(false);
            return;
        }
    }

    const ticketToAdd = {
      ...newTicket,
      quantity: isUnlimited ? "Unlimited" : Number(newTicket.quantity),
    };
    addTicket(ticketToAdd);
    
    // Reset state and close modal
    setNewTicket(initialTicketState);
    setIsUnlimited(false);
    setIsLoading(false);
    setSuggestion(null);
    setSuggestionError('');
    closeModal();
  };

  const priceParser = (value: string | undefined): string => {
    if (value === undefined) return "";
    return value.replace(/₦\s?|(,*)/g, "");
  };

  const priceFormatter = (value: string | undefined): string => {
    if (value === undefined || value === "") return "₦";
    const num = parseFloat(value);
    return !Number.isNaN(num)
      ? `₦ ${num.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : "₦ ";
  };

  const toggleUnlimited = () => {
    const currentlyUnlimited = !isUnlimited;
    setIsUnlimited(currentlyUnlimited);
    handleTicketChange("quantity", currentlyUnlimited ? "Unlimited" : 0);
  };

  const handleCancel = () => {
    setNewTicket(initialTicketState);
    setIsUnlimited(false);
    setSuggestion(null);
    setSuggestionError('');
    closeModal();
  };

  const formatPriceRange = (range: string | { min: number; max: number }): string => {
    if (typeof range === 'string') {
        return range;
    }
    if (typeof range === 'object' && range.min !== undefined && range.max !== undefined) {
        return `${priceFormatter(String(range.min))} - ${priceFormatter(String(range.max))}`;
    }
    return 'N/A';
  };

  return (
    <Modal
      opened={isModalOpen}
      onClose={isLoading ? () => {} : handleCancel}
      title={<Text fw={700} size="xl">Create New Ticket</Text>}
      centered
      size="lg"
      className={styles.modalContent}
      overlayProps={{ blur: 3, backgroundOpacity: 0.2 }}
      closeOnClickOutside={!isLoading}
      closeOnEscape={!isLoading}
    >
      <form onSubmit={handleSubmit}>
        <Stack spacing="lg">
          <div className={styles.formSection}>
            <Text className={styles.sectionTitle}>Basic Information</Text>
            <TextInput
              label="Ticket Name"
              placeholder="e.g., General Admission, VIP Pass"
              value={newTicket.name}
              onChange={(e) => handleTicketChange("name", e.currentTarget.value)}
              required
              maxLength={255}
              className={styles.textInput}
            />
            <Radio.Group
              name="ticketType"
              label="Ticket Type"
              value={newTicket.type}
              onChange={handleTicketTypeChange}
              required
              className={styles.radioGroup}
            >
              <Group mt="xs" className={styles.radioFlex}>
                <Radio value="Paid" label="Paid" />
                <Radio value="Free" label="Free" />
                <Radio value="Invite" label="By Invite" />
              </Group>
            </Radio.Group>
          </div>

          {newTicket.type === "Paid" && (
            <div className={styles.formSection}>
              <Text className={styles.sectionTitle}>Pricing</Text>
              <Flex className={styles.unlimited}>
                <NumberInput
                  style={{ flexGrow: 1 }}
                  label="Price"
                  placeholder="Enter ticket price"
                  value={newTicket.price}
                  onChange={(value) => handleTicketChange("price", typeof value === "number" ? value : 0)}
                  required
                  min={0.01}
                  step={0.01}
                  precision={2}
                  parser={priceParser}
                  formatter={priceFormatter}
                  className={styles.numberInput}
                />
                <Button
                    type="button"
                    variant="light"
                    onClick={handleSuggestPrice}
                    loading={isSuggesting}
                    leftIcon={<span>✨</span>}
                    className={styles.unlimitedButton}
                >
                    Suggest Price
                </Button>
              </Flex>
              
              {suggestionError && <Alert color="red" mt="md">{suggestionError}</Alert>}
    
              {suggestion && (
                  <Alert icon={<IconInfoCircle size={16} />} title="AI Suggestion" color="green" mt="md">
                      <Text size="sm">{suggestion.reasoning}</Text>
                      <Text size="sm" mt="xs">
                        <strong>Recommended Range:</strong> {formatPriceRange(suggestion.price_range)}
                      </Text>
                      <Text fw={700} mt="xs">
                        Our suggestion is {priceFormatter(suggestion.suggested_price.toString())}
                      </Text>
                      <Button
                          variant="outline"
                          size="xs"
                          mt="sm"
                          onClick={() => handleTicketChange('price', suggestion.suggested_price)}
                          className={styles.unlimitedButton}
                      >
                          Use This Price
                      </Button>
                  </Alert>
              )}

              {newTicket.price > 0 && (
                <div className={styles.priceDisplay}>
                  Total: {priceFormatter(newTicket.price.toString())}
                </div>
              )}
            </div>
          )}

          {newTicket.type === 'Paid' && (
            <div className={styles.formSection}>
                <Text className={styles.sectionTitle}>Advanced Settings</Text>
                <Switch
                    checked={newTicket.enable_dynamic_pricing}
                    onChange={(event) => handleTicketChange('enable_dynamic_pricing', event.currentTarget.checked)}
                    label="Enable AI Dynamic Pricing"
                    description="Automatically adjust ticket price based on sales velocity to maximize revenue."
                />
                <Collapse in={newTicket.enable_dynamic_pricing}>
                    <Flex >
                        <NumberInput
                            style={{ flex: 1 }}
                            label="Minimum Price"
                            description="Lowest price allowed."
                            placeholder="e.g., 5000"
                            value={newTicket.min_price}
                            onChange={(value) => handleTicketChange('min_price', value)}
                            parser={priceParser}
                            formatter={priceFormatter}
                            required={newTicket.enable_dynamic_pricing}
                        />
                        <NumberInput
                            style={{ flex: 1 }}
                            label="Maximum Price"
                            description="Highest price allowed."
                            placeholder="e.g., 20000"
                            value={newTicket.max_price}
                            onChange={(value) => handleTicketChange('max_price', value)}
                            parser={priceParser}
                            formatter={priceFormatter}
                            required={newTicket.enable_dynamic_pricing}
                        />
                    </Flex>
                </Collapse>
            </div>
          )}
          
          {newTicket.type !== "Invite" && (
            <div className={styles.formSection}>
              <Text className={styles.sectionTitle}>Availability</Text>
              <Flex className={styles.unlimited}>
                <NumberInput
                  style={{ flexGrow: 1 }}
                  label="Quantity"
                  placeholder="Enter number of tickets"
                  value={isUnlimited ? undefined : (newTicket.quantity as number)}
                  onChange={(value) => handleTicketChange("quantity", typeof value === "number" ? value : 0)}
                  required={!isUnlimited}
                  min={1}
                  disabled={isUnlimited}
                  className={styles.numberInput}
                />
                <Button
                  type="button"
                  onClick={toggleUnlimited}
                  variant={isUnlimited ? "filled" : "outline"}
                  className={styles.unlimitedButton}
                >
                  {isUnlimited ? "Set Limit" : "Unlimited"}
                </Button>
              </Flex>
            </div>
          )}

          {newTicket.type === "Invite" && (
            <div className={styles.formSection}>
              <Text className={styles.sectionTitle}>Invitation Details</Text>
              <TextInput
                label="Invite Email"
                placeholder="Enter email address for invitation"
                value={newTicket.inviteEmail || ""}
                onChange={(e) => handleTicketChange("inviteEmail", e.currentTarget.value)}
                required
                type="email"
                className={styles.textInput}
              />
            </div>
          )}

          <Group justify="flex-end" mt="xl" className={styles.submitBtn}>
            <Button
              type="button"
              variant="default"
              onClick={handleCancel}
              className={styles.cancelButton}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading}
            >
              Create Ticket
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default TicketModal;
