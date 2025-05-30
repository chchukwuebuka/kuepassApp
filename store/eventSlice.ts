// store/eventSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { EventFormData } from "./types";

interface EventState {
  events: Record<string, EventFormData>;
}

const initialState: EventState = {
  events: {},
};

const eventSlice = createSlice({
  name: "event",
  initialState,
  reducers: {
    setEvent(state, action: PayloadAction<{ id: string; data: EventFormData }>) {
      state.events[action.payload.id] = action.payload.data;
    },
    updateEvent(state, action: PayloadAction<{ id: string; updates: Partial<EventFormData> }>) {
      const existing = state.events[action.payload.id];
      if (existing) {
        state.events[action.payload.id] = { ...existing, ...action.payload.updates };
      }
    },
  },
});

export const { setEvent, updateEvent } = eventSlice.actions;
export default eventSlice.reducer;
