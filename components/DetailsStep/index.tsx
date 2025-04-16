import React from "react";
import { EventFormData } from "../../store/types";
import styles from "./styles.module.css"

interface DetailsStepProps {
  formData: EventFormData;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleLocationChange: (value: "Virtual" | "Physical") => void;
}

const DetailsStep: React.FC<DetailsStepProps> = ({
  formData,
  handleChange,
  handleLocationChange,
}) => {
  return (
    <div>
      {/* Title */}
      <div className={styles.formGroup}>
        <label htmlFor="title" className={styles.label}>
          Title <span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          id="title"
          placeholder="Event title"
          className={styles.input1}
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>

      {/* Description */}
      <div className={styles.formGroup}>
        <label htmlFor="description" className={styles.label}>
          Description <span className={styles.required}>*</span>
        </label>
        <textarea
          id="description"
          placeholder="Event description"
          className={styles.textarea}
          value={formData.description}
          onChange={handleChange}
          required
        ></textarea>
      </div>

      {/* Location */}
      <div className={styles.formGroup}>
        <label className={styles.label}>
          Location <span className={styles.required}>*</span>
        </label>
        <div className={styles.radioGroup}>
          <label>
            <input
              type="radio"
              name="location"
              value="Virtual"
              checked={formData.location === "Virtual"}
              onChange={() => handleLocationChange("Virtual")}
              className={styles.radioInput}
            />
            Virtual
          </label>
          <label>
            <input
              type="radio"
              name="location"
              value="Physical"
              checked={formData.location === "Physical"}
              onChange={() => handleLocationChange("Physical")}
              className={styles.radioInput}
            />
            Physical
          </label>
        </div>
      </div>

      {/* Address */}
      {formData.location === "Physical" && (
        <div className={styles.formGroup}>
          <label htmlFor="address" className={styles.label}>
            Address <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="address"
            placeholder="Enter address"
            className={styles.textAdress}
            value={formData.address || ""}
            onChange={handleChange}
            required={formData.location === "Physical"}
          />
        </div>
      )}

      {/* Start Date and Time */}
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="startDate" className={styles.label}>
            Start Date <span className={styles.required}>*</span>
          </label>
          <input
            type="date"
            id="startDate"
            className={styles.inputDate}
            value={formData.startDate}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="startTime" className={styles.label}>
            Start Time <span className={styles.required}>*</span>
          </label>
          <input
            type="time"
            id="startTime"
            className={styles.inputDate}
            value={formData.startTime}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      {/* End Date and Time */}
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="endDate" className={styles.label}>
            End Date <span className={styles.required}>*</span>
          </label>
          <input
            type="date"
            id="endDate"
            className={styles.inputDate}
            value={formData.endDate}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="endTime" className={styles.label}>
            End Time <span className={styles.required}>*</span>
          </label>
          <input
            type="time"
            id="endTime"
            className={styles.inputDate}
            value={formData.endTime}
            onChange={handleChange}
            required
          />
        </div>
      </div>
    </div>
  );
};

export default DetailsStep;


