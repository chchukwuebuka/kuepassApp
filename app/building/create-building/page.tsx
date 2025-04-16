"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import styles from "./styles.module.css";
import { Button, Stack } from "@mantine/core";
import DetailsStep from "@/components/building/DetailsStep";
import MembersStep from "@/components/building/MembersStep";
import AppearanceStep from "@/components/building/AppearanceStep";
import Navbar from "@/components/navbar";
import Modal from "@/components/Modal"; 

interface Member {
  name: string;
  email: string;
  number: string;
}

interface FormValues {
  title: string;
  address: string;
}

const steps = ["Details", "Members", "Appearance"];

const CreateBuilding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [members, setMembers] = useState<Member[]>([]);
  const [showModal, setShowModal] = useState(false); 

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  // Subscribe to the title and address field changes
  const title = useWatch({
    control,
    name: "title",
  });
  const address = useWatch({
    control,
    name: "address",
  });

  const onSubmit = (data: FormValues) => {
    console.log("Validated data from DetailsStep:", data);
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const addMember = (member: Member) => {
    setMembers([...members, member]);
  };

  const deleteMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleFinalSubmit = () => {
    setShowModal(true);
  };

  return (
    <div className={styles.container}>
      <Stack className={styles.navStark}>
        <Navbar />
      </Stack>
      <h2 className={styles.title}>Create A New Building</h2>
      <p className={styles.subtitle}>You are Just Three Steps Away!</p>

      {/* Step Progress Indicator */}
      <div className={styles.progressContainer}>
        {steps.map((step, index) => (
          <div key={index} className={styles.step}>
            <div
              className={`${styles.stepNumber} ${
                currentStep >= index ? styles.active : ""
              }`}
            >
              {index + 1}
            </div>
            <span className={currentStep === index ? styles.activeText : ""}>
              {step}
            </span>
          </div>
        ))}
      </div>

      {/* Step Forms */}
      <div className={styles.formContainer}>
        {currentStep === 0 ? (
          <form onSubmit={handleSubmit(onSubmit)}>
            <DetailsStep register={register} errors={errors} />
            <div className={styles.buttonContainer1}>
            </div>
          </form>
        ) : (
          <>
            {currentStep === 1 && <MembersStep addMember={addMember} />}
            {currentStep === 2 && (
              <AppearanceStep title={title} address={address} />
            )}
          </>
        )}
      </div>

      {/* Display Members Table - Always visible */}
      {members.length > 0 && (
        <div className={styles.actionMember}>
          <h3 className={styles.action}>Added Members</h3>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email Address</th>
                <th>Phone Number</th>
                <th className={styles.action1}>Action</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member, index) => (
                <tr key={index}>
                  <td>{member.name}</td>
                  <td>{member.email}</td>
                  <td>{member.number}</td>
                  <td>
                    <button
                      className={styles.deleteButton}
                      onClick={() => deleteMember(index)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className={styles.buttonContainer}>
        {currentStep > 0 && (
          <Button
            onClick={prevStep}
            variant="outline"
            className={styles.buttonPrevious}
          >
            Previous
          </Button>
        )}
        {currentStep < steps.length - 1 ? (
          <Button onClick={nextStep} className={styles.buttonNext}>
            Continue
          </Button>
        ) : (
          <Button onClick={handleFinalSubmit} className={styles.buttonSubmit}>
            Submit
          </Button>
        )}
      </div>

      {/* Render the Modal overlay */}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        title="Building Added"
        message="You have successfully added the Crisp TV Building. Check “My Building” to view all buildings."
      />
    </div>
  );
};

export default CreateBuilding;
