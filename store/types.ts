// types.ts
export interface Ticket {
  id: string; // Unique identifier
  name: string;
  price: number;
  quantity: number | "Unlimited" | null;
  type: "Paid" | "Free" | "Invite";
  inviteEmail?: string;
  enable_dynamic_pricing?: boolean;
  min_price?: number | null;
  max_price?: number | null;
}

export interface EventFormData {
  title: string;
  description: string;
  location: "Virtual" | "Physical";
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  tickets: Ticket[];
  appearance: string;
  cardColor: string;
  questions: Question[];
  address: string;
  eventURL: string;
  price: string;
  
  // Extended Location & Timing Fields
  locationType?: "venue" | "virtual" | "tba";
  eventTimingType?: "single" | "recurring";
  timezone?: string;
  streetAddress?: string;
  country?: string;
  state?: string;
  city?: string;
  landmark?: string;
  additionalDetails?: string;
  meetingLink?: string;
  tags?: string[];
  socialLinks?: {
    instagram?: string;
    youtube?: string;
    tiktok?: string;
  };
  sections?: string[];
  lineupItems?: any[];
  schedules?: any[];
  ticketButtonText?: string;
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
