
import React from "react";
import { EventFormData } from "../../store/types";
import createStyles from "../CreateEventPage/styles.module.css";
import { IconCalendar, IconMapPin, IconCalendarEvent } from "@tabler/icons-react";
import AutocompleteInput from "../CreateEventPage/AutocompleteInput";
import LocationMapSection from "../CreateEventPage/LocationMapSection";

// --- UPDATED: Props interface for the new AI functionality ---
interface DetailsStepProps {
  formData: EventFormData;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleLocationChange: (value: "Virtual" | "Physical") => void;
  onAiAction: (mode: "generate" | "refine" | "complete") => void;
  isGenerating: boolean;
}

const DetailsStep: React.FC<DetailsStepProps> = ({
  formData,
  handleChange,
  handleLocationChange,
  // --- NEW: Destructure new props ---
  onAiAction,
  isGenerating,
}) => {
  // --- NEW: Helper variable to disable menu items appropriately ---
  const hasDescription = formData.description.trim() !== "";

  // --- NEW: State to track if user is typing ---
  const [isTyping, setIsTyping] = React.useState(false);
  const [typingTimeout, setTypingTimeout] =
    React.useState<NodeJS.Timeout | null>(null);

  // --- NEW: Function to handle typing detection ---
  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    handleChange(e);

    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Set typing to true
    setIsTyping(true);

    // Set timeout to stop bouncing after user stops typing
    const newTimeout = setTimeout(() => {
      setIsTyping(false);
    }, 1500); // Stop bouncing 1.5 seconds after user stops typing

    setTypingTimeout(newTimeout);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Event Details Section */}
      <div className={createStyles.section}>
        <div className={createStyles.sectionHeader}>
          <h2 className={createStyles.sectionTitle}>Event details</h2>
          <p className={createStyles.sectionSubtitle}>
            Update your core event information.
          </p>
        </div>

        <div className={createStyles.formContainer}>
          <div className={createStyles.inputWrapper}>
            <label className={createStyles.inputLabel}>Event name*</label>
            <input
              type="text"
              name="title"
              placeholder="Enter event name"
              value={formData.title}
              onChange={handleChange}
              required
              className={createStyles.input}
            />
          </div>

          <div className={createStyles.inputWrapper}>
            <label className={createStyles.inputLabel}>Event description*</label>
            <textarea
              name="description"
              placeholder="Describe your event"
              value={formData.description}
              onChange={handleDescriptionChange}
              required
              rows={4}
              className={createStyles.textarea}
            />
          </div>

          {/* Fallback to Tags for Event Type syncing if needed */}
          <div className={createStyles.inputWrapper}>
            <label className={createStyles.inputLabel}>Location Type*</label>
            <select
              value={formData.location}
              onChange={(e) => handleLocationChange(e.target.value as "Virtual" | "Physical")}
              required
              className={createStyles.select}
            >
              <option value="Virtual">Virtual / Online Event</option>
              <option value="Physical">Physical / In-Person Event</option>
            </select>
          </div>
        </div>
      </div>

      {/* Date and Location Section */}
      <div className={createStyles.section}>
        <div className={createStyles.sectionHeader}>
          <h2 className={createStyles.sectionTitle}>Date and Location</h2>
          <p className={createStyles.sectionSubtitle}>
            Update your event timings and specific physical address.
          </p>
        </div>

        <div className={createStyles.formContainer}>
          {/* Type of Event (Timing) */}
          <div className={createStyles.inputWrapper}>
            <label className={createStyles.inputLabel}>Type of event</label>
            <div className={createStyles.eventTypeCards}>
              <div
                className={`${createStyles.eventTypeCard} ${
                  formData.eventTimingType === "single" || !formData.eventTimingType
                    ? createStyles.eventTypeCardSelected
                    : ""
                }`}
                onClick={() => handleChange({ target: { name: "eventTimingType", value: "single" } } as any)}
              >
                <IconCalendarEvent size={24} />
                <div className={createStyles.eventTypeCardContent}>
                  <h3 className={createStyles.eventTypeCardTitle}>Single event</h3>
                  <p className={createStyles.eventTypeCardDescription}>For events that happen once</p>
                </div>
                <div className={createStyles.radioButton}>
                  {(formData.eventTimingType === "single" || !formData.eventTimingType) && <div className={createStyles.radioButtonInner} />}
                </div>
              </div>
              <div
                className={`${createStyles.eventTypeCard} ${
                  formData.eventTimingType === "recurring"
                    ? createStyles.eventTypeCardSelected
                    : ""
                }`}
                onClick={() => handleChange({ target: { name: "eventTimingType", value: "recurring" } } as any)}
              >
                <IconCalendar size={24} />
                <div className={createStyles.eventTypeCardContent}>
                  <h3 className={createStyles.eventTypeCardTitle}>Recurring event</h3>
                  <p className={createStyles.eventTypeCardDescription}>For timed entry and multiple days</p>
                </div>
                <div className={createStyles.radioButton}>
                  {formData.eventTimingType === "recurring" && <div className={createStyles.radioButtonInner} />}
                </div>
              </div>
            </div>
          </div>

          {/* Date and timing (Single Event) */}
          {(!formData.eventTimingType || formData.eventTimingType === "single") && (
            <div className={createStyles.inputWrapper}>
              <label className={createStyles.inputLabel}>
                Date and timing<span className={createStyles.required}>*</span>
              </label>
              <div className={createStyles.dateInputsContainer}>
                <div className={createStyles.dateTimeInputGroup}>
                  <label className={createStyles.dateTimeLabel}>Start date and time</label>
                  <div className={createStyles.dateTimeInputWrapper}>
                    <IconCalendar size={20} className={createStyles.dateIcon} />
                    <input
                      type="datetime-local"
                      value={
                        formData.startDate && formData.startTime
                          ? `${formData.startDate}T${formData.startTime}`
                          : ""
                      }
                      onChange={(e) => {
                        const dateTime = e.target.value;
                        if (dateTime) {
                          const [date, time] = dateTime.split("T");
                          handleChange({ target: { name: "startDate", value: date } } as any);
                          handleChange({ target: { name: "startTime", value: time || "" } } as any);
                        }
                      }}
                      required
                      className={createStyles.dateTimeInput}
                    />
                  </div>
                </div>
                <span className={createStyles.dateSeparator}>To</span>
                <div className={createStyles.dateTimeInputGroup}>
                  <label className={createStyles.dateTimeLabel}>End date and time</label>
                  <div className={createStyles.dateTimeInputWrapper}>
                    <IconCalendar size={20} className={createStyles.dateIcon} />
                    <input
                      type="datetime-local"
                      value={
                        formData.endDate && formData.endTime
                          ? `${formData.endDate}T${formData.endTime}`
                          : ""
                      }
                      onChange={(e) => {
                        const dateTime = e.target.value;
                        if (dateTime) {
                          const [date, time] = dateTime.split("T");
                          handleChange({ target: { name: "endDate", value: date } } as any);
                          handleChange({ target: { name: "endTime", value: time || "" } } as any);
                        }
                      }}
                      required
                      className={createStyles.dateTimeInput}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Time Zone */}
          <div className={createStyles.inputWrapper}>
            <label className={createStyles.inputLabel}>
              Time zone<span className={createStyles.required}>*</span>
            </label>
            <div className={createStyles.selectWrapper}>
              <IconCalendar size={20} className={createStyles.selectIcon} />
              <select
                value={formData.timezone || ""}
                onChange={(e) => handleChange({ target: { name: "timezone", value: e.target.value } } as any)}
                required
                className={createStyles.select}
              >
                <option value="" disabled hidden>Select Timezone</option>
                <option value="GMT">GMT - Greenwich Mean Time</option>
                <option value="WAT">WAT - West Africa Time</option>
                <option value="EST">EST - Eastern Standard Time</option>
                <option value="PST">PST - Pacific Standard Time</option>
              </select>
            </div>
          </div>

          {/* Location / Venue Type */}
          <div className={createStyles.inputWrapper}>
            <label className={createStyles.inputLabel}>Location</label>
            <div className={createStyles.locationButtons}>
              <button
                type="button"
                className={`${createStyles.locationButton} ${
                  formData.locationType === "venue" || !formData.locationType
                    ? createStyles.locationButtonActive
                    : ""
                }`}
                onClick={() => handleChange({ target: { name: "locationType", value: "venue" } } as any)}
              >
                Venue
              </button>
              <button
                type="button"
                className={`${createStyles.locationButton} ${
                  formData.locationType === "virtual"
                    ? createStyles.locationButtonActive
                    : ""
                }`}
                onClick={() => handleChange({ target: { name: "locationType", value: "virtual" } } as any)}
              >
                Virtual event
              </button>
              <button
                type="button"
                className={`${createStyles.locationButton} ${
                  formData.locationType === "tba"
                    ? createStyles.locationButtonActive
                    : ""
                }`}
                onClick={() => handleChange({ target: { name: "locationType", value: "tba" } } as any)}
              >
                To be announced
              </button>
            </div>
          </div>

          {/* Virtual Mode */}
          {formData.locationType === "virtual" && (
             <div className={createStyles.inputWrapper}>
               <label className={createStyles.inputLabel}>Meeting Link</label>
               <input
                 type="url"
                 name="meetingLink"
                 placeholder="Enter meeting link"
                 value={formData.meetingLink || ""}
                 onChange={handleChange}
                 className={createStyles.input}
               />
             </div>
          )}

          {/* Venue Mode  */}
          {(!formData.locationType || formData.locationType === "venue") && (
            <>
              <div className={createStyles.inputWrapper}>
                <label className={createStyles.inputLabel}>Address</label>
                <input
                  type="text"
                  name="address"
                  placeholder="Enter main address"
                  value={formData.address || ""}
                  onChange={handleChange}
                  className={createStyles.input}
                />
              </div>

              <div className={createStyles.inputWrapper}>
                <label className={createStyles.inputLabel}>Street address</label>
                <input
                  type="text"
                  name="streetAddress"
                  placeholder="Enter street address"
                  value={formData.streetAddress || ""}
                  onChange={handleChange}
                  className={createStyles.input}
                />
              </div>

              <div className={createStyles.addressRow}>
                <div className={createStyles.inputWrapper}>
                  <label className={createStyles.inputLabel}>Country</label>
                  <input
                    type="text"
                    name="country"
                    placeholder="Country"
                    value={formData.country || ""}
                    onChange={handleChange}
                    className={createStyles.input}
                  />
                </div>
                <div className={createStyles.inputWrapper}>
                  <label className={createStyles.inputLabel}>State</label>
                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={formData.state || ""}
                    onChange={handleChange}
                    className={createStyles.input}
                  />
                </div>
              </div>
              
              <div className={createStyles.inputWrapper} style={{ marginBottom: '1rem' }}>
                <label className={createStyles.inputLabel}>City</label>
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={formData.city || ""}
                  onChange={handleChange}
                  className={createStyles.input}
                />
              </div>

              <LocationMapSection
                address={formData.address}
                streetAddress={formData.streetAddress}
                landmark={formData.landmark}
                additionalDetails={formData.additionalDetails}
                onLandmarkChange={(val) => handleChange({ target: { name: "landmark", value: val } } as any)}
                onAdditionalDetailsChange={(val) => handleChange({ target: { name: "additionalDetails", value: val } } as any)}
              />
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default DetailsStep;
