"use client";
import React, { useState, FormEvent } from "react";
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
// import CustomQuestionsStep from "../customQustion/CustomQuestionsStep";

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
    questions: [], // Added questions array to store custom form questions
  });

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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
      address: value === "Physical" ? prev.address : "",
    }));
  };

  // Update questions in form data
  const handleUpdateQuestions = (questions: Question[]) => {
    setFormData((prev) => ({
      ...prev,
      questions,
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate date and time if on the first step
    if (currentStep === 1) {
      const start = new Date(`${formData.startDate}T${formData.startTime}`);
      const end = new Date(`${formData.endDate}T${formData.endTime}`);

      if (end <= start) {
        alert("End date and time must be after start date and time.");
        return;
      }
    }

    if (currentStep < 4) {
      // Updated to include the new questions step
      setCurrentStep((prev) => prev + 1);
    } else {
      console.log("Form submitted", formData);
      // Here you would typically submit the form data to your backend
      alert("Event created successfully!");
      // Optionally redirect to events page or clear form
    }
  };

  // Handle going back to the previous step
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Modal handlers
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleTicketTypeChange = (index: number, value: string) => {
    if (value === "Paid" || value === "Free" || value === "Invite") {
      const updatedTickets = [...formData.tickets];
      updatedTickets[index].type = value;
      if (value === "Free") {
        updatedTickets[index].price = 0;
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
    }));
    closeModal();
  };

  // Handle sending invites
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

  const renderStepForm = () => {
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
          <AppearanceStep formData={formData} updateFormData={updateFormData} />
        );
      default:
        return null;
    }
  };

  // Get step count for the indicator and navigation
  const totalSteps = 4; // Updated to include the questions step

  return (
    <div className={styles.formContainer}>
      <Stack className={styles.navStark}>
        <Navbar />
      </Stack>
      <h1 className={styles.title}>Create A New Event</h1>
      <p className={styles.subtitle}>You are Just Four Steps Away!</p>
      <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
      <form onSubmit={handleSubmit} className={styles.eventForm}>
        {renderStepForm()}
        <NavigationButtons
          currentStep={currentStep}
          handleBack={handleBack}
          isLastStep={currentStep === totalSteps}
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
