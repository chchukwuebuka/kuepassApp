// types.ts
export interface Ticket {
  id: string; // Unique identifier
  name: string;
  price: number;
  quantity: number;
  type: "Paid" | "Free" | "Invite";
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
  questions: Question[];
}

export interface Question {
  id: string;
  type:
    | "text"
    | "textarea"
    | "select"
    | "radio"
    | "checkbox"
    | "date"
    | "email"
    | "number";
  title: string;
  required: boolean;
  options?: { id: string; text: string }[];
  placeholder?: string;
}

export type QuestionType =
  | "text"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | "date"
  | "email"
  | "number";
