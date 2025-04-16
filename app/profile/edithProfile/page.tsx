"use client";
import React from "react";
import styles from "./styles.module.css";
import Image from "next/image";
import { Flex, Stack } from "@mantine/core";
import Navbar from "@/components/navbar";
import CustomFooter from "@/components/Footer";
// import { logout, persistor, useAppDispatch } from "@/store/store";
// import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, SubmitHandler } from "react-hook-form";
import classNames from "classnames"; // Recommended for handling multiple/conditional classes

interface FormData {
  firstName: string;
  lastName: string;
  companyName: string;
  phoneNumber: string;
}

const EdithProfilePage: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit: SubmitHandler<FormData> = (data) => {
    console.log("Form Data: ", data);
  };

//   const dispatch = useAppDispatch();
//   const router = useRouter();

//   const handleLogout = async () => {
//     dispatch(logout());
//     await persistor.purge();
//     router.push("/");
//   };

  return (
    <Stack>
      <Stack>
        <Navbar />
      </Stack>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>Edit Profile</h1>
        </header>
        <main className={styles.main}>
          <div className={styles.profileCard}>
            <div className={styles.profileCard1}>
              <div className={styles.profileImage}>
                <Image
                  src="/images/profile.png"
                  alt="Profile"
                  width={150}
                  height={150}
                  className={styles.image}
                />
              </div>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className={styles.formContainer}
              >
                <Flex className={styles.flexContainer}>
                  {/* First Name */}
                  <div className={styles.formGroup}>
                    <label htmlFor="firstName" className={styles.label}>
                      First Name <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      {...register("firstName", {
                        required: "First name is required",
                      })}
                      className={classNames(styles.inputField, {
                        [styles.errorBorder]: errors.firstName,
                      })}
                    />
                    {errors.firstName && (
                      <p className={styles.errorMessage}>
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div className={styles.formGroup}>
                    <label htmlFor="lastName" className={styles.label}>
                      Last Name <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      {...register("lastName", {
                        required: "Last name is required",
                      })}
                      className={classNames(styles.inputField, {
                        [styles.errorBorder]: errors.lastName,
                      })}
                    />
                    {errors.lastName && (
                      <p className={styles.errorMessage}>
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </Flex>

                {/* Company Name */}
                <div className={styles.fullWidth}>
                  <label htmlFor="companyName" className={styles.label}>
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    {...register("companyName")}
                    className={styles.inputField1}
                  />
                </div>

                {/* Phone Number */}
                <div className={styles.fullWidth}>
                  <label htmlFor="phoneNumber" className={styles.label}>
                    Phone Number <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    id="phoneNumber"
                    {...register("phoneNumber", {
                      required: "Phone number is required",
                    })}
                    className={classNames(styles.inputField1, {
                      [styles.errorBorder]: errors.phoneNumber,
                    })}
                  />
                  {errors.phoneNumber && (
                    <p className={styles.errorMessage}>
                      {errors.phoneNumber.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                {/* <div className={styles.fullWidth} style={{ textAlign: "right" }}>
                  <button type="submit" className={styles.submitButton}>
                  Save changes
                  </button>
                </div> */}
              </form>
            </div>
            <div className={styles.actions}>
              <button  className={styles.editButton}>
              Save changes 
              </button>
              <Link href="/profile/profile">
                <button className={styles.logoutButton}> Back to Profile</button>
              </Link>
            </div>
          </div>
        </main>
      </div>
      <div>
        <CustomFooter />
      </div>
    </Stack>
  );
};

export default EdithProfilePage;
