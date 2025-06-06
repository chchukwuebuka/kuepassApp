// "use client";
// import React, { useState, FormEvent, useEffect, useCallback } from "react";
// import styles from "./styles.module.css";
// import Navbar from "@/components/navbar";
// import DetailsStep from "../DetailsStep";
// import TicketsStep from "../TicketsStep";
// import StepIndicator from "../StepIndicator";
// import NavigationButtons from "../NavigationButtons/NavigationButtons";
// import TicketModal from "../Ticket/ticketModal";
// import { v4 as uuidv4 } from "uuid";
// import { EventFormData, Ticket, Question } from "../../store/types"; // Adjust path if needed
// import AppearanceStep from "../AppearanceStep";
// import {
//   Stack,
//   Text,
//   Button,
//   Modal,
//   Title,
//   Alert,
//   Tabs,
//   Loader,
//   Center,
// } from "@mantine/core";
// import { CustomQuestionsStep } from "../customQustion/CustomQuestionsStep Component"; // Adjust path
// import { authenticatedRequest, isAuthenticated } from "../../app/services/auth"; // Adjust path

// // Function to validate URLs
// const isValidUrl = (url: string): boolean => {
//   if (!url) return false;
//   try {
//     new URL(url);
//     return true;
//   } catch (error) {
//     return false;
//   }
// };

// // --- ADD/ENSURE isValidHex FUNCTION IS DEFINED HERE ---
// const isValidHex = (color: string): boolean => {
//   if (!color) return false; // Handle null or undefined case
//   return /^#[0-9A-Fa-f]{6}$/i.test(color);
// };
// // --- END OF isValidHex DEFINITION ---

// const API_BASE_URL =
//   process.env.NEXT_PUBLIC_API_BASE_URL ||
//   "https://keupass-48c2ae65f897.herokuapp.com/api";
// const DEFAULT_BANNER_URL = "/images/placeholder-banner.png";

// const FORM_STORAGE_KEY = "kuepassCreateEventFormDraft";

// const CreateEventForm: React.FC = () => {
//   const initialFormData: EventFormData = {
//     title: "",
//     description: "",
//     location: "Virtual",
//     startDate: "",
//     startTime: "",
//     endDate: "",
//     endTime: "",
//     tickets: [],
//     appearance: DEFAULT_BANNER_URL,
//     cardColor: "#025a3a",
//     questions: [],
//     address: "",
//     eventURL: "",
//     price: "0.00",
//   };

//   const [currentStep, setCurrentStep] = useState<number>(1);
//   const [formData, setFormData] = useState<EventFormData>(initialFormData);
//   const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [isInitializing, setIsInitializing] = useState<boolean>(true);
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);

//   useEffect(() => {
//     if (!isAuthenticated()) {
//       window.location.href = "/auth/signin?redirect=" + encodeURIComponent(window.location.pathname);
//       return;
//     }
//     console.log("CreateEventForm: Attempting to load draft from localStorage.");
//     const savedDraft = localStorage.getItem(FORM_STORAGE_KEY);
//     if (savedDraft) {
//       try {
//         const parsedDraft = JSON.parse(savedDraft);
//         if (
//           parsedDraft.formData &&
//           typeof parsedDraft.currentStep === "number"
//         ) {
//           console.log(
//             "CreateEventForm: Draft found, setting state.",
//             parsedDraft
//           );
//           const loadedFormData = {
//             ...initialFormData, // Start with defaults
//             ...parsedDraft.formData,
//             appearance:
//               parsedDraft.formData.appearance &&
//               parsedDraft.formData.appearance.startsWith("blob:")
//                 ? initialFormData.appearance
//                 : parsedDraft.formData.appearance || initialFormData.appearance,
//           };
//           setFormData(loadedFormData);
//           setCurrentStep(parsedDraft.currentStep);
//         } else {
//           console.log(
//             "CreateEventForm: Saved draft was in unexpected format, using initial."
//           );
//           setFormData(initialFormData);
//           setCurrentStep(1);
//         }
//       } catch (error) {
//         console.error(
//           "CreateEventForm: Error parsing draft from localStorage:",
//           error
//         );
//         setFormData(initialFormData);
//         setCurrentStep(1);
//       }
//     } else {
//       console.log(
//         "CreateEventForm: No draft found in localStorage, using initial."
//       );
//       setFormData(initialFormData);
//       setCurrentStep(1);
//     }
//     setSelectedFile(null);
//     setIsInitializing(false);
//   }, []);

//   useEffect(() => {
//     if (isInitializing || !isAuthenticated()) {
//       return;
//     }
//     console.log(
//       "CreateEventForm: Saving draft to localStorage. Step:",
//       currentStep
//     );
//     const draftToSave = {
//       formData: {
//         ...formData,
//         appearance: selectedFile
//           ? initialFormData.appearance
//           : formData.appearance,
//       },
//       currentStep,
//     };
//     localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(draftToSave));
//   }, [
//     formData,
//     currentStep,
//     isInitializing,
//     selectedFile,
//     initialFormData.appearance,
//   ]);

//   const createEvent = async (
//     data: Partial<
//       Omit<
//         EventFormData,
//         | "tickets"
//         | "questions"
//         | "appearance"
//         | "cardColor"
//         | "eventURL"
//         | "startDate"
//         | "startTime"
//         | "endDate"
//         | "endTime"
//       > & { start_date: string; end_date: string }
//     >
//   ) => {
//     const res = await authenticatedRequest<{
//       data: { id: string } & EventFormData;
//     }>(`${API_BASE_URL}/events/`, "POST", data);
//     if (!res || !res.data || !res.data.id)
//       throw new Error("Event creation failed or ID not returned by API.");
//     return res.data;
//   };

//   const createEventCustomization = async (data: {
//     event: string;
//     banner_url: string;
//     font: string;
//     card_color: string;
//     is_active: boolean;
//   }) => {
//     console.log(
//       "Event Customization Payload for event ID:",
//       data.event,
//       JSON.stringify(data, null, 2)
//     );
//     try {
//       // Assuming your backend /event-customizations/ POST endpoint handles upsert logic
//       // or you have separate POST for create and PUT/PATCH for update.
//       // For simplicity, if it's an upsert on POST:
//       await authenticatedRequest(
//         `${API_BASE_URL}/event-customizations/`, // Ensure this is your correct upsert/create endpoint
//         "POST",
//         data
//       );
//       console.log("Created/Upserted customization for event:", data.event);
//     } catch (error: any) {
//       console.error("Error saving event customization:", error);
//       throw new Error(error.message || "Failed to save event customization.");
//     }
//   };

//   const createQuestion = async (data: {
//     event_id: string;
//     type: string;
//     title: string;
//     required: boolean;
//     placeholder: string | null;
//     order: number;
//   }) => {
//     await authenticatedRequest(`${API_BASE_URL}/questions/`, "POST", data);
//   };

//   const createTicketType = async (data: {
//     event: string;
//     category_name: "Paid" | "Free" | "Invite";
//     category_price: number;
//     name: string;
//     quantity?: number | string | null;
//   }) => {
//     const payload = {
//       event: data.event,
//       category_name: data.category_name,
//       category_price: data.category_price.toFixed(2), // Backend expects string for DecimalField
//       name: data.name,
//       quantity:
//         data.quantity === "Unlimited" ? "Unlimited" : data.quantity?.toString(),
//     };
//     console.log("Ticket type payload for backend:", payload);
//     await authenticatedRequest(`${API_BASE_URL}/tickets/`, "POST", payload);
//   };

//   const uploadImage = async (file: File): Promise<string> => {
//     const formD = new FormData();
//     formD.append("image", file);
//     console.log("uploadImage: Calling backend /upload-image/");
//     const res = await authenticatedRequest<{
//       success: boolean;
//       message: string;
//       data?: { url: string };
//       url?: string;
//     }>( // Allow for direct url or nested
//       `${API_BASE_URL}/upload-image/`,
//       "POST",
//       formD
//     );
//     console.log("uploadImage: Response from backend:", res);
//     const imageUrl = res.data?.url || (res as any).url; // Handle both potential response structures
//     if (!res.success || !imageUrl)
//       throw new Error(
//         (res as any).message || "Image upload failed or URL not returned."
//       );
//     if (!isValidUrl(imageUrl))
//       throw new Error(`Invalid image URL from upload: ${imageUrl}`);
//     return imageUrl;
//   };

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) => {
//     const { id, value } = e.target;
//     setFormData((p) => ({ ...p, [id]: value }));
//   };
//   const handleLocationChange = (value: "Virtual" | "Physical") => {
//     setFormData((p) => ({
//       ...p,
//       location: value,
//       address: value === "Virtual" ? "" : p.address,
//     }));
//   };
//   const handleUpdateQuestions = (questions: Question[]) => {
//     setFormData((p) => ({ ...p, questions }));
//   };

//   const handleTicketTypeChange = (index: number, value: string) => {
//     const validTypes = ["Paid", "Free", "Invite"] as const;
//     if (!validTypes.includes(value as any)) return;
//     const updatedTickets = formData.tickets.map((t, i) => {
//       if (i === index) {
//         const updatedTicket = { ...t, type: value as Ticket["type"] };
//         if (value === "Free") updatedTicket.price = 0;
//         if (value !== "Invite") delete updatedTicket.inviteEmail;
//         return updatedTicket;
//       }
//       return t;
//     });
//     setFormData((prev) => ({ ...prev, tickets: updatedTickets }));
//   };
//   const handleSendInvite = (ticketId: string) => {
//     /* ... */
//   };

//   const addTicket = (ticketDataFromModal: Omit<Ticket, "id">) => {
//     const price = parseFloat(ticketDataFromModal.price.toString());
//     if (
//       isNaN(price) ||
//       (ticketDataFromModal.type === "Paid" && price < 0) ||
//       (ticketDataFromModal.type === "Free" && price !== 0)
//     ) {
//       alert("Please enter a valid ticket price.");
//       return;
//     }
//     if (!ticketDataFromModal.name) {
//       alert("Ticket name is required.");
//       return;
//     }

//     const newTicket: Ticket = {
//       ...ticketDataFromModal,
//       id: uuidv4(),
//       price: price,
//       quantity: ticketDataFromModal.quantity,
//     };
//     setFormData((p) => ({ ...p, tickets: [...p.tickets, newTicket] }));
//     setIsModalOpen(false);
//   };

//   const handleFileSelect = (file: File | null) => {
//     setSelectedFile(file);
//     if (file) {
//       setFormData((prev) => ({
//         ...prev,
//         appearance: URL.createObjectURL(file),
//       }));
//     } else if (initialFormData) {
//       setFormData((prev) => ({
//         ...prev,
//         appearance: initialFormData.appearance,
//       }));
//     }
//   };

//   const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     if (currentStep < 4) {
//       setCurrentStep((p) => p + 1);
//       return;
//     }

//     setIsLoading(true);
//     try {
//       if (!formData.title) throw new Error("Event title is required.");
//       if (formData.tickets.length === 0)
//         throw new Error("At least one ticket type is required.");

//       let finalBannerUrl = formData.appearance;
//       if (selectedFile) {
//         finalBannerUrl = await uploadImage(selectedFile);
//       } else if (formData.appearance.startsWith("blob:")) {
//         finalBannerUrl = initialFormData?.appearance || DEFAULT_BANNER_URL;
//       }

//       // Final check for banner URL validity before sending to backend
//       if (!isValidUrl(finalBannerUrl) || finalBannerUrl.startsWith("blob:")) {
//         finalBannerUrl = DEFAULT_BANNER_URL;
//         console.warn(
//           "handleSubmit: bannerUrl was invalid or blob after all checks, defaulting to placeholder."
//         );
//       }

//       // Validate cardColor before sending
//       if (!isValidHex(formData.cardColor)) {
//         // This is where the error was
//         throw new Error(
//           "Invalid card color format. Please use a 6-digit hex code (e.g., #RRGGBB)."
//         );
//       }

//       const eventApiPayload = {
//         title: formData.title,
//         description: formData.description,
//         location: formData.location,
//         start_date: `${formData.startDate}T${formData.startTime}:00Z`,
//         end_date: `${formData.endDate}T${formData.endTime}:00Z`,
//         price: formData.price,
//         is_active: true,
//         address: formData.address, // Include address if it's part of your Event model
//       };
//       const createdEvent = await createEvent(eventApiPayload);
//       const eventId = createdEvent.id;

//       setFormData((p) => ({
//         ...p,
//         eventURL: `${API_BASE_URL}/events/${eventId}`,
//       }));

//       await createEventCustomization({
//         event: eventId,
//         banner_url: finalBannerUrl,
//         font: "Arial", // Or get from formData.font if you add it
//         card_color: formData.cardColor,
//         is_active: true,
//       });

//       for (const q of formData.questions) {
//         await createQuestion({
//           event_id: eventId,
//           type: q.type || "text",
//           title: q.title,
//           required: q.required || false,
//           placeholder: q.placeholder || null,
//           order: q.order || 0,
//         });
//       }

//       for (const t of formData.tickets) {
//         await createTicketType({
//           event: eventId,
//           category_name: t.type,
//           category_price: t.type === "Free" ? 0 : Number(t.price),
//           name: t.name || "General Ticket",
//           quantity: t.quantity,
//         });
//       }

//       alert("Event created successfully!");
//       localStorage.removeItem(FORM_STORAGE_KEY);
//       setFormData(initialFormData);
//       setSelectedFile(null);
//       setCurrentStep(1);
//     } catch (err: any) {
//       console.error("Error creating event:", err);
//       alert(
//         err.message ||
//           "Failed to create event. Please check the form and try again."
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleBack = () => currentStep > 1 && setCurrentStep((p) => p - 1);

//   const renderStepContent = () => {
//     switch (currentStep) {
//       case 1:
//         return (
//           <DetailsStep
//             formData={formData}
//             handleChange={handleChange}
//             handleLocationChange={handleLocationChange}
//           />
//         );
//       case 2:
//         return (
//           <TicketsStep
//             tickets={formData.tickets}
//             openModal={() => setIsModalOpen(true)}
//             handleTicketTypeChange={handleTicketTypeChange}
//             handleSendInvite={handleSendInvite}
//           />
//         );
//       case 3:
//         return (
//           <CustomQuestionsStep
//             questions={formData.questions}
//             setQuestions={handleUpdateQuestions}
//           />
//         );
//       case 4:
//         return (
//           <AppearanceStep
//             formData={formData}
//             updateFormData={(u) => setFormData((p) => ({ ...p, ...u }))}
//             onFileSelect={handleFileSelect}
//           />
//         );
//       default:
//         return null;
//     }
//   };

//   if (isInitializing) {
//     return (
//       <Center style={{ height: "100vh" }}>
//         <Loader /> <Text ml="sm">Loading draft...</Text>
//       </Center>
//     );
//   }

//   return (
//     <div className={styles.formContainer}>
//       <Stack>
//         {" "}
//         <Navbar />{" "}
//       </Stack>
//       <h1 className={styles.title}>Create A New Event</h1>
//       <p className={styles.subtitle}>You are Just Four Steps Away!</p>
//       <StepIndicator currentStep={currentStep} totalSteps={4} />
//       <form onSubmit={handleSubmit} className={styles.eventForm}>
//         {renderStepContent()}
//         <NavigationButtons
//           currentStep={currentStep}
//           handleBack={handleBack}
//           isLastStep={currentStep === 4}
//           isLoading={isLoading}
//         />
//       </form>
//       <TicketModal
//         isModalOpen={isModalOpen}
//         closeModal={() => setIsModalOpen(false)}
//         addTicket={addTicket}
//       />
//     </div>
//   );
// };

// export default CreateEventForm;

// {
//   /* <Text> Lorem ipsum dolor sit, amet consectetur adipisicing elit. Eum eveniet error doloribus nobis officiis veritatis quas corporis nisi fugit. Porro hic non ut dolorum libero esse quasi quisquam cumque recusandae atque minus maiores ipsum labore fugiat id aspernatur exercitationem accusamus alias deserunt mollitia dignissimos vitae, suscipit facere. Animi, quam earum.</Text> */
// }



// components/CreateEventForm/CreateEventForm.tsx
// "use client";

// import React, { useState, FormEvent, useEffect } from "react";
// import styles from "./styles.module.css";
// import Navbar from "@/components/navbar";
// import DetailsStep from "../DetailsStep";
// import TicketsStep from "../TicketsStep";
// import StepIndicator from "../StepIndicator";
// import NavigationButtons from "../NavigationButtons/NavigationButtons";
// import TicketModal from "../Ticket/ticketModal";
// import { v4 as uuidv4 } from "uuid";
// import { EventFormData, Ticket, Question } from "../../store/types"; // Adjust path if needed
// import AppearanceStep from "../AppearanceStep";
// import {
//   Stack,
//   Text,
//   Button,
//   Loader,
//   Center,
// } from "@mantine/core";
// import { CustomQuestionsStep } from "../customQustion/CustomQuestionsStep Component"; // Adjust path
// import { authenticatedRequest, isAuthenticated } from "../../app/services/auth"; // Adjust path

// // Utility to validate URLs
// const isValidUrl = (url: string): boolean => {
//   if (!url) return false;
//   try {
//     new URL(url);
//     return true;
//   } catch (error) {
//     return false;
//   }
// };

// // Ensure valid hex code (for cardColor)
// const isValidHex = (color: string): boolean => {
//   if (!color) return false;
//   return /^#[0-9A-Fa-f]{6}$/i.test(color);
// };

// const API_BASE_URL =
//   process.env.NEXT_PUBLIC_API_BASE_URL ||
//   "https://keupass-48c2ae65f897.herokuapp.com/api";
// const DEFAULT_BANNER_URL = "/images/placeholder-banner.png";

// const FORM_STORAGE_KEY = "kuepassCreateEventFormDraft";

// export default function CreateEventForm() {
//   const initialFormData: EventFormData = {
//     title: "",
//     description: "",
//     location: "Virtual",
//     startDate: "",
//     startTime: "",
//     endDate: "",
//     endTime: "",
//     tickets: [],
//     appearance: DEFAULT_BANNER_URL,
//     cardColor: "#025a3a",
//     questions: [],
//     address: "",
//     eventURL: "",
//     price: "0.00",
//   };

//   const [currentStep, setCurrentStep] = useState<number>(1);
//   const [formData, setFormData] = useState<EventFormData>(initialFormData);
//   const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [isInitializing, setIsInitializing] = useState<boolean>(true);
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);

//   // On mount: load draft or redirect if not authenticated
//   useEffect(() => {
//     if (!isAuthenticated()) {
//       window.location.href =
//         "/auth/signin?redirect=" + encodeURIComponent(window.location.pathname);
//       return;
//     }
//     console.log("CreateEventForm: Attempting to load draft from localStorage.");
//     const savedDraft = localStorage.getItem(FORM_STORAGE_KEY);
//     if (savedDraft) {
//       try {
//         const parsedDraft = JSON.parse(savedDraft);
//         if (
//           parsedDraft.formData &&
//           typeof parsedDraft.currentStep === "number"
//         ) {
//           console.log(
//             "CreateEventForm: Draft found, setting state:",
//             parsedDraft
//           );
//           const loadedFormData = {
//             ...initialFormData,
//             ...parsedDraft.formData,
//             appearance:
//               parsedDraft.formData.appearance &&
//               parsedDraft.formData.appearance.startsWith("blob:")
//                 ? initialFormData.appearance
//                 : parsedDraft.formData.appearance ||
//                   initialFormData.appearance,
//           };
//           setFormData(loadedFormData);
//           setCurrentStep(parsedDraft.currentStep);
//         } else {
//           console.log(
//             "CreateEventForm: Saved draft was in unexpected format, using initial."
//           );
//           setFormData(initialFormData);
//           setCurrentStep(1);
//         }
//       } catch (error) {
//         console.error(
//           "CreateEventForm: Error parsing draft from localStorage:",
//           error
//         );
//         setFormData(initialFormData);
//         setCurrentStep(1);
//       }
//     } else {
//       console.log(
//         "CreateEventForm: No draft found in localStorage, using initial."
//       );
//       setFormData(initialFormData);
//       setCurrentStep(1);
//     }
//     setSelectedFile(null);
//     setIsInitializing(false);
//   }, []);

//   // Save draft whenever formData or currentStep changes (once initialized)
//   useEffect(() => {
//     if (isInitializing || !isAuthenticated()) {
//       return;
//     }
//     console.log(
//       "CreateEventForm: Saving draft to localStorage. Step:",
//       currentStep
//     );
//     const draftToSave = {
//       formData: {
//         ...formData,
//         appearance: selectedFile
//           ? initialFormData.appearance
//           : formData.appearance,
//       },
//       currentStep,
//     };
//     localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(draftToSave));
//   }, [
//     formData,
//     currentStep,
//     isInitializing,
//     selectedFile,
//     initialFormData.appearance,
//   ]);

//   // POST /events/
//   const createEvent = async (
//     data: Partial<
//       Omit<
//         EventFormData,
//         | "tickets"
//         | "questions"
//         | "appearance"
//         | "cardColor"
//         | "eventURL"
//         | "startDate"
//         | "startTime"
//         | "endDate"
//         | "endTime"
//       > & { start_date: string; end_date: string }
//     >
//   ) => {
//     const res = await authenticatedRequest<{
//       data: { id: string } & EventFormData;
//     }>(`${API_BASE_URL}/events/`, "POST", data);
//     if (!res || !res.data || !res.data.id)
//       throw new Error("Event creation failed or ID not returned by API.");
//     return res.data;
//   };

//   // POST /event-customizations/ (upsert)
//   const createEventCustomization = async (data: {
//     event: string;
//     banner_url: string;
//     font: string;
//     card_color: string;
//     is_active: boolean;
//   }) => {
//     console.log(
//       "Event Customization Payload for event ID:",
//       data.event,
//       JSON.stringify(data, null, 2)
//     );
//     try {
//       await authenticatedRequest(
//         `${API_BASE_URL}/event-customizations/`,
//         "POST",
//         data
//       );
//       console.log("Created/Upserted customization for event:", data.event);
//     } catch (error: any) {
//       console.error("Error saving event customization:", error);
//       throw new Error(error.message || "Failed to save event customization.");
//     }
//   };

//   // === HERE IS THE IMPORTANT CHANGE ===
//   // We now accept an `options` array of { text: string } for each question.
//   const createQuestion = async (data: {
//     event_id: string;
//     type: string;
//     title: string;
//     required: boolean;
//     placeholder: string | null;
//     order: number;
//     options?: { text: string }[];
//   }) => {
//     await authenticatedRequest(`${API_BASE_URL}/questions/`, "POST", data);
//   };
//   // === END IMPORTANT CHANGE ===

//   // POST /tickets/
//   const createTicketType = async (data: {
//     event: string;
//     category_name: "Paid" | "Free" | "Invite";
//     category_price: number;
//     name: string;
//     quantity?: number | string | null;
//   }) => {
//     const payload = {
//       event: data.event,
//       category_name: data.category_name,
//       category_price: data.category_price.toFixed(2), // backend expects string
//       name: data.name,
//       quantity:
//         data.quantity === "Unlimited" ? "Unlimited" : data.quantity?.toString(),
//     };
//     console.log("Ticket type payload for backend:", payload);
//     await authenticatedRequest(`${API_BASE_URL}/tickets/`, "POST", payload);
//   };

//   // Upload image to /upload-image/
//   const uploadImage = async (file: File): Promise<string> => {
//     const formD = new FormData();
//     formD.append("image", file);
//     console.log("uploadImage: Calling backend /upload-image/");
//     const res = await authenticatedRequest<{
//       success: boolean;
//       message: string;
//       data?: { url: string };
//       url?: string;
//     }>(`${API_BASE_URL}/upload-image/`, "POST", formD);
//     console.log("uploadImage: Response from backend:", res);
//     const imageUrl = res.data?.url || (res as any).url;
//     if (!res.success || !imageUrl)
//       throw new Error(
//         (res as any).message || "Image upload failed or URL not returned."
//       );
//     if (!isValidUrl(imageUrl))
//       throw new Error(`Invalid image URL from upload: ${imageUrl}`);
//     return imageUrl;
//   };

//   // Handle input changes for simple fields
//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) => {
//     const { id, value } = e.target;
//     setFormData((p) => ({ ...p, [id]: value }));
//   };
//   const handleLocationChange = (value: "Virtual" | "Physical") => {
//     setFormData((p) => ({
//       ...p,
//       location: value,
//       address: value === "Virtual" ? "" : p.address,
//     }));
//   };
//   const handleUpdateQuestions = (questions: Question[]) => {
//     setFormData((p) => ({ ...p, questions }));
//   };

//   // Handle adding a ticket from the modal
//   const addTicket = (ticketDataFromModal: Omit<Ticket, "id">) => {
//     const price = parseFloat(ticketDataFromModal.price.toString());
//     if (
//       isNaN(price) ||
//       (ticketDataFromModal.type === "Paid" && price < 0) ||
//       (ticketDataFromModal.type === "Free" && price !== 0)
//     ) {
//       alert("Please enter a valid ticket price.");
//       return;
//     }
//     if (!ticketDataFromModal.name) {
//       alert("Ticket name is required.");
//       return;
//     }

//     const newTicket: Ticket = {
//       ...ticketDataFromModal,
//       id: uuidv4(),
//       price: price,
//       quantity: ticketDataFromModal.quantity,
//     };
//     setFormData((p) => ({ ...p, tickets: [...p.tickets, newTicket] }));
//     setIsModalOpen(false);
//   };

//   // Handle file selection for banner
//   const handleFileSelect = (file: File | null) => {
//     setSelectedFile(file);
//     if (file) {
//       setFormData((prev) => ({
//         ...prev,
//         appearance: URL.createObjectURL(file),
//       }));
//     } else {
//       setFormData((prev) => ({
//         ...prev,
//         appearance: initialFormData.appearance,
//       }));
//     }
//   };

//   // === MAIN SUBMIT HANDLER ===
//   const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     // If not last step, just advance
//     if (currentStep < 4) {
//       setCurrentStep((p) => p + 1);
//       return;
//     }

//     setIsLoading(true);
//     try {
//       if (!formData.title) throw new Error("Event title is required.");
//       if (formData.tickets.length === 0)
//         throw new Error("At least one ticket type is required.");

//       let finalBannerUrl = formData.appearance;
//       if (selectedFile) {
//         finalBannerUrl = await uploadImage(selectedFile);
//       } else if (formData.appearance.startsWith("blob:")) {
//         finalBannerUrl = initialFormData.appearance || DEFAULT_BANNER_URL;
//       }

//       // Validate banner URL
//       if (!isValidUrl(finalBannerUrl) || finalBannerUrl.startsWith("blob:")) {
//         finalBannerUrl = DEFAULT_BANNER_URL;
//         console.warn(
//           "handleSubmit: bannerUrl invalid or blob. Defaulting to placeholder."
//         );
//       }

//       // Validate cardColor hex
//       if (!isValidHex(formData.cardColor)) {
//         throw new Error(
//           "Invalid card color format. Please use a 6-digit hex code (e.g. #RRGGBB)."
//         );
//       }

//       // 1) Create base event
//       const eventApiPayload = {
//         title: formData.title,
//         description: formData.description,
//         location: formData.location,
//         start_date: `${formData.startDate}T${formData.startTime}:00Z`,
//         end_date: `${formData.endDate}T${formData.endTime}:00Z`,
//         price: formData.price,
//         is_active: true,
//         address: formData.address,
//       };
//       const createdEvent = await createEvent(eventApiPayload);
//       const eventId = createdEvent.id;

//       // Save the full eventURL in state
//       setFormData((p) => ({
//         ...p,
//         eventURL: `${API_BASE_URL}/events/${eventId}`,
//       }));

//       // 2) Create event customization (banner + cardColor)
//       await createEventCustomization({
//         event: eventId,
//         banner_url: finalBannerUrl,
//         font: "Arial",
//         card_color: formData.cardColor,
//         is_active: true,
//       });

//       // 3) Create each question, plus its options
//       for (const q of formData.questions) {
//         // Build an options array of { text: string } for the POST payload
//         const optionPayload = q.options?.map((opt) => ({
//           text: opt.text,
//         })) || [];

//         await createQuestion({
//           event_id: eventId,
//           type: q.type || "text",
//           title: q.title,
//           required: q.required || false,
//           placeholder: q.placeholder || null,
//           order: q.order || 0,
//           options: optionPayload, // <-- passing options here
//         });
//       }

//       // 4) Create each ticket type
//       for (const t of formData.tickets) {
//         await createTicketType({
//           event: eventId,
//           category_name: t.type,
//           category_price: t.type === "Free" ? 0 : Number(t.price),
//           name: t.name || "General Ticket",
//           quantity: t.quantity,
//         });
//       }

//       alert("Event created successfully!");
//       localStorage.removeItem(FORM_STORAGE_KEY);
//       setFormData(initialFormData);
//       setSelectedFile(null);
//       setCurrentStep(1);
//     } catch (err: any) {
//       console.error("Error creating event:", err);
//       alert(
//         err.message || "Failed to create event. Please check the form and try again."
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };
//   // === END SUBMIT HANDLER ===

//   const handleBack = () => currentStep > 1 && setCurrentStep((p) => p - 1);

//   // Conditionally render each step
//   const renderStepContent = () => {
//     switch (currentStep) {
//       case 1:
//         return (
//           <DetailsStep
//             formData={formData}
//             handleChange={handleChange}
//             handleLocationChange={handleLocationChange}
//           />
//         );
//       case 2:
//         return (
//           <TicketsStep
//             tickets={formData.tickets}
//             openModal={() => setIsModalOpen(true)}
//             handleTicketTypeChange={(i, v) => {
//               /* you already had this logic elsewhere */
//             }}
//             handleSendInvite={(tId) => {
//               /* ... */
//             }}
//           />
//         );
//       case 3:
//         return (
//           <CustomQuestionsStep
//             questions={formData.questions}
//             setQuestions={handleUpdateQuestions}
//           />
//         );
//       case 4:
//         return (
//           <AppearanceStep
//             formData={formData}
//             updateFormData={(u) => setFormData((p) => ({ ...p, ...u }))}
//             onFileSelect={handleFileSelect}
//           />
//         );
//       default:
//         return null;
//     }
//   };

//   if (isInitializing) {
//     return (
//       <Center style={{ height: "100vh" }}>
//         <Loader /> <Text ml="sm">Loading draft…</Text>
//       </Center>
//     );
//   }

//   return (
//     <div className={styles.formContainer}>
//       <Stack>
//         <Navbar />
//       </Stack>
//       <h1 className={styles.title}>Create A New Event</h1>
//       <p className={styles.subtitle}>You are Just Four Steps Away!</p>
//       <StepIndicator currentStep={currentStep} totalSteps={4} />
//       <form onSubmit={handleSubmit} className={styles.eventForm}>
//         {renderStepContent()}
//         <NavigationButtons
//           currentStep={currentStep}
//           handleBack={handleBack}
//           isLastStep={currentStep === 4}
//           isLoading={isLoading}
//         />
//       </form>
//       <TicketModal
//         isModalOpen={isModalOpen}
//         closeModal={() => setIsModalOpen(false)}
//         addTicket={addTicket}
//       />
//     </div>
//   );
// }






// components/CreateEventForm/CreateEventForm.tsx
"use client";

import React, { useState, FormEvent, useEffect } from "react";
import styles from "./styles.module.css";
import Navbar from "@/components/navbar";
import DetailsStep from "../DetailsStep";
import TicketsStep from "../TicketsStep";
import StepIndicator from "../StepIndicator";
import NavigationButtons from "../NavigationButtons/NavigationButtons";
import TicketModal from "../Ticket/ticketModal";
import { v4 as uuidv4 } from "uuid";
// Ensure Question and Option types are correctly defined here and support option.order
import { EventFormData, Ticket, Question, Option } from "../../store/types"; 
import AppearanceStep from "../AppearanceStep";
import {
  Stack,
  Text,
  Button,
  Loader,
  Center,
} from "@mantine/core";
import { CustomQuestionsStep } from "../customQustion/CustomQuestionsStep Component"; 
import { authenticatedRequest, isAuthenticated } from "../../app/services/auth"; 

// ... (isValidUrl, isValidHex, API_BASE_URL, DEFAULT_BANNER_URL, FORM_STORAGE_KEY remain the same) ...
const isValidUrl = (url: string): boolean => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};
const isValidHex = (color: string): boolean => {
  if (!color) return false;
  return /^#[0-9A-Fa-f]{6}$/i.test(color);
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://keupass-48c2ae65f897.herokuapp.com/api"; // Use localhost for local testing
const DEFAULT_BANNER_URL = "/images/placeholder-banner.png";
const FORM_STORAGE_KEY = "kuepassCreateEventFormDraft";


export default function CreateEventForm() {
  const initialFormData: EventFormData = {
    title: "",
    description: "",
    location: "Virtual",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    tickets: [],
    appearance: DEFAULT_BANNER_URL,
    cardColor: "#025a3a",
    questions: [],
    address: "",
    eventURL: "",
    price: "0.00",
  };

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<EventFormData>(initialFormData);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // ... (useEffect for loading draft remains the same) ...
  useEffect(() => {
    if (!isAuthenticated()) {
      window.location.href =
        "/auth/signin?redirect=" + encodeURIComponent(window.location.pathname);
      return;
    }
    // console.log("CreateEventForm: Attempting to load draft from localStorage.");
    const savedDraft = localStorage.getItem(FORM_STORAGE_KEY);
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
        if (
          parsedDraft.formData &&
          typeof parsedDraft.currentStep === "number"
        ) {
          // console.log(
          //   "CreateEventForm: Draft found, setting state:",
          //   parsedDraft
          // );
          const loadedFormData = {
            ...initialFormData,
            ...parsedDraft.formData,
            appearance:
              parsedDraft.formData.appearance &&
              parsedDraft.formData.appearance.startsWith("blob:")
                ? initialFormData.appearance
                : parsedDraft.formData.appearance ||
                  initialFormData.appearance,
          };
          setFormData(loadedFormData);
          setCurrentStep(parsedDraft.currentStep);
        } else {
          // console.log(
          //   "CreateEventForm: Saved draft was in unexpected format, using initial."
          // );
          setFormData(initialFormData);
          setCurrentStep(1);
        }
      } catch (error) {
        // console.error(
        //   "CreateEventForm: Error parsing draft from localStorage:",
        //   error
        // );
        setFormData(initialFormData);
        setCurrentStep(1);
      }
    } else {
      // console.log(
      //   "CreateEventForm: No draft found in localStorage, using initial."
      // );
      setFormData(initialFormData);
      setCurrentStep(1);
    }
    setSelectedFile(null);
    setIsInitializing(false);
  }, []);

  // ... (useEffect for saving draft remains the same) ...
  useEffect(() => {
    if (isInitializing || !isAuthenticated()) {
      return;
    }
    // console.log(
    //   "CreateEventForm: Saving draft to localStorage. Step:",
    //   currentStep
    // );
    const draftToSave = {
      formData: {
        ...formData,
        appearance: selectedFile
          ? initialFormData.appearance
          : formData.appearance,
      },
      currentStep,
    };
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(draftToSave));
  }, [
    formData,
    currentStep,
    isInitializing,
    selectedFile,
    initialFormData.appearance,
  ]);

  // ... (createEvent, createEventCustomization, createTicketType, uploadImage remain the same) ...
  const createEvent = async (
    data: Partial<
      Omit<
        EventFormData,
        | "tickets"
        | "questions"
        | "appearance"
        | "cardColor"
        | "eventURL"
        | "startDate"
        | "startTime"
        | "endDate"
        | "endTime"
      > & { start_date: string; end_date: string }
    >
  ) => {
    const res = await authenticatedRequest<{
      data: { id: string } & EventFormData;
    }>(`${API_BASE_URL}/events/`, "POST", data);
    if (!res || !res.data || !res.data.id)
      throw new Error("Event creation failed or ID not returned by API.");
    return res.data;
  };

  const createEventCustomization = async (data: {
    event: string;
    banner_url: string;
    font: string;
    card_color: string;
    is_active: boolean;
  }) => {
    // console.log(
    //   "Event Customization Payload for event ID:",
    //   data.event,
    //   JSON.stringify(data, null, 2)
    // );
    try {
      await authenticatedRequest(
        `${API_BASE_URL}/event-customizations/`,
        "POST",
        data
      );
      // console.log("Created/Upserted customization for event:", data.event);
    } catch (error: any) {
      console.error("Error saving event customization:", error);
      throw new Error(error.message || "Failed to save event customization.");
    }
  };

  const createTicketType = async (data: {
    event: string;
    category_name: "Paid" | "Free" | "Invite";
    category_price: number;
    name: string;
    quantity?: number | string | null;
  }) => {
    const payload = {
      event: data.event,
      category_name: data.category_name,
      category_price: data.category_price.toFixed(2),
      name: data.name,
      quantity:
        data.quantity === "Unlimited" ? "Unlimited" : data.quantity?.toString(),
    };
    // console.log("Ticket type payload for backend:", payload);
    await authenticatedRequest(`${API_BASE_URL}/tickets/`, "POST", payload);
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formD = new FormData();
    formD.append("image", file);
    // console.log("uploadImage: Calling backend /upload-image/");
    const res = await authenticatedRequest<{
      success: boolean;
      message: string;
      data?: { url: string };
      url?: string;
    }>(`${API_BASE_URL}/upload-image/`, "POST", formD);
    // console.log("uploadImage: Response from backend:", res);
    const imageUrl = res.data?.url || (res as any).url;
    if (!res.success || !imageUrl)
      throw new Error(
        (res as any).message || "Image upload failed or URL not returned."
      );
    if (!isValidUrl(imageUrl))
      throw new Error(`Invalid image URL from upload: ${imageUrl}`);
    return imageUrl;
  };


  // --- UPDATED createQuestion function type definition ---
  const createQuestion = async (data: {
    event_id: string;
    type: string;
    title: string;
    required: boolean;
    placeholder: string | null;
    order: number; // Order of the question itself
    options?: { text: string; order?: number }[]; // Options can now include their own order
  }) => {
    await authenticatedRequest(`${API_BASE_URL}/questions/`, "POST", data);
  };
  // --- END OF UPDATED createQuestion ---


  // ... (handleChange, handleLocationChange, addTicket, handleFileSelect remain the same) ...
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((p) => ({ ...p, [id]: value }));
  };
  const handleLocationChange = (value: "Virtual" | "Physical") => {
    setFormData((p) => ({
      ...p,
      location: value,
      address: value === "Virtual" ? "" : p.address,
    }));
  };

  const addTicket = (ticketDataFromModal: Omit<Ticket, "id">) => {
    const price = parseFloat(ticketDataFromModal.price.toString());
    if (
      isNaN(price) ||
      (ticketDataFromModal.type === "Paid" && price < 0) ||
      (ticketDataFromModal.type === "Free" && price !== 0)
    ) {
      alert("Please enter a valid ticket price.");
      return;
    }
    if (!ticketDataFromModal.name) {
      alert("Ticket name is required.");
      return;
    }

    const newTicket: Ticket = {
      ...ticketDataFromModal,
      id: uuidv4(),
      price: price,
      quantity: ticketDataFromModal.quantity,
    };
    setFormData((p) => ({ ...p, tickets: [...p.tickets, newTicket] }));
    setIsModalOpen(false);
  };

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    if (file) {
      setFormData((prev) => ({
        ...prev,
        appearance: URL.createObjectURL(file),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        appearance: initialFormData.appearance,
      }));
    }
  };

  // This function is passed to CustomQuestionsStep to update formData
  const handleUpdateQuestions = (questions: Question[]) => {
    setFormData((p) => ({ ...p, questions }));
  };


  // === MAIN SUBMIT HANDLER ===
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (currentStep < 4) {
      setCurrentStep((p) => p + 1);
      return;
    }

    setIsLoading(true);
    try {
      if (!formData.title) throw new Error("Event title is required.");
      if (formData.tickets.length === 0)
        throw new Error("At least one ticket type is required.");

      let finalBannerUrl = formData.appearance;
      if (selectedFile) {
        finalBannerUrl = await uploadImage(selectedFile);
      } else if (formData.appearance.startsWith("blob:")) {
        finalBannerUrl = initialFormData.appearance || DEFAULT_BANNER_URL;
      }

      if (!isValidUrl(finalBannerUrl) || finalBannerUrl.startsWith("blob:")) {
        finalBannerUrl = DEFAULT_BANNER_URL;
        // console.warn(
        //   "handleSubmit: bannerUrl invalid or blob. Defaulting to placeholder."
        // );
      }

      if (!isValidHex(formData.cardColor)) {
        throw new Error(
          "Invalid card color format. Please use a 6-digit hex code (e.g. #RRGGBB)."
        );
      }

      const eventApiPayload = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        start_date: `${formData.startDate}T${formData.startTime}:00Z`,
        end_date: `${formData.endDate}T${formData.endTime}:00Z`,
        price: formData.price,
        is_active: true,
        address: formData.address,
      };
      const createdEvent = await createEvent(eventApiPayload);
      const eventId = createdEvent.id;

      setFormData((p) => ({
        ...p,
        eventURL: `${API_BASE_URL}/events/${eventId}`,
      }));

      await createEventCustomization({
        event: eventId,
        banner_url: finalBannerUrl,
        font: "Arial",
        card_color: formData.cardColor,
        is_active: true,
      });

      // --- UPDATED LOOP FOR CREATING QUESTIONS ---
      for (const [questionIndex, q] of formData.questions.entries()) {
        // q is a Question object, q.options should be Option[]
        const optionPayload = q.options?.map((opt, optIndex) => ({ // opt is an Option object
          text: opt.text,
          // Send the order of the option if it exists in your 'opt' object,
          // otherwise the backend will use the array index as a fallback.
          // Your CustomQuestionsStep needs to ensure opt.order is set if you want explicit ordering.
          order: typeof opt.order === 'number' ? opt.order : optIndex,
        })) || [];

        const questionPayloadForApi = {
          event_id: eventId,
          type: q.type || "text",
          title: q.title,
          required: q.required || false,
          placeholder: q.placeholder || null,
          order: typeof q.order === 'number' ? q.order : questionIndex, // Order of the question itself
          options: optionPayload,
        };
        
        // **** THIS IS THE CRITICAL CONSOLE.LOG FOR TESTING ****
        console.log("Frontend: Sending this question to POST /api/questions/:", JSON.stringify(questionPayloadForApi, null, 2));
        // *******************************************************

        await createQuestion(questionPayloadForApi);
      }
      // --- END OF UPDATED LOOP ---

      for (const t of formData.tickets) {
        await createTicketType({
          event: eventId,
          category_name: t.type,
          category_price: t.type === "Free" ? 0 : Number(t.price),
          name: t.name || "General Ticket",
          quantity: t.quantity,
        });
      }

      alert("Event created successfully!");
      localStorage.removeItem(FORM_STORAGE_KEY);
      setFormData(initialFormData);
      setSelectedFile(null);
      setCurrentStep(1);
    } catch (err: any) {
      console.error("Error creating event:", err);
      alert(
        err.message || "Failed to create event. Please check the form and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => currentStep > 1 && setCurrentStep((p) => p - 1);

  // ... (renderStepContent, loading states, and JSX return remain largely the same) ...
  // Ensure CustomQuestionsStep is correctly passing updated questions (with options and their orders)
  // to handleUpdateQuestions.
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <DetailsStep
            formData={formData}
            handleChange={handleChange}
            handleLocationChange={handleLocationChange}
          />
        );
      case 2:
        return (
          <TicketsStep
            tickets={formData.tickets}
            openModal={() => setIsModalOpen(true)}
            handleTicketTypeChange={(index, value) => {
              // Implement or ensure this logic is present
              const validTypes = ["Paid", "Free", "Invite"] as const;
              if (!validTypes.includes(value as any)) return;
              const updatedTickets = formData.tickets.map((t, i) => {
                if (i === index) {
                  const updatedTicket = { ...t, type: value as Ticket["type"] };
                  if (value === "Free") updatedTicket.price = 0;
                  // if (value !== "Invite") delete updatedTicket.inviteEmail; // If you have inviteEmail
                  return updatedTicket;
                }
                return t;
              });
              setFormData((prev) => ({ ...prev, tickets: updatedTickets }));
            }}
            handleSendInvite={(ticketId: string) => {
              /* ... */
            }}
          />
        );
      case 3:
        return (
          <CustomQuestionsStep // This component manages `formData.questions`
            questions={formData.questions}
            setQuestions={handleUpdateQuestions} // Ensure this updates questions with their options & option orders
          />
        );
      case 4:
        return (
          <AppearanceStep
            formData={formData}
            updateFormData={(u) => setFormData((p) => ({ ...p, ...u }))}
            onFileSelect={handleFileSelect}
          />
        );
      default:
        return null;
    }
  };

  if (isInitializing) {
    return (
      <Center style={{ height: "100vh" }}>
        <Loader /> <Text ml="sm">Loading draft…</Text>
      </Center>
    );
  }

  return (
    <div className={styles.formContainer}>
      <Stack>
        <Navbar />
      </Stack>
      <h1 className={styles.title}>Create A New Event</h1>
      <p className={styles.subtitle}>You are Just Four Steps Away!</p>
      <StepIndicator currentStep={currentStep} totalSteps={4} />
      <form onSubmit={handleSubmit} className={styles.eventForm}>
        {renderStepContent()}
        <NavigationButtons
          currentStep={currentStep}
          handleBack={handleBack}
          isLastStep={currentStep === 4}
          isLoading={isLoading}
        />
      </form>
      <TicketModal
        isModalOpen={isModalOpen}
        closeModal={() => setIsModalOpen(false)}
        addTicket={addTicket}
      />
    </div>
  );
}