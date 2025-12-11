"use client";

import React, { useState, useEffect } from "react";
import { IconX, IconUser, IconChartLine } from "@tabler/icons-react";
import styles from "./ItineraryModal.module.css";

export interface ScheduleSlot {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  hostName?: string;
  description?: string;
}

export interface Schedule {
  id: string;
  name: string;
  slots: ScheduleSlot[];
}

interface ItineraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (schedules: Schedule[]) => void;
  existingSchedules?: Schedule[];
}

const ItineraryModal: React.FC<ItineraryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingSchedules = [],
}) => {
  const [schedules, setSchedules] = useState<Schedule[]>(
    existingSchedules.length > 0
      ? existingSchedules
      : [{ id: `schedule-${Date.now()}`, name: "Schedule 1", slots: [] }]
  );
  const [activeScheduleIndex, setActiveScheduleIndex] = useState(0);
  const [currentSlot, setCurrentSlot] = useState<ScheduleSlot>({
    id: "",
    title: "",
    startTime: "",
    endTime: "",
    hostName: "",
    description: "",
  });
  const [showHostInput, setShowHostInput] = useState(false);
  const [showDescriptionInput, setShowDescriptionInput] = useState(false);
  const [activeButton, setActiveButton] = useState<
    "host" | "description" | null
  >(null);

  useEffect(() => {
    if (existingSchedules.length > 0) {
      setSchedules(existingSchedules);
    }
  }, [existingSchedules]);

  const handleAddSchedule = () => {
    const newSchedule: Schedule = {
      id: `schedule-${Date.now()}`,
      name: `Schedule ${schedules.length + 1}`,
      slots: [],
    };
    setSchedules([...schedules, newSchedule]);
    setActiveScheduleIndex(schedules.length);
  };

  const handleAddSlot = () => {
    if (
      !currentSlot.title.trim() ||
      !currentSlot.startTime ||
      !currentSlot.endTime
    ) {
      alert("Please fill in title, start time, and end time.");
      return;
    }

    const newSlot: ScheduleSlot = {
      ...currentSlot,
      id: currentSlot.id || `slot-${Date.now()}`,
    };

    const updatedSchedules = [...schedules];
    updatedSchedules[activeScheduleIndex].slots = [
      ...updatedSchedules[activeScheduleIndex].slots,
      newSlot,
    ];
    setSchedules(updatedSchedules);

    // Reset form
    setCurrentSlot({
      id: "",
      title: "",
      startTime: "",
      endTime: "",
      hostName: "",
      description: "",
    });
    setShowHostInput(false);
    setShowDescriptionInput(false);
    setActiveButton(null);
  };

  const handleRemoveSlot = (slotId: string) => {
    const updatedSchedules = [...schedules];
    updatedSchedules[activeScheduleIndex].slots = updatedSchedules[
      activeScheduleIndex
    ].slots.filter((slot) => slot.id !== slotId);
    setSchedules(updatedSchedules);
  };

  const handleSave = () => {
    onSave(schedules);
    onClose();
  };

  if (!isOpen) return null;

  const activeSchedule = schedules[activeScheduleIndex];

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button type="button" className={styles.closeButton} onClick={onClose}>
          <IconX size={20} />
        </button>

        <div className={styles.modalBody}>
          <h2 className={styles.modalTitle}>Schedule</h2>
          <p className={styles.modalDescription}>
            Map out your event&apos;s schedule. Include the time for each
            activity, a short description of what&apos;s planned, and who will
            be leading it (like a guide, artist, or special guest). For
            multi-day events, you can add a different agenda for each day.
          </p>

          {/* Schedule Navigation */}
          <div className={styles.scheduleNavigation}>
            {schedules.map((schedule, index) => (
              <button
                key={schedule.id}
                type="button"
                className={`${styles.scheduleTab} ${
                  index === activeScheduleIndex ? styles.scheduleTabActive : ""
                }`}
                onClick={() => setActiveScheduleIndex(index)}
              >
                {schedule.name}
              </button>
            ))}
            <button
              type="button"
              className={styles.addScheduleButton}
              onClick={handleAddSchedule}
            >
              + Add another schedule
            </button>
          </div>

          {/* Form Container */}
          <div className={styles.formContainer}>
            {/* Title Input */}
            <div className={styles.formField}>
              <label className={styles.fieldLabel}>
                Title<span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                value={currentSlot.title}
                onChange={(e) =>
                  setCurrentSlot({ ...currentSlot, title: e.target.value })
                }
                className={styles.textInput}
                placeholder="Enter title"
                required
              />
            </div>

            {/* Time Fields */}
            <div className={styles.timeFieldsRow}>
              <div className={styles.formField}>
                <label className={styles.fieldLabel}>
                  Start time<span className={styles.required}>*</span>
                </label>
                <input
                  type="time"
                  value={currentSlot.startTime}
                  onChange={(e) =>
                    setCurrentSlot({
                      ...currentSlot,
                      startTime: e.target.value,
                    })
                  }
                  className={styles.timeInput}
                  required
                />
              </div>
              <div className={styles.formField}>
                <label className={styles.fieldLabel}>
                  End time<span className={styles.required}>*</span>
                </label>
                <input
                  type="time"
                  value={currentSlot.endTime}
                  onChange={(e) =>
                    setCurrentSlot({ ...currentSlot, endTime: e.target.value })
                  }
                  className={styles.timeInput}
                  required
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className={styles.actionButtonsRow}>
              <button
                type="button"
                className={`${styles.addHostButton} ${
                  activeButton === "host" || showHostInput
                    ? styles.buttonActive
                    : ""
                }`}
                onClick={() => {
                  setShowHostInput(true);
                  setActiveButton("host");
                }}
              >
                <IconUser size={20} />
                Add Host/Artist
              </button>
              <button
                type="button"
                className={`${styles.addDescriptionButton} ${
                  activeButton === "description" || showDescriptionInput
                    ? styles.buttonActive
                    : ""
                }`}
                onClick={() => {
                  setShowDescriptionInput(true);
                  setActiveButton("description");
                }}
              >
                <IconChartLine size={20} />
                Add description
              </button>
            </div>

            {/* Host Name Input */}
            {showHostInput && (
              <div className={styles.formField}>
                <label className={styles.fieldLabel}>Host name</label>
                <div className={styles.hostInputWrapper}>
                  <input
                    type="text"
                    value={currentSlot.hostName || ""}
                    onChange={(e) =>
                      setCurrentSlot({
                        ...currentSlot,
                        hostName: e.target.value,
                      })
                    }
                    className={styles.textInput}
                    placeholder="Enter host name"
                  />
                  <button
                    type="button"
                    className={styles.clearButton}
                    onClick={() => {
                      setCurrentSlot({ ...currentSlot, hostName: "" });
                      setShowHostInput(false);
                      setActiveButton(null);
                    }}
                  >
                    <IconX size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Description Input */}
            {showDescriptionInput && (
              <div className={styles.formField}>
                <label className={styles.fieldLabel}>Description</label>
                <textarea
                  value={currentSlot.description || ""}
                  onChange={(e) =>
                    setCurrentSlot({
                      ...currentSlot,
                      description: e.target.value,
                    })
                  }
                  className={styles.textarea}
                  placeholder="Enter description"
                  rows={3}
                />
              </div>
            )}

            {/* Add Slot Button */}
            <button
              type="button"
              className={styles.addSlotButton}
              onClick={handleAddSlot}
            >
              + Add Slot
            </button>

            {/* Existing Slots List */}
            {activeSchedule.slots.length > 0 && (
              <div className={styles.slotsList}>
                {activeSchedule.slots.map((slot) => {
                  const formatTime = (time: string): string => {
                    if (!time) return "";
                    // Convert 24-hour format (HH:mm) to 12-hour format (h:mm AM/PM)
                    const [hours, minutes] = time.split(":");
                    const hour = parseInt(hours, 10);
                    const ampm = hour >= 12 ? "pm" : "am";
                    const hour12 = hour % 12 || 12;
                    return `${hour12}:${minutes}${ampm}`;
                  };
                  return (
                    <div key={slot.id} className={styles.slotItem}>
                      <div className={styles.slotTime}>
                        {formatTime(slot.startTime)} -{" "}
                        {formatTime(slot.endTime)}
                      </div>
                      <h4 className={styles.slotTitle}>{slot.title}</h4>
                      {slot.hostName && (
                        <div className={styles.slotHostBadge}>
                          {slot.hostName}
                        </div>
                      )}
                      <button
                        type="button"
                        className={styles.removeSlotButton}
                        onClick={() => handleRemoveSlot(slot.id)}
                        title="Remove slot"
                      >
                        <IconX size={18} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.saveButton}
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItineraryModal;
