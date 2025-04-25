
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
// import { EventFormData, Ticket, Question } from "../../store/types";
// import AppearanceStep from "../AppearanceStep";
// import { Stack } from "@mantine/core";
// import { CustomQuestionsStep } from "../customQustion/CustomQuestionsStep Component";
// import { authenticatedRequest, getAuthToken, isAuthenticated } from "../../app/services/auth";

// // Use environment variable for API base URL
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://keupass-48c2ae65f897.herokuapp.com/api";

// // Default banner URL for invalid or empty input
// const DEFAULT_BANNER_URL = "https://via.placeholder.com/150";

// const CreateEventForm: React.FC = () => {
//   const [currentStep, setCurrentStep] = useState<number>(1);
//   const [formData, setFormData] = useState<EventFormData>({
//     title: "",
//     description: "",
//     location: "Virtual",
//     startDate: "",
//     startTime: "",
//     endDate: "",
//     endTime: "",
//     tickets: [],
//     appearance: "",
//     cardColor: "#FF0000",
//     questions: [],
//     address: "",
//     eventURL: "",
//     price: "0.00"
//   });
//   const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [events, setEvents] = useState<any[]>([]);
//   const [selectedFile, setSelectedFile] = useState<File | null>(null); // Track selected file

//   // Redirect to login if not authenticated
//   useEffect(() => {
//     if (!isAuthenticated()) {
//       window.location.href = "/login";
//     }
//     console.log("API_BASE_URL:", API_BASE_URL);
//     console.log("Access Token:", getAuthToken());
//   }, []);

//   // API utility functions
//   const fetchEvents = async () => {
//     try {
//       console.log("Fetching events with token:", getAuthToken());
//       const response = await authenticatedRequest<{ data: any[] }>(`${API_BASE_URL}/events/`, "GET");
//       return response.data;
//     } catch (error: any) {
//       console.error("Error fetching events:", {
//         message: error.message,
//         status: error.status,
//         data: error.data
//       });
//       throw error;
//     }
//   };

//   const createEvent = async (eventData: Partial<EventFormData>): Promise<any> => {
//     try {
//       console.log("Attempting to create event at:", `${API_BASE_URL}/events/`);
//       console.log("Event payload:", JSON.stringify(eventData, null, 2));
//       console.log("Using Access Token:", getAuthToken());
//       const response = await authenticatedRequest<{ data: any }>(
//         `${API_BASE_URL}/events/`,
//         "POST",
//         eventData
//       );
//       return response.data;
//     } catch (error: any) {
//       console.error("Error creating event:", {
//         message: error.message,
//         status: error.status,
//         data: error.data,
//         url: `${API_BASE_URL}/events/`
//       });
//       throw error;
//     }
//   };

//   const createEventCustomization = async (customizationData: { event: string; banner_url: string | null; font: string }) => {
//     try {
//       console.log("Attempting to create customization at:", `${API_BASE_URL}/event-customizations/`);
//       console.log("Customization payload:", JSON.stringify(customizationData, null, 2));
//       const response = await authenticatedRequest<{ data: any }>(
//         `${API_BASE_URL}/event-customizations/`,
//         "POST",
//         customizationData
//       );
//       return response.data;
//     } catch (error: any) {
//       console.error("Error creating event customization:", {
//         message: error.message,
//         status: error.status,
//         data: error.data
//       });
//       throw error;
//     }
//   };

//   const createQuestion = async (questionData: Question & { event_id: string }) => {
//     try {
//       console.log("Attempting to create question at:", `${API_BASE_URL}/questions/`);
//       console.log("Question payload:", JSON.stringify(questionData, null, 2));
//       const response = await authenticatedRequest<{ data: any }>(
//         `${API_BASE_URL}/questions/`,
//         "POST",
//         questionData
//       );
//       return response.data;
//     } catch (error: any) {
//       console.error("Error creating question:", {
//         message: error.message,
//         status: error.status,
//         data: error.data
//       });
//       throw error;
//     }
//   };

//   const createPaymentRequest = async (ticketData: { event_id: string; category_name: string; category_price: string; event_title: string; full_name: string }) => {
//     try {
//       // Validate ticket data
//       if (!ticketData.category_name || !["Paid", "Free", "Invite"].includes(ticketData.category_name)) {
//         throw new Error(`Invalid ticket category name: ${ticketData.category_name}. Must be Paid, Free, or Invite.`);
//       }
//       if (!ticketData.category_price || isNaN(Number(ticketData.category_price))) {
//         throw new Error(`Invalid ticket price: ${ticketData.category_price}. Must be a valid number.`);
//       }
//       console.log("Attempting to create payment request at:", `${API_BASE_URL}/payment-requests/`);
//       console.log("Payment request payload:", JSON.stringify(ticketData, null, 2));
//       const response = await authenticatedRequest<{ data: any }>(
//         `${API_BASE_URL}/payment-requests/`,
//         "POST",
//         ticketData
//       );
//       return response.data;
//     } catch (error: any) {
//       console.error("Error creating payment request:", {
//         message: error.message,
//         status: error.status,
//         data: error.data
//       });
//       throw error;
//     }
//   };

//   const uploadImage = async (file: File): Promise<string> => {
//     try {
//       const formData = new FormData();
//       formData.append("image", file);
//       console.log("Uploading image:", {
//         name: file.name,
//         size: file.size,
//         type: file.type,
//       });
//       console.log("FormData contents:", [...formData.entries()]);

//       const response = await authenticatedRequest<{
//         success: boolean;
//         message: string;
//         data: { url: string };
//         error_code?: string;
//       }>(`${API_BASE_URL}/upload-image/`, "POST", formData);

//       if (!response.success) {
//         throw new Error(response.message || "Image upload failed.");
//       }

//       console.log("Image uploaded successfully:", response.data.url);
//       return response.data.url;
//     } catch (error: any) {
//       console.error("Image upload error:", {
//         message: error.message,
//         status: error.status,
//         data: error.data,
//       });
//       throw new Error(`Image upload failed: ${error.message || "Please try again."}`);
//     }
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { id, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [id]: value
//     }));
//   };

//   const handleLocationChange = (value: "Virtual" | "Physical") => {
//     setFormData((prev) => ({
//       ...prev,
//       location: value
//     }));
//   };

//   const handleUpdateQuestions = (questions: Question[]) => {
//     setFormData((prev) => ({
//       ...prev,
//       questions
//     }));
//   };

//   const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
//     console.log("Form submission triggered", e);
//     e.preventDefault();

//     if (currentStep === 1) {
//       const start = new Date(`${formData.startDate}T${formData.startTime}`);
//       const end = new Date(`${formData.endDate}T${formData.endTime}`);

//       if (end <= start) {
//         alert("End date and time must be after start date and time.");
//         return;
//       }
//     }

//     if (currentStep < 4) {
//       setCurrentStep((prev) => prev + 1);
//     } else {
//       setIsLoading(true);
//       try {
//         // Validate required fields
//         if (!formData.title) {
//           throw new Error("Event title is required.");
//         }
//         if (!formData.description) {
//           throw new Error("Event description is required.");
//         }
//         if (!formData.location) {
//           throw new Error("Event location is required.");
//         }
//         if (!formData.startDate || !formData.startTime) {
//           throw new Error("Start date and time are required.");
//         }
//         if (!formData.endDate || !formData.endTime) {
//           throw new Error("End date and time are required.");
//         }
//         if (!formData.price) {
//           throw new Error("Event price is required.");
//         }

//         // Step 0: Upload image if selected
//         let imageUrl: string | null = null;
//         if (selectedFile) {
//           imageUrl = await uploadImage(selectedFile);
//           setFormData((prev) => ({ ...prev, appearance: imageUrl }));
//         }

//         // Step 1: Create the event
//         const eventData = {
//           title: formData.title,
//           description: formData.description,
//           location: formData.location,
//           start_date: `${formData.startDate}T${formData.startTime}:00Z`,
//           end_date: `${formData.endDate}T${formData.endTime}:00Z`,
//           price: formData.price,
//           is_active: true
//         };

//         const eventResponse = await createEvent(eventData);
//         const eventId = eventResponse.id;

//         // Step 2: Create event customization
//         if (imageUrl || formData.cardColor) {
//           let bannerUrl: string | null = imageUrl || formData.appearance || null;
//           if (bannerUrl) {
//             try {
//               new URL(bannerUrl); // Validate URL
//               if (bannerUrl.length > 500) {
//                 bannerUrl = bannerUrl.substring(0, 500);
//               }
//             } catch {
//               console.warn(`Invalid banner URL: ${bannerUrl}, setting to null.`);
//               bannerUrl = null;
//             }
//           }

//           const customizationData = {
//             event: eventId,
//             banner_url: bannerUrl || DEFAULT_BANNER_URL,
//             font: "default"
//           };
//           await createEventCustomization(customizationData);
//         }

//         // Step 3: Create questions
//         if (formData.questions.length > 0) {
//           for (const question of formData.questions) {
//             const questionData = {
//               event_id: eventId,
//               type: question.type || "text",
//               title: question.title,
//               required: question.required || false,
//               placeholder: question.placeholder || null,
//               order: question.order || 0
//             };
//             await createQuestion(questionData);
//           }
//         }

//         // Step 4: Create payment requests for tickets
//         if (formData.tickets.length > 0) {
//           for (const ticket of formData.tickets) {
//             const ticketData = {
//               event_id: eventId,
//               category_name: ticket.type,
//               category_price: ticket.price ? ticket.price.toFixed(2) : "0.00",
//               event_title: formData.title,
//               full_name: "Attendee"
//             };
//             await createPaymentRequest(ticketData);
//           }
//         }

//         alert("Event created successfully!");
//         setFormData({
//           title: "",
//           description: "",
//           location: "Virtual",
//           startDate: "",
//           startTime: "",
//           endDate: "",
//           endTime: "",
//           tickets: [],
//           appearance: "",
//           cardColor: "#FF0000",
//           questions: [],
//           address: "",
//           eventURL: "",
//           price: "0.00"
//         });
//         setSelectedFile(null); // Reset selected file
//         setCurrentStep(1);
//       } catch (error: any) {
//         console.error("Error creating event:", {
//           message: error.message,
//           status: error.status,
//           data: error.data
//         });
//         let errorMessage = "Failed to create event. Please try again.";
//         if (error.status === 401) {
//           errorMessage = "Authentication failed. Please log in again.";
//           window.location.href = "/login";
//         } else if (error.status === 400) {
//           if (error.data?.data) {
//             const errors = error.data.data;
//             const errorDetails = Object.entries(errors)
//               .map(([field, messages]: [string, string[]]) => `${field}: ${messages.join(", ")}`)
//               .join("; ");
//             errorMessage = `Invalid data: ${errorDetails}`;
//           } else {
//             errorMessage = `Invalid data: ${JSON.stringify(error.data)}`;
//           }
//         } else if (error.status === 404) {
//           errorMessage = "Event creation endpoint not found. Please contact support.";
//         } else if (error.status === 503) {
//           errorMessage = "Server is temporarily unavailable. Please try again later.";
//         } else if (error.message.includes("Network error")) {
//           errorMessage = "Network error. Please check your connection.";
//         }
//         alert(errorMessage);
//       } finally {
//         setIsLoading(false);
//       }
//     }
//   };

//   const handleBack = () => {
//     if (currentStep > 1) {
//       setCurrentStep((prev) => prev - 1);
//     }
//   };

//   const openModal = () => setIsModalOpen(true);
//   const closeModal = () => setIsModalOpen(false);

//   const handleTicketTypeChange = (index: number, value: string) => {
//     if (value === "Paid" || value === "Free" || value === "Invite") {
//       const updatedTickets = [...formData.tickets];
//       updatedTickets[index].type = value;
//       if (value === "Free") {
//         updatedTickets[index].price = 0;
//         setFormData((prev) => ({
//           ...prev,
//           price: "0.00"
//         }));
//       }
//       if (value !== "Invite") {
//         updatedTickets[index].inviteEmail = undefined;
//       }
//       setFormData((prev) => ({
//         ...prev,
//         tickets: updatedTickets
//       }));
//     } else {
//       console.warn(`Unexpected ticket type: ${value}`);
//     }
//   };

//   const addTicket = (ticket: Omit<Ticket, "id">) => {
//     const newTicket: Ticket = { ...ticket, id: uuidv4() };
//     setFormData((prev) => ({
//       ...prev,
//       tickets: [...prev.tickets, newTicket],
//       price: ticket.price ? ticket.price.toFixed(2) : "0.00",
//     }));
//     closeModal();
//   };

//   const handleSendInvite = (ticketId: string) => {
//     console.log(`Sending invites for ticket ID: ${ticketId}`);
//     const email = prompt("Enter the invitee's email address:");
//     if (email) {
//       const updatedTickets = formData.tickets.map((t) =>
//         t.id === ticketId ? { ...t, inviteEmail: email } : t
//       );
//       setFormData((prev) => ({
//         ...prev,
//         tickets: updatedTickets
//       }));
//       alert(`Invite sent to ${email}`);
//     }
//   };

//   const updateFormData = (update: Partial<EventFormData>) => {
//     setFormData((prev) => ({
//       ...prev,
//       ...update
//     }));
//   };

//   const handleFileSelect = (file: File | null) => {
//     setSelectedFile(file);
//   };

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
//             openModal={openModal}
//             handleTicketTypeChange={handleTicketTypeChange}
//             handleSendInvite={handleSendInvite}
//           />
//         );
//       case 3:
//         return (
//           <CustomQuestionsStep
//             questions={formData.questions || []}
//             setQuestions={handleUpdateQuestions}
//           />
//         );
//       case 4:
//         return (
//           <AppearanceStep
//             formData={formData}
//             updateFormData={updateFormData}
//             onFileSelect={handleFileSelect}
//           />
//         );
//       default:
//         return null;
//     }
//   };

//   const totalSteps = 4;

//   return (
//     <div className={styles.formContainer}>
//       <Stack className={styles.navStark}>
//         <Navbar />
//       </Stack>
//       <h1 className={styles.title}>Create A New Event</h1>
//       <p className={styles.subtitle}>You are Just Four Steps Away!</p>
//       <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
//       <form onSubmit={handleSubmit} className={styles.eventForm}>
//         {renderStepContent()}
//         <NavigationButtons
//           currentStep={currentStep}
//           handleBack={handleBack}
//           isLastStep={currentStep === totalSteps}
//           isLoading={isLoading}
//         />
//       </form>
//       <TicketModal
//         isModalOpen={isModalOpen}
//         closeModal={closeModal}
//         addTicket={addTicket}
//       />
//     </div>
//   );
// };

// export default CreateEventForm;



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
// import { EventFormData, Ticket, Question } from "../../store/types";
// import AppearanceStep from "../AppearanceStep";
// import { Stack } from "@mantine/core";
// import { CustomQuestionsStep } from "../customQustion/CustomQuestionsStep Component";
// import { authenticatedRequest, getAuthToken, isAuthenticated } from "../../app/services/auth";

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://keupass-48c2ae65f897.herokuapp.com/api";
// const DEFAULT_BANNER_URL = "https://via.placeholder.com/150";

// const CreateEventForm: React.FC = () => {
//   const [currentStep, setCurrentStep] = useState<number>(1);
//   const [formData, setFormData] = useState<EventFormData>({
//     title: "",
//     description: "",
//     location: "Virtual",
//     startDate: "",
//     startTime: "",
//     endDate: "",
//     endTime: "",
//     tickets: [],
//     appearance: "",
//     cardColor: "#FF0000",
//     questions: [],
//     address: "",
//     eventURL: "",
//     price: "0.00",
//   });
//   const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [events, setEvents] = useState<any[]>([]);
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);

//   useEffect(() => {
//     if (!isAuthenticated()) {
//       window.location.href = "/login";
//     }
//     console.log("API_BASE_URL:", API_BASE_URL);
//     console.log("Access Token:", getAuthToken());
//   }, []);

//   const fetchEvents = async () => {
//     try {
//       console.log("Fetching events with token:", getAuthToken());
//       const response = await authenticatedRequest<{ data: any[] }>(`${API_BASE_URL}/events/`, "GET");
//       return response.data;
//     } catch (error: any) {
//       console.error("Error fetching events:", {
//         message: error.message,
//         status: error.status,
//         data: error.data,
//       });
//       throw error;
//     }
//   };

//   const createEvent = async (eventData: Partial<EventFormData>): Promise<any> => {
//     try {
//       console.log("Attempting to create event at:", `${API_BASE_URL}/events/`);
//       console.log("Event payload:", JSON.stringify(eventData, null, 2));
//       console.log("Using Access Token:", getAuthToken());
//       const response = await authenticatedRequest<{ data: any }>(
//         `${API_BASE_URL}/events/`,
//         "POST",
//         eventData
//       );
//       return response.data;
//     } catch (error: any) {
//       console.error("Error creating event:", {
//         message: error.message,
//         status: error.status,
//         data: error.data,
//         url: `${API_BASE_URL}/events/`,
//       });
//       throw error;
//     }
//   };

//   const createEventCustomization = async (customizationData: {
//     event: string;
//     banner_url: string | null;
//     font: string;
//     card_color: string;
//     is_active: boolean;
//   }) => {
//     try {
//       console.log("Attempting to create customization at:", `${API_BASE_URL}/event-customizations/`);
//       console.log("Customization payload:", JSON.stringify(customizationData, null, 2));
//       const response = await authenticatedRequest<{ data: any }>(
//         `${API_BASE_URL}/event-customizations/`,
//         "POST",
//         customizationData
//       );
//       console.log("Customization created:", response.data);
//       return response.data;
//     } catch (error: any) {
//       console.error("Error creating event customization:", {
//         message: error.message,
//         status: error.status,
//         data: error.data,
//       });
//       throw error;
//     }
//   };

//   const createQuestion = async (questionData: Question & { event_id: string }) => {
//     try {
//       console.log("Attempting to create question at:", `${API_BASE_URL}/questions/`);
//       console.log("Question payload:", JSON.stringify(questionData, null, 2));
//       const response = await authenticatedRequest<{ data: any }>(
//         `${API_BASE_URL}/questions/`,
//         "POST",
//         questionData
//       );
//       return response.data;
//     } catch (error: any) {
//       console.error("Error creating question:", {
//         message: error.message,
//         status: error.status,
//         data: error.data,
//       });
//       throw error;
//     }
//   };

//   const createPaymentRequest = async (ticketData: {
//     event_id: string;
//     category_name: string;
//     category_price: string;
//     event_title: string;
//     full_name: string;
//   }) => {
//     try {
//       if (!ticketData.category_name || !["Paid", "Free", "Invite"].includes(ticketData.category_name)) {
//         throw new Error(`Invalid ticket category name: ${ticketData.category_name}. Must be Paid, Free, or Invite.`);
//       }
//       if (!ticketData.category_price || isNaN(Number(ticketData.category_price))) {
//         throw new Error(`Invalid ticket price: ${ticketData.category_price}. Must be a valid number.`);
//       }
//       console.log("Attempting to create payment request at:", `${API_BASE_URL}/payment-requests/`);
//       console.log("Payment request payload:", JSON.stringify(ticketData, null, 2));
//       const response = await authenticatedRequest<{ data: any }>(
//         `${API_BASE_URL}/payment-requests/`,
//         "POST",
//         ticketData
//       );
//       return response.data;
//     } catch (error: any) {
//       console.error("Error creating payment request:", {
//         message: error.message,
//         status: error.status,
//         data: error.data,
//       });
//       throw error;
//     }
//   };

//   const uploadImage = async (file: File): Promise<string> => {
//     try {
//       const formData = new FormData();
//       formData.append("image", file);
//       console.log("Uploading image:", {
//         name: file.name,
//         size: file.size,
//         type: file.type,
//       });
//       console.log("FormData contents:", [...formData.entries()]);

//       const response = await authenticatedRequest<{
//         success: boolean;
//         message: string;
//         data: { url: string };
//         error_code?: string;
//       }>(`${API_BASE_URL}/upload-image/`, "POST", formData);

//       if (!response.success) {
//         throw new Error(response.message || "Image upload failed.");
//       }

//       console.log("Image uploaded successfully:", response.data.url);
//       return response.data.url;
//     } catch (error: any) {
//       console.error("Image upload error:", {
//         message: error.message,
//         status: error.status,
//         data: error.data,
//       });
//       throw new Error(`Image upload failed: ${error.message || "Please try again."}`);
//     }
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { id, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [id]: value,
//     }));
//   };

//   const handleLocationChange = (value: "Virtual" | "Physical") => {
//     setFormData((prev) => ({
//       ...prev,
//       location: value,
//     }));
//   };

//   const handleUpdateQuestions = (questions: Question[]) => {
//     setFormData((prev) => ({
//       ...prev,
//       questions,
//     }));
//   };

//   const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
//     console.log("Form submission triggered", e);
//     e.preventDefault();

//     if (currentStep === 1) {
//       const start = new Date(`${formData.startDate}T${formData.startTime}`);
//       const end = new Date(`${formData.endDate}T${formData.endTime}`);

//       if (end <= start) {
//         alert("End date and time must be after start date and time.");
//         return;
//       }
//     }

//     if (currentStep < 4) {
//       setCurrentStep((prev) => prev + 1);
//     } else {
//       setIsLoading(true);
//       try {
//         if (!formData.title) {
//           throw new Error("Event title is required.");
//         }
//         if (!formData.description) {
//           throw new Error("Event description is required.");
//         }
//         if (!formData.location) {
//           throw new Error("Event location is required.");
//         }
//         if (!formData.startDate || !formData.startTime) {
//           throw new Error("Start date and time are required.");
//         }
//         if (!formData.endDate || !formData.endTime) {
//           throw new Error("End date and time are required.");
//         }
//         if (!formData.price) {
//           throw new Error("Event price is required.");
//         }

//         let imageUrl: string | null = null;
//         if (selectedFile) {
//           imageUrl = await uploadImage(selectedFile);
//           setFormData((prev) => ({ ...prev, appearance: imageUrl }));
//         }

//         const eventData = {
//           title: formData.title,
//           description: formData.description,
//           location: formData.location,
//           start_date: `${formData.startDate}T${formData.startTime}:00Z`,
//           end_date: `${formData.endDate}T${formData.endTime}:00Z`,
//           price: formData.price,
//           is_active: true,
//         };

//         const eventResponse = await createEvent(eventData);
//         const eventId = eventResponse.id;
//         setFormData((prev) => ({
//           ...prev,
//           eventURL: `${API_BASE_URL}/events/${eventId}`,
//         }));

//         let bannerUrl: string | null = imageUrl || formData.appearance || null;
//         if (bannerUrl) {
//           try {
//             new URL(bannerUrl);
//             if (bannerUrl.length > 500) {
//               bannerUrl = bannerUrl.substring(0, 500);
//             }
//           } catch {
//             console.warn(`Invalid banner URL: ${bannerUrl}, setting to default.`);
//             bannerUrl = DEFAULT_BANNER_URL;
//           }
//         } else {
//           bannerUrl = DEFAULT_BANNER_URL;
//         }

//         const customizationData = {
//           event: eventId,
//           banner_url: bannerUrl,
//           font: "Arial",
//           card_color: formData.cardColor || "#ffffff",
//           is_active: true,
//         };
//         await createEventCustomization(customizationData);

//         if (formData.questions.length > 0) {
//           for (const question of formData.questions) {
//             const questionData = {
//               event_id: eventId,
//               type: question.type || "text",
//               title: question.title,
//               required: question.required || false,
//               placeholder: question.placeholder || null,
//               order: question.order || 0,
//             };
//             await createQuestion(questionData);
//           }
//         }

//         if (formData.tickets.length > 0) {
//           for (const ticket of formData.tickets) {
//             const ticketData = {
//               event_id: eventId,
//               category_name: ticket.type,
//               category_price: ticket.price ? ticket.price.toFixed(2) : "0.00",
//               event_title: formData.title,
//               full_name: "Attendee",
//             };
//             await createPaymentRequest(ticketData);
//           }
//         }

//         alert("Event created successfully!");
//         setFormData({
//           title: "",
//           description: "",
//           location: "Virtual",
//           startDate: "",
//           startTime: "",
//           endDate: "",
//           endTime: "",
//           tickets: [],
//           appearance: "",
//           cardColor: "#FF0000",
//           questions: [],
//           address: "",
//           eventURL: "",
//           price: "0.00",
//         });
//         setSelectedFile(null);
//         setCurrentStep(1);
//       } catch (error: any) {
//         console.error("Error creating event:", {
//           message: error.message,
//           status: error.status,
//           data: error.data,
//         });
//         let errorMessage = "Failed to create event. Please try again.";
//         if (error.status === 401) {
//           errorMessage = "Authentication failed. Please log in again.";
//           window.location.href = "/login";
//         } else if (error.status === 400) {
//           if (error.data?.data) {
//             const errors = error.data.data;
//             const errorDetails = Object.entries(errors)
//               .map(([field, messages]: [string, any]) => `${field}: ${messages.join(", ")}`)
//               .join("; ");
//             errorMessage = `Invalid data: ${errorDetails}`;
//           } else {
//             errorMessage = `Invalid data: ${JSON.stringify(error.data)}`;
//           }
//         } else if (error.status === 404) {
//           errorMessage = "Event creation endpoint not found. Please contact support.";
//         } else if (error.status === 503) {
//           errorMessage = "Server is temporarily unavailable. Please try again later.";
//         } else if (error.message.includes("Network error")) {
//           errorMessage = "Network error. Please check your connection.";
//         }
//         alert(errorMessage);
//       } finally {
//         setIsLoading(false);
//       }
//     }
//   };

//   const handleBack = () => {
//     if (currentStep > 1) {
//       setCurrentStep((prev) => prev - 1);
//     }
//   };

//   const openModal = () => setIsModalOpen(true);
//   const closeModal = () => setIsModalOpen(false);

//   const handleTicketTypeChange = (index: number, value: string) => {
//     if (value === "Paid" || value === "Free" || value === "Invite") {
//       const updatedTickets = [...formData.tickets];
//       updatedTickets[index].type = value;
//       if (value === "Free") {
//         updatedTickets[index].price = 0;
//         setFormData((prev) => ({
//           ...prev,
//           price: "0.00",
//         }));
//       }
//       if (value !== "Invite") {
//         updatedTickets[index].inviteEmail = undefined;
//       }
//       setFormData((prev) => ({
//         ...prev,
//         tickets: updatedTickets,
//       }));
//     } else {
//       console.warn(`Unexpected ticket type: ${value}`);
//     }
//   };

//   const addTicket = (ticket: Omit<Ticket, "id">) => {
//     const newTicket: Ticket = { ...ticket, id: uuidv4() };
//     setFormData((prev) => ({
//       ...prev,
//       tickets: [...prev.tickets, newTicket],
//       price: ticket.price ? ticket.price.toFixed(2) : "0.00",
//     }));
//     closeModal();
//   };

//   const handleSendInvite = (ticketId: string) => {
//     console.log(`Sending invites for ticket ID: ${ticketId}`);
//     const email = prompt("Enter the invitee's email address:");
//     if (email) {
//       const updatedTickets = formData.tickets.map((t) =>
//         t.id === ticketId ? { ...t, inviteEmail: email } : t
//       );
//       setFormData((prev) => ({
//         ...prev,
//         tickets: updatedTickets,
//       }));
//       alert(`Invite sent to ${email}`);
//     }
//   };

//   const updateFormData = (update: Partial<EventFormData>) => {
//     setFormData((prev) => ({
//       ...prev,
//       ...update,
//     }));
//   };

//   const handleFileSelect = (file: File | null) => {
//     setSelectedFile(file);
//   };

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
//             openModal={openModal}
//             handleTicketTypeChange={handleTicketTypeChange}
//             handleSendInvite={handleSendInvite}
//           />
//         );
//       case 3:
//         return (
//           <CustomQuestionsStep
//             questions={formData.questions || []}
//             setQuestions={handleUpdateQuestions}
//           />
//         );
//       case 4:
//         return (
//           <AppearanceStep
//             formData={formData}
//             updateFormData={updateFormData}
//             onFileSelect={handleFileSelect}
//           />
//         );
//       default:
//         return null;
//     }
//   };

//   const totalSteps = 4;

//   return (
//     <div className={styles.formContainer}>
//       <Stack className={styles.navStark}>
//         <Navbar />
//       </Stack>
//       <h1 className={styles.title}>Create A New Event</h1>
//       <p className={styles.subtitle}>You are Just Four Steps Away!</p>
//       <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
//       <form onSubmit={handleSubmit} className={styles.eventForm}>
//         {renderStepContent()}
//         <NavigationButtons
//           currentStep={currentStep}
//           handleBack={handleBack}
//           isLastStep={currentStep === totalSteps}
//           isLoading={isLoading}
//         />
//       </form>
//       <TicketModal
//         isModalOpen={isModalOpen}
//         closeModal={closeModal}
//         addTicket={addTicket}
//       />
//     </div>
//   );
// };

// export default CreateEventForm;


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
import { EventFormData, Ticket, Question } from "../../store/types";
import AppearanceStep from "../AppearanceStep";
import { Stack } from "@mantine/core";
import { CustomQuestionsStep } from "../customQustion/CustomQuestionsStep Component";
import { authenticatedRequest, getAuthToken, isAuthenticated } from "../../app/services/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://keupass-48c2ae65f897.herokuapp.com/api";
const DEFAULT_BANNER_URL = "https://via.placeholder.com/150";

const CreateEventForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    location: "Virtual",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    tickets: [],
    appearance: "",
    cardColor: "#FF0000",
    questions: [],
    address: "",
    eventURL: "",
    price: "0.00",
  });
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      window.location.href = "/login";
    }
    console.log("API_BASE_URL:", API_BASE_URL);
    console.log("Access Token:", getAuthToken());
  }, []);

  const fetchEvents = async () => {
    try {
      console.log("Fetching events with token:", getAuthToken());
      const response = await authenticatedRequest<{ data: any[] }>(`${API_BASE_URL}/events/`, "GET");
      return response.data;
    } catch (error: any) {
      console.error("Error fetching events:", {
        message: error.message,
        status: error.status,
        data: error.data,
      });
      throw error;
    }
  };

  const createEvent = async (eventData: Partial<EventFormData>): Promise<any> => {
    try {
      console.log("Attempting to create event at:", `${API_BASE_URL}/events/`);
      console.log("Event payload:", JSON.stringify(eventData, null, 2));
      console.log("Using Access Token:", getAuthToken());
      const response = await authenticatedRequest<{ data: any }>(
        `${API_BASE_URL}/events/`,
        "POST",
        eventData
      );
      return response.data;
    } catch (error: any) {
      console.error("Error creating event:", {
        message: error.message,
        status: error.status,
        data: error.data,
        url: `${API_BASE_URL}/events/`,
      });
      throw error;
    }
  };

  const createEventCustomization = async (customizationData: {
    event: string;
    banner_url: string | null;
    font: string;
    card_color: string;
    is_active: boolean;
  }) => {
    try {
      console.log("Attempting to create customization at:", `${API_BASE_URL}/event-customizations/`);
      console.log("Customization payload:", JSON.stringify(customizationData, null, 2));
      const response = await authenticatedRequest<{ data: any }>(
        `${API_BASE_URL}/event-customizations/`,
        "POST",
        customizationData
      );
      console.log("Customization created:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error creating event customization:", {
        message: error.message,
        status: error.status,
        data: error.data,
      });
      throw error;
    }
  };

  const createQuestion = async (questionData: Question & { event_id: string }) => {
    try {
      console.log("Attempting to create question at:", `${API_BASE_URL}/questions/`);
      console.log("Question payload:", JSON.stringify(questionData, null, 2));
      const response = await authenticatedRequest<{ data: any }>(
        `${API_BASE_URL}/questions/`,
        "POST",
        questionData
      );
      return response.data;
    } catch (error: any) {
      console.error("Error creating question:", {
        message: error.message,
        status: error.status,
        data: error.data,
      });
      throw error;
    }
  };

  const createPaymentRequest = async (ticketData: {
    event_id: string;
    category_name: string;
    category_price: string;
    event_title: string;
    full_name: string;
  }) => {
    try {
      if (!ticketData.category_name || !["Paid", "Free", "Invite"].includes(ticketData.category_name)) {
        throw new Error(`Invalid ticket category name: ${ticketData.category_name}. Must be Paid, Free, or Invite.`);
      }
      if (!ticketData.category_price || isNaN(Number(ticketData.category_price))) {
        throw new Error(`Invalid ticket price: ${ticketData.category_price}. Must be a valid number.`);
      }
      console.log("Attempting to create payment request at:", `${API_BASE_URL}/payment-requests/`);
      console.log("Payment request payload:", JSON.stringify(ticketData, null, 2));
      const response = await authenticatedRequest<{ data: any }>(
        `${API_BASE_URL}/payment-requests/`,
        "POST",
        ticketData
      );
      return response.data;
    } catch (error: any) {
      console.error("Error creating payment request:", {
        message: error.message,
        status: error.status,
        data: error.data,
      });
      throw error;
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append("image", file);
      console.log("Uploading image:", {
        name: file.name,
        size: file.size,
        type: file.type,
      });
      console.log("FormData contents:", [...formData.entries()]);

      const response = await authenticatedRequest<{
        success: boolean;
        message: string;
        data: { url: string };
        error_code?: string;
      }>(`${API_BASE_URL}/upload-image/`, "POST", formData);

      if (!response.success) {
        throw new Error(response.message || "Image upload failed.");
      }

      console.log("Image uploaded successfully:", response.data.url);
      return response.data.url;
    } catch (error: any) {
      console.error("Image upload error:", {
        message: error.message,
        status: error.status,
        data: error.data,
      });
      throw new Error(`Image upload failed: ${error.message || "Please try again."}`);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleLocationChange = (value: "Virtual" | "Physical") => {
    setFormData((prev) => ({
      ...prev,
      location: value,
    }));
  };

  const handleUpdateQuestions = (questions: Question[]) => {
    setFormData((prev) => ({
      ...prev,
      questions,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    console.log("Form submission triggered", e);
    e.preventDefault();

    if (currentStep === 1) {
      const start = new Date(`${formData.startDate}T${formData.startTime}`);
      const end = new Date(`${formData.endDate}T${formData.endTime}`);

      if (end <= start) {
        alert("End date and time must be after start date and time.");
        return;
      }
    }

    if (currentStep < 4) {
      console.log("Advancing to step:", currentStep + 1);
      setCurrentStep((prev) => prev + 1);
    } else {
      setIsLoading(true);
      try {
        if (!formData.title) {
          throw new Error("Event title is required.");
        }
        if (!formData.description) {
          throw new Error("Event description is required.");
        }
        if (!formData.location) {
          throw new Error("Event location is required.");
        }
        if (!formData.startDate || !formData.startTime) {
          throw new Error("Start date and time are required.");
        }
        if (!formData.endDate || !formData.endTime) {
          throw new Error("End date and time are required.");
        }
        if (!formData.price) {
          throw new Error("Event price is required.");
        }

        let imageUrl: string | null = null;
        if (selectedFile) {
          imageUrl = await uploadImage(selectedFile);
          setFormData((prev) => ({ ...prev, appearance: imageUrl }));
        }

        const eventData = {
          title: formData.title,
          description: formData.description,
          location: formData.location,
          start_date: `${formData.startDate}T${formData.startTime}:00Z`,
          end_date: `${formData.endDate}T${formData.endTime}:00Z`,
          price: formData.price,
          is_active: true,
        };

        const eventResponse = await createEvent(eventData);
        const eventId = eventResponse.id;
        setFormData((prev) => {
          const updated = {
            ...prev,
            eventURL: `${API_BASE_URL}/events/${eventId}`,
          };
          console.log("Updated formData.eventURL:", updated.eventURL);
          return updated;
        });

        let bannerUrl: string | null = imageUrl || formData.appearance || null;
        if (bannerUrl) {
          try {
            new URL(bannerUrl);
            if (bannerUrl.length > 500) {
              bannerUrl = bannerUrl.substring(0, 500);
            }
          } catch {
            console.warn(`Invalid banner URL: ${bannerUrl}, setting to default.`);
            bannerUrl = DEFAULT_BANNER_URL;
          }
        } else {
          bannerUrl = DEFAULT_BANNER_URL;
        }

        const customizationData = {
          event: eventId,
          banner_url: bannerUrl,
          font: "Arial",
          card_color: formData.cardColor || "#ffffff",
          is_active: true,
        };
        await createEventCustomization(customizationData);

        if (formData.questions.length > 0) {
          for (const question of formData.questions) {
            const questionData = {
              event_id: eventId,
              type: question.type || "text",
              title: question.title,
              required: question.required || false,
              placeholder: question.placeholder || null,
              order: question.order || 0,
            };
            await createQuestion(questionData);
          }
        }

        if (formData.tickets.length > 0) {
          for (const ticket of formData.tickets) {
            const ticketData = {
              event_id: eventId,
              category_name: ticket.type,
              category_price: ticket.price ? ticket.price.toFixed(2) : "0.00",
              event_title: formData.title,
              full_name: "Attendee",
            };
            await createPaymentRequest(ticketData);
          }
        }

        alert("Event created successfully!");
        setFormData({
          title: "",
          description: "",
          location: "Virtual",
          startDate: "",
          startTime: "",
          endDate: "",
          endTime: "",
          tickets: [],
          appearance: "",
          cardColor: "#FF0000",
          questions: [],
          address: "",
          eventURL: "",
          price: "0.00",
        });
        setSelectedFile(null);
        setCurrentStep(1);
      } catch (error: any) {
        console.error("Error creating event:", {
          message: error.message,
          status: error.status,
          data: error.data,
        });
        let errorMessage = "Failed to create event. Please try again.";
        if (error.status === 401) {
          errorMessage = "Authentication failed. Please log in again.";
          window.location.href = "/login";
        } else if (error.status === 400) {
          if (error.data?.data) {
            const errors = error.data.data;
            const errorDetails = Object.entries(errors)
              .map(([field, messages]: [string, any]) => `${field}: ${messages.join(", ")}`)
              .join("; ");
            errorMessage = `Invalid data: ${errorDetails}`;
          } else {
            errorMessage = `Invalid data: ${JSON.stringify(error.data)}`;
          }
        } else if (error.status === 404) {
          errorMessage = "Event creation endpoint not found. Please contact support.";
        } else if (error.status === 503) {
          errorMessage = "Server is temporarily unavailable. Please try again later.";
        } else if (error.message.includes("Network error")) {
          errorMessage = "Network error. Please check your connection.";
        }
        alert(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleTicketTypeChange = (index: number, value: string) => {
    if (value === "Paid" || value === "Free" || value === "Invite") {
      const updatedTickets = [...formData.tickets];
      updatedTickets[index].type = value;
      if (value === "Free") {
        updatedTickets[index].price = 0;
        setFormData((prev) => ({
          ...prev,
          price: "0.00",
        }));
      }
      if (value !== "Invite") {
        updatedTickets[index].inviteEmail = undefined;
      }
      setFormData((prev) => ({
        ...prev,
        tickets: updatedTickets,
      }));
    } else {
      console.warn(`Unexpected ticket type: ${value}`);
    }
  };

  const addTicket = (ticket: Omit<Ticket, "id">) => {
    const newTicket: Ticket = { ...ticket, id: uuidv4() };
    setFormData((prev) => ({
      ...prev,
      tickets: [...prev.tickets, newTicket],
      price: ticket.price ? ticket.price.toFixed(2) : "0.00",
    }));
    closeModal();
  };

  const handleSendInvite = (ticketId: string) => {
    console.log(`Sending invites for ticket ID: ${ticketId}`);
    const email = prompt("Enter the invitee's email address:");
    if (email) {
      const updatedTickets = formData.tickets.map((t) =>
        t.id === ticketId ? { ...t, inviteEmail: email } : t
      );
      setFormData((prev) => ({
        ...prev,
        tickets: updatedTickets,
      }));
      alert(`Invite sent to ${email}`);
    }
  };

  const updateFormData = (update: Partial<EventFormData>) => {
    setFormData((prev) => ({
      ...prev,
      ...update,
    }));
  };

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
  };

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
            openModal={openModal}
            handleTicketTypeChange={handleTicketTypeChange}
            handleSendInvite={handleSendInvite}
          />
        );
      case 3:
        return (
          <CustomQuestionsStep
            questions={formData.questions || []}
            setQuestions={handleUpdateQuestions}
          />
        );
      case 4:
        return (
          <AppearanceStep
            formData={formData}
            updateFormData={updateFormData}
            onFileSelect={handleFileSelect}
          />
        );
      default:
        return null;
    }
  };

  const totalSteps = 4;

  return (
    <div className={styles.formContainer}>
      <Stack className={styles.navStark}>
        <Navbar />
      </Stack>
      <h1 className={styles.title}>Create A New Event</h1>
      <p className={styles.subtitle}>You are Just Four Steps Away!</p>
      <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
      <form onSubmit={handleSubmit} className={styles.eventForm}>
        {renderStepContent()}
        <NavigationButtons
          currentStep={currentStep}
          handleBack={handleBack}
          isLastStep={currentStep === totalSteps}
          isLoading={isLoading}
        />
      </form>
      <TicketModal
        isModalOpen={isModalOpen}
        closeModal={closeModal}
        addTicket={addTicket}
      />
    </div>
  );
};

export default CreateEventForm;