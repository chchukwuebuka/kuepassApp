export interface Ticket {
  id: string;
  name: string;
  type: "Free" | "Paid" | "Invite";
  price?: number;
  quantity: number;
  inviteEmail?: string;
}

export interface EventFormData {
  title: string;
  description: string;
  location: "Virtual" | "Physical";
  address?: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  tickets: Ticket[];
  appearance: string;
  questions: Question[]; // New field for custom questions
}

// New types for custom questions feature
export type QuestionType = 
  | "text"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | "date"
  | "email"
  | "number";

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  required: boolean;
  placeholder?: string;
  options?: QuestionOption[];
}

// Types for responses
export interface QuestionResponse {
  questionId: string;
  answer: string | string[] | number | Date; // Different types based on question type
}

export interface EventRegistration {
  eventId: string;
  ticketId: string;
  attendeeId: string;
  registrationDate: Date;
  responses: QuestionResponse[];
}