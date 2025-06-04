import CreateEventForm from "@/components/CreateEventForm/EventForm";
// import AuthGuard from "@/app/components/AuthGuard";
import React from "react";

function CreateEventFormPage() {
  return (
    // <AuthGuard requireAuth={true}>
      <div>
        <CreateEventForm />
      </div>
    // </AuthGuard>
  );
}

export default CreateEventFormPage;
