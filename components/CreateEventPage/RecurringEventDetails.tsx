"use client";

import React, { useState } from "react";
import { IconCalendar, IconTrash } from "@tabler/icons-react";
import styles from "./styles.module.css";

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
}

interface RecurringEventDetailsProps {
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  repeatPattern: string;
  repeatOnDays: string[];
  repeatOnMonthDays: string[];
  timeMode: "single" | "multiple";
  timeSlots: TimeSlot[];
  onStartDateChange: (date: string) => void;
  onStartTimeChange: (time: string) => void;
  onEndDateChange: (date: string) => void;
  onEndTimeChange: (time: string) => void;
  onRepeatPatternChange: (pattern: string) => void;
  onRepeatOnDaysChange: (days: string[]) => void;
  onRepeatOnMonthDaysChange: (days: string[]) => void;
  onTimeModeChange: (mode: "single" | "multiple") => void;
  onTimeSlotsChange: (slots: TimeSlot[]) => void;
}

export default function RecurringEventDetails({
  startDate,
  startTime,
  endDate,
  endTime,
  repeatPattern,
  repeatOnDays,
  repeatOnMonthDays,
  timeMode,
  timeSlots,
  onStartDateChange,
  onStartTimeChange,
  onEndDateChange,
  onEndTimeChange,
  onRepeatPatternChange,
  onRepeatOnDaysChange,
  onRepeatOnMonthDaysChange,
  onTimeModeChange,
  onTimeSlotsChange,
}: RecurringEventDetailsProps) {
  const daysOfWeek = [
    { value: "mo", label: "Mo" },
    { value: "tu", label: "Tu" },
    { value: "we", label: "We" },
    { value: "th", label: "Th" },
    { value: "fr", label: "Fr" },
    { value: "sa", label: "Sa" },
    { value: "su", label: "Su" },
  ];

  // Generate days of the month (1-31)
  const daysOfMonth = Array.from({ length: 31 }, (_, i) => ({
    value: (i + 1).toString(),
    label: (i + 1).toString(),
  }));

  const handleDayToggle = (dayValue: string) => {
    if (repeatOnDays.includes(dayValue)) {
      onRepeatOnDaysChange(repeatOnDays.filter((day) => day !== dayValue));
    } else {
      onRepeatOnDaysChange([...repeatOnDays, dayValue]);
    }
  };

  const handleMonthDayToggle = (dayValue: string) => {
    if (repeatOnMonthDays.includes(dayValue)) {
      onRepeatOnMonthDaysChange(
        repeatOnMonthDays.filter((day) => day !== dayValue)
      );
    } else {
      onRepeatOnMonthDaysChange([...repeatOnMonthDays, dayValue]);
    }
  };

  const handleLastDayToggle = () => {
    if (repeatOnMonthDays.includes("last")) {
      onRepeatOnMonthDaysChange(
        repeatOnMonthDays.filter((day) => day !== "last")
      );
    } else {
      onRepeatOnMonthDaysChange([...repeatOnMonthDays, "last"]);
    }
  };
  const handleAddTimeSlot = () => {
    const newSlot: TimeSlot = {
      id: Date.now().toString(),
      startTime: "",
      endTime: "",
    };
    onTimeSlotsChange([...timeSlots, newSlot]);
  };

  const handleRemoveTimeSlot = (id: string) => {
    onTimeSlotsChange(timeSlots.filter((slot) => slot.id !== id));
  };

  const handleTimeSlotChange = (
    id: string,
    field: "startTime" | "endTime",
    value: string
  ) => {
    onTimeSlotsChange(
      timeSlots.map((slot) =>
        slot.id === id ? { ...slot, [field]: value } : slot
      )
    );
  };

  return (
    <div className={styles.recurringEventDetails}>
      {/* Date and Timing */}
      <div className={styles.inputWrapper}>
        <label className={styles.inputLabel}>
          Date and timing<span className={styles.required}>*</span>
        </label>
        <div className={styles.dateInputsContainer}>
          <div
            className={`${styles.dateTimeInputGroup} ${styles.recurringDateInputGroup}`}
          >
            <label className={styles.dateTimeLabel}>Start date and time</label>
            <div className={styles.dateTimeInputWrapper}>
              <IconCalendar
                size={20}
                className={styles.dateIcon}
                onClick={() => {
                  const input = document.getElementById(
                    "recurring-start-datetime-input"
                  ) as HTMLInputElement;
                  if (input) {
                    if (typeof input.showPicker === "function") {
                      input.showPicker();
                    } else {
                      input.click();
                    }
                  }
                }}
              />
              <input
                id="recurring-start-datetime-input"
                type="datetime-local"
                value={
                  startDate && startTime ? `${startDate}T${startTime}` : ""
                }
                onChange={(e) => {
                  const dateTime = e.target.value;
                  if (dateTime) {
                    const [date, time] = dateTime.split("T");
                    onStartDateChange(date);
                    onStartTimeChange(time || "");
                  } else {
                    onStartDateChange("");
                    onStartTimeChange("");
                  }
                }}
                required
                className={`${styles.dateTimeInput} ${styles.recurringDateInput}`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Repeats */}
      <div className={styles.inputWrapper}>
        <label className={styles.inputLabel}>
          Repeats<span className={styles.required}>*</span>
        </label>
        <div
          className={`${styles.selectWrapper} ${styles.recurringSelectWrapper}`}
        >
          <select
            value={repeatPattern}
            onChange={(e) => onRepeatPatternChange(e.target.value)}
            required
            className={`${styles.select} ${styles.recurringSelect}`}
          >
            <option value="" disabled hidden></option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>

      {/* Repeats On - Only show for Weekly */}
      {repeatPattern === "weekly" && (
        <div className={styles.inputWrapper}>
          <label className={styles.inputLabel}>
            Repeats On<span className={styles.required}>*</span>
          </label>
          <div className={styles.repeatOnDaysContainer}>
            {daysOfWeek.map((day) => (
              <button
                key={day.value}
                type="button"
                className={`${styles.dayButton} ${
                  repeatOnDays.includes(day.value)
                    ? styles.dayButtonSelected
                    : ""
                }`}
                onClick={() => handleDayToggle(day.value)}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Repeats On - Only show for Monthly */}
      {repeatPattern === "monthly" && (
        <div className={styles.inputWrapper}>
          <label className={styles.inputLabel}>
            Repeats On<span className={styles.required}>*</span>
          </label>
          <div className={styles.repeatOnMonthDaysContainer}>
            {daysOfMonth.map((day) => (
              <button
                key={day.value}
                type="button"
                className={`${styles.monthDayButton} ${
                  repeatOnMonthDays.includes(day.value)
                    ? styles.monthDayButtonSelected
                    : ""
                }`}
                onClick={() => handleMonthDayToggle(day.value)}
              >
                {day.label}
              </button>
            ))}
            <button
              type="button"
              className={`${styles.monthDayButton} ${styles.lastDayButton} ${
                repeatOnMonthDays.includes("last")
                  ? styles.monthDayButtonSelected
                  : ""
              }`}
              onClick={handleLastDayToggle}
            >
              Last
            </button>
          </div>
        </div>
      )}

      {/* End Date and Time */}
      <div className={styles.inputWrapper}>
        <label className={styles.inputLabel}>
          End date and time<span className={styles.required}>*</span>
        </label>
        <div className={styles.dateInputsContainer}>
          <div
            className={`${styles.dateTimeInputGroup} ${styles.recurringDateInputGroup}`}
          >
            <label className={styles.dateTimeLabel}>End date and time</label>
            <div className={styles.dateTimeInputWrapper}>
              <IconCalendar
                size={20}
                className={styles.dateIcon}
                onClick={() => {
                  const input = document.getElementById(
                    "recurring-end-datetime-input"
                  ) as HTMLInputElement;
                  if (input) {
                    if (typeof input.showPicker === "function") {
                      input.showPicker();
                    } else {
                      input.click();
                    }
                  }
                }}
              />
              <input
                id="recurring-end-datetime-input"
                type="datetime-local"
                value={endDate && endTime ? `${endDate}T${endTime}` : ""}
                onChange={(e) => {
                  const dateTime = e.target.value;
                  if (dateTime) {
                    const [date, time] = dateTime.split("T");
                    onEndDateChange(date);
                    onEndTimeChange(time || "");
                  } else {
                    onEndDateChange("");
                    onEndTimeChange("");
                  }
                }}
                required
                className={`${styles.dateTimeInput} ${styles.recurringDateInput}`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Time Section */}
      <div className={styles.inputWrapper}>
        <div className={styles.timeSectionHeader}>
          <label className={styles.inputLabel}>Time</label>
          {timeMode === "multiple" && (
            <button
              type="button"
              className={styles.addTimeSlotLink}
              onClick={handleAddTimeSlot}
            >
              Add a time slot
            </button>
          )}
        </div>

        {/* Time Mode Toggle */}
        <div className={styles.timeModeToggle}>
          <button
            type="button"
            className={`${styles.timeModeButton} ${
              timeMode === "single" ? styles.timeModeButtonActive : ""
            }`}
            onClick={() => onTimeModeChange("single")}
          >
            Single time
          </button>
          <button
            type="button"
            className={`${styles.timeModeButton} ${
              timeMode === "multiple" ? styles.timeModeButtonActive : ""
            }`}
            onClick={() => onTimeModeChange("multiple")}
          >
            Multiple time
          </button>
        </div>

        {/* Time Slots */}
        <div className={styles.timeSlotsContainer}>
          {timeMode === "single" ? (
            <div className={styles.timeSlotRow}>
              <div className={styles.timeInputGroup}>
                <label className={styles.timeSlotLabel}>Start time</label>
                <div className={styles.timeInputWrapper}>
                  <IconCalendar size={16} className={styles.timeIcon} />
                  <input
                    type="time"
                    value={timeSlots.length > 0 ? timeSlots[0].startTime : ""}
                    onChange={(e) => {
                      if (timeSlots.length > 0) {
                        handleTimeSlotChange(
                          timeSlots[0].id,
                          "startTime",
                          e.target.value
                        );
                      } else {
                        const newSlot: TimeSlot = {
                          id: "single",
                          startTime: e.target.value,
                          endTime: "",
                        };
                        onTimeSlotsChange([newSlot]);
                      }
                    }}
                    className={styles.timeInput}
                  />
                </div>
              </div>
              <div className={styles.timeInputGroup}>
                <label className={styles.timeSlotLabel}>End time</label>
                <div className={styles.timeInputWrapper}>
                  <IconCalendar size={16} className={styles.timeIcon} />
                  <input
                    type="time"
                    value={timeSlots.length > 0 ? timeSlots[0].endTime : ""}
                    onChange={(e) => {
                      if (timeSlots.length > 0) {
                        handleTimeSlotChange(
                          timeSlots[0].id,
                          "endTime",
                          e.target.value
                        );
                      } else {
                        const newSlot: TimeSlot = {
                          id: "single",
                          startTime: "",
                          endTime: e.target.value,
                        };
                        onTimeSlotsChange([newSlot]);
                      }
                    }}
                    className={styles.timeInput}
                  />
                </div>
              </div>
            </div>
          ) : (
            timeSlots.map((slot, index) => (
              <div key={slot.id} className={styles.timeSlotRow}>
                <div className={styles.timeInputGroup}>
                  <label className={styles.timeSlotLabel}>Start time</label>
                  <div className={styles.timeInputWrapper}>
                    <IconCalendar size={16} className={styles.timeIcon} />
                    <input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) =>
                        handleTimeSlotChange(
                          slot.id,
                          "startTime",
                          e.target.value
                        )
                      }
                      className={styles.timeInput}
                    />
                  </div>
                </div>
                <div className={styles.timeInputGroup}>
                  <label className={styles.timeSlotLabel}>End time</label>
                  <div className={styles.timeInputWrapper}>
                    <IconCalendar size={16} className={styles.timeIcon} />
                    <input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) =>
                        handleTimeSlotChange(slot.id, "endTime", e.target.value)
                      }
                      className={styles.timeInput}
                    />
                  </div>
                </div>
                {timeSlots.length > 1 && (
                  <button
                    type="button"
                    className={styles.removeTimeSlotButton}
                    onClick={() => handleRemoveTimeSlot(slot.id)}
                  >
                    <IconTrash size={18} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
