import CreateEventForm from "@/components/CreateEventForm/EventForm";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import React from "react";

function CreateEventFormPage() {
  return (
    <ProtectedRoute>
      <div>
        <CreateEventForm />
      </div>
    </ProtectedRoute>
  );
}

export default CreateEventFormPage;
