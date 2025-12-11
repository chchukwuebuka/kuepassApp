"use client";

import React, { useState } from "react";
import {
  IconX,
  IconBrandInstagram,
  IconBrandYoutube,
  IconBrandTiktok,
  IconMapPin,
  IconChartLine,
  IconChevronRight,
  IconPencil,
  IconTrash,
  IconPlus,
} from "@tabler/icons-react";
import styles from "./styles.module.css";
import LineUpModal, { LineUpItem } from "./LineUpModal";
import ItineraryModal, { Schedule } from "./ItineraryModal";

interface EventDetailsSectionProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  socialLinks: {
    instagram?: string;
    youtube?: string;
    tiktok?: string;
  };
  onSocialLinksChange: (links: {
    instagram?: string;
    youtube?: string;
    tiktok?: string;
  }) => void;
  sections: string[];
  onSectionsChange: (sections: string[]) => void;
  lineupItems?: LineUpItem[];
  onLineupItemsChange?: (items: LineUpItem[]) => void;
  schedules?: Schedule[];
  onSchedulesChange?: (schedules: Schedule[]) => void;
}

export default function EventDetailsSection({
  tags,
  onTagsChange,
  socialLinks,
  onSocialLinksChange,
  sections,
  onSectionsChange,
  lineupItems = [],
  onLineupItemsChange,
  schedules = [],
  onSchedulesChange,
}: EventDetailsSectionProps) {
  const [tagInput, setTagInput] = useState("");
  const [showLineUpExample, setShowLineUpExample] = useState(false);
  const [showItineraryExample, setShowItineraryExample] = useState(false);
  const [isLineUpModalOpen, setIsLineUpModalOpen] = useState(false);
  const [isItineraryModalOpen, setIsItineraryModalOpen] = useState(false);
  const [editingLineUpItem, setEditingLineUpItem] = useState<LineUpItem | null>(
    null
  );

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        onTagsChange([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleAddSection = (sectionName: string) => {
    if (!sections.includes(sectionName)) {
      onSectionsChange([...sections, sectionName]);
    }
    // Open lineup modal when "Add" is clicked for lineup
    if (sectionName === "lineup" && onLineupItemsChange) {
      setEditingLineUpItem(null);
      setIsLineUpModalOpen(true);
    }
    // Open itinerary modal when "Add" is clicked for itinerary
    if (sectionName === "itinerary" && onSchedulesChange) {
      setIsItineraryModalOpen(true);
    }
  };

  const handleSaveLineUpItem = (item: LineUpItem) => {
    if (!onLineupItemsChange) return;

    if (editingLineUpItem) {
      // Update existing item
      const updatedItems = lineupItems.map((i) =>
        i.id === item.id ? item : i
      );
      onLineupItemsChange(updatedItems);
    } else {
      // Add new item
      onLineupItemsChange([...lineupItems, item]);
    }
    setIsLineUpModalOpen(false);
    setEditingLineUpItem(null);
  };

  const handleEditLineUpItem = (item: LineUpItem) => {
    setEditingLineUpItem(item);
    setIsLineUpModalOpen(true);
  };

  const handleRemoveLineUpItem = (itemId: string) => {
    if (!onLineupItemsChange) return;
    onLineupItemsChange(lineupItems.filter((item) => item.id !== itemId));
  };

  const handleEditSchedule = () => {
    if (onSchedulesChange) {
      setIsItineraryModalOpen(true);
    }
  };

  const handleRemoveSchedule = (scheduleId: string) => {
    if (!onSchedulesChange) return;
    onSchedulesChange(
      schedules.filter((schedule) => schedule.id !== scheduleId)
    );
  };

  return (
    <div className={styles.eventDetailsSection}>
      {/* Tags Section */}
      <div className={styles.detailsSubSection}>
        <h3 className={styles.detailsSectionTitle}>Tags</h3>
        <p className={styles.detailsSectionDescription}>
          Help people discover your event by adding tags related to your
          event&apos;s theme, topic, vibe, location, and more.
        </p>
        <div className={styles.tagsContainer}>
          <div className={styles.tagsInputWrapper}>
            {tags.map((tag, index) => (
              <div key={index} className={styles.tag}>
                <span className={styles.tagText}>{tag}</span>
                <button
                  type="button"
                  className={styles.tagRemoveButton}
                  onClick={() => handleRemoveTag(tag)}
                >
                  <IconX size={14} />
                </button>
              </div>
            ))}
            <input
              type="text"
              placeholder="Add tags..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              className={styles.tagInput}
            />
          </div>
          <p className={styles.tagsHint}>Add search keywords to your event.</p>
        </div>
      </div>

      {/* Social Links Section */}
      <div className={styles.detailsSubSection}>
        <h3 className={styles.detailsSectionTitle}>Add Social links</h3>
        <p className={styles.detailsSectionDescription}>
          Launch your event in no time—just minutes.
        </p>
        <div className={styles.socialLinksContainer}>
          <div className={styles.socialLinkInput}>
            <IconBrandInstagram size={20} className={styles.socialIcon} />
            <input
              type="url"
              placeholder="Instagram URL"
              value={socialLinks.instagram || ""}
              onChange={(e) =>
                onSocialLinksChange({
                  ...socialLinks,
                  instagram: e.target.value,
                })
              }
              className={styles.socialInput}
            />
          </div>
          <div className={styles.socialLinkInput}>
            <IconBrandYoutube size={20} className={styles.socialIcon} />
            <input
              type="url"
              placeholder="Youtube URL"
              value={socialLinks.youtube || ""}
              onChange={(e) =>
                onSocialLinksChange({
                  ...socialLinks,
                  youtube: e.target.value,
                })
              }
              className={styles.socialInput}
            />
          </div>
          <div className={styles.socialLinkInput}>
            <IconBrandTiktok size={20} className={styles.socialIcon} />
            <input
              type="url"
              placeholder="TikTok URL"
              value={socialLinks.tiktok || ""}
              onChange={(e) =>
                onSocialLinksChange({
                  ...socialLinks,
                  tiktok: e.target.value,
                })
              }
              className={styles.socialInput}
            />
          </div>
        </div>
      </div>

      {/* Add Sections Section */}
      <div className={styles.detailsSubSection}>
        <h3 className={styles.detailsSectionTitle}>Add Sections</h3>
        <p className={styles.detailsSectionDescription}>
          Sell more tickets. Answer fewer messages. Add these sections to help
          attendees find info fast and make your event stand out.
        </p>
        <div className={styles.sectionsContainer}>
          <div className={styles.sectionItem}>
            <div className={styles.sectionItemLeft}>
              <div className={styles.sectionIconWrapper}>
                <IconMapPin size={20} className={styles.sectionIcon} />
              </div>
              <span className={styles.sectionName}>Line up</span>
            </div>
            <div className={styles.sectionItemRight}>
              <button
                type="button"
                className={styles.seeExampleLink}
                onClick={() => setShowLineUpExample(true)}
              >
                see example
              </button>
              <button
                type="button"
                className={`${styles.addSectionButton} ${
                  sections.includes("lineup")
                    ? styles.addSectionButtonAdded
                    : ""
                }`}
                onClick={() => {
                  if (!sections.includes("lineup")) {
                    handleAddSection("lineup");
                  } else {
                    // If already added, allow editing/adding more items
                    setEditingLineUpItem(null);
                    setIsLineUpModalOpen(true);
                  }
                }}
              >
                <IconChartLine size={16} />
                {sections.includes("lineup") ? "Added" : "Add"}
              </button>
            </div>
          </div>
          <div className={styles.sectionDivider}></div>

          {/* Lineup Items Display */}
          {sections.includes("lineup") && lineupItems.length > 0 && (
            <div className={styles.lineupItemsContainer}>
              <div className={styles.lineupItemsGrid}>
                {lineupItems.map((item) => (
                  <div key={item.id} className={styles.lineupCard}>
                    <div className={styles.lineupCardImage}>
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className={styles.lineupCardAvatar}
                        />
                      ) : (
                        <div className={styles.lineupCardPlaceholder}>
                          <IconChartLine size={24} />
                        </div>
                      )}
                    </div>
                    <div className={styles.lineupCardContent}>
                      <div className={styles.lineupCardHeader}>
                        <h4 className={styles.lineupCardName}>{item.name}</h4>
                        <div className={styles.lineupCardBadge}>
                          {item.role}
                        </div>
                      </div>
                      {item.description && (
                        <p className={styles.lineupCardDescription}>
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div className={styles.lineupCardActions}>
                      <button
                        type="button"
                        className={styles.lineupCardEditButton}
                        onClick={() => handleEditLineUpItem(item)}
                        title="Edit"
                      >
                        <IconPencil size={16} />
                      </button>
                      <button
                        type="button"
                        className={styles.lineupCardDeleteButton}
                        onClick={() => handleRemoveLineUpItem(item.id)}
                        title="Remove"
                      >
                        <IconTrash size={16} />
                      </button>
                      <IconChevronRight
                        size={20}
                        className={styles.lineupCardChevron}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={styles.sectionItem}>
            <div className={styles.sectionItemLeft}>
              <div className={styles.sectionIconWrapper}>
                <IconMapPin size={20} className={styles.sectionIcon} />
              </div>
              <span className={styles.sectionName}>Itinerary</span>
            </div>
            <div className={styles.sectionItemRight}>
              <button
                type="button"
                className={styles.seeExampleLink}
                onClick={() => setShowItineraryExample(true)}
              >
                see example
              </button>
              <button
                type="button"
                className={`${styles.addSectionButton} ${
                  sections.includes("itinerary")
                    ? styles.addSectionButtonAdded
                    : ""
                }`}
                onClick={() => {
                  if (!sections.includes("itinerary")) {
                    handleAddSection("itinerary");
                  } else {
                    // If already added, allow editing/adding more schedules
                    setIsItineraryModalOpen(true);
                  }
                }}
              >
                <IconChartLine size={16} />
                {sections.includes("itinerary") ? "Added" : "Add"}
              </button>
            </div>
          </div>

          {/* Itinerary Schedules Display */}
          {sections.includes("itinerary") && schedules.length > 0 && (
            <div className={styles.itinerarySchedulesContainer}>
              {schedules.map((schedule) => (
                <div key={schedule.id} className={styles.scheduleSection}>
                  <div className={styles.scheduleSectionHeader}>
                    <h4 className={styles.scheduleSectionTitle}>
                      {schedule.name}
                    </h4>
                    <div className={styles.scheduleSectionActions}>
                      <button
                        type="button"
                        className={styles.scheduleEditButton}
                        onClick={() => setIsItineraryModalOpen(true)}
                        title="Edit Schedule"
                      >
                        <IconPencil size={16} />
                      </button>
                      <button
                        type="button"
                        className={styles.scheduleDeleteButton}
                        onClick={() => handleRemoveSchedule(schedule.id)}
                        title="Remove Schedule"
                      >
                        <IconTrash size={16} />
                      </button>
                    </div>
                  </div>
                  {schedule.slots.length > 0 ? (
                    <div className={styles.scheduleSlotsList}>
                      {schedule.slots.map((slot) => (
                        <div key={slot.id} className={styles.scheduleSlotCard}>
                          <div className={styles.scheduleSlotContent}>
                            <div className={styles.scheduleSlotHeader}>
                              <h5 className={styles.scheduleSlotTitle}>
                                {slot.title}
                              </h5>
                              <div className={styles.scheduleSlotTime}>
                                {slot.startTime} - {slot.endTime}
                              </div>
                            </div>
                            {slot.hostName && (
                              <p className={styles.scheduleSlotHost}>
                                Host: {slot.hostName}
                              </p>
                            )}
                            {slot.description && (
                              <p className={styles.scheduleSlotDescription}>
                                {slot.description}
                              </p>
                            )}
                          </div>
                          <IconChevronRight
                            size={20}
                            className={styles.scheduleSlotChevron}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.scheduleEmptyText}>
                      No slots added yet. Click &quot;Add&quot; to create a
                      schedule.
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Example Modal */}
      {(showLineUpExample || showItineraryExample) && (
        <div
          className={styles.exampleModalOverlay}
          onClick={() => {
            setShowLineUpExample(false);
            setShowItineraryExample(false);
          }}
        >
          <div
            className={styles.exampleModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.exampleModalHeader}>
              <h3 className={styles.exampleModalTitle}>
                {showLineUpExample ? "Line up" : "Itinerary"} Example
              </h3>
              <button
                type="button"
                className={styles.exampleModalClose}
                onClick={() => {
                  setShowLineUpExample(false);
                  setShowItineraryExample(false);
                }}
              >
                <IconX size={20} />
              </button>
            </div>
            <div className={styles.exampleModalContent}>
              <div className={styles.exampleCard}>
                <div className={styles.exampleCardImage}>
                  <img
                    src="/images/testiwoman.png"
                    alt="Speaker"
                    className={styles.exampleCardAvatar}
                  />
                </div>
                <div className={styles.exampleCardContent}>
                  <h4 className={styles.exampleCardName}>Maria Torres</h4>
                  <p className={styles.exampleCardTitle}>
                    How to Start a Business
                  </p>
                </div>
                <div className={styles.exampleCardBadge}>Keynote</div>
                <IconChevronRight
                  size={20}
                  className={styles.exampleCardChevron}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LineUp Modal */}
      {onLineupItemsChange && (
        <LineUpModal
          isOpen={isLineUpModalOpen}
          onClose={() => {
            setIsLineUpModalOpen(false);
            setEditingLineUpItem(null);
          }}
          onSave={handleSaveLineUpItem}
          editingItem={editingLineUpItem}
        />
      )}

      {/* Itinerary Modal */}
      {onSchedulesChange && (
        <ItineraryModal
          isOpen={isItineraryModalOpen}
          onClose={() => setIsItineraryModalOpen(false)}
          onSave={onSchedulesChange}
          existingSchedules={schedules}
        />
      )}
    </div>
  );
}
