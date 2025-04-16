import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import styles from "./styles.module.css";

interface FormValues {
  title: string;
  address: string;
}

interface DetailsStepProps {
  register: UseFormRegister<FormValues>;
  errors: FieldErrors<FormValues>;
}

const DetailsStep: React.FC<DetailsStepProps> = ({ register, errors }) => {
  return (
    <>
      <div className={styles.containerTitle}>
        <label className={styles.TitleLabel}>Title</label>
        <input
          type="text"
          {...register("title", { required: "Title is required" })}
          placeholder="Regular"
          className={styles.TitleInput}
        />
        {errors.title && (
          <span className={styles.errorText}>{errors.title.message}</span>
        )}
      </div>

      <div className={styles.containerTitle1}>
        <label className={styles.TitleLabel}>Address</label>
        <input
          type="text"
          {...register("address", { required: "Address is required" })}
          placeholder="Enter building address"
          className={styles.TitleInput}
        />
        {errors.address && (
          <span className={styles.errorText}>{errors.address.message}</span>
        )}
      </div>
    </>
  );
};

export default DetailsStep;


