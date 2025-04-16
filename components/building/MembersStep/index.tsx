import React from "react";
import { useForm } from "react-hook-form";
import styles from "./styles.module.css";

interface Member {
  name: string;
  email: string;
  number: string;
}

interface MembersStepProps {
  addMember: (member: Member) => void;
}

const MembersStep: React.FC<MembersStepProps> = ({ addMember }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<Member>();

  const onSubmit = (data: Member) => {
    addMember(data); 
    reset(); 
  };

  return (
    <div>
      <h3>Add Members</h3>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Name Field */}
        <div className={styles.containerTitle}>
          <label className={styles.TitleLabel}>Name</label>
          <input
            type="text"
            {...register("name", { required: "Name is required" })}
            placeholder="Enter name"
            className={styles.TitleInput}
          />
          {errors.name && <span className={styles.errorText}>{String(errors.name.message)}</span>}
        </div>

        {/* Email Field */}
        <div className={styles.containerTitle}>
          <label className={styles.TitleLabel}>Email</label>
          <input
            type="email"
            {...register("email", { required: "Email is required" })}
            placeholder="Enter email"
            className={styles.TitleInput}
          />
          {errors.email && <span className={styles.errorText}>{String(errors.email.message)}</span>}
        </div>

        {/* Phone Number Field */}
        <div className={styles.containerTitle}>
          <label className={styles.TitleLabel}>Phone Number</label>
          <input
            type="text"
            {...register("number", { required: "Phone number is required" })}
            placeholder="Enter phone number"
            className={styles.TitleInput}
          />
          {errors.number && <span className={styles.errorText}>{String(errors.number.message)}</span>}
        </div>

        {/* Add Member Button */}
        <div className={styles.addMember}>
          <button type="submit" className={styles.add}>Add Member</button>
        </div>
      </form>
    </div>
  );
};

export default MembersStep;
