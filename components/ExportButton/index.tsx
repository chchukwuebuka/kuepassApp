import { useState } from "react";
import styles from "./styles.module.css";
import { authenticatedRequest } from "../../app/services/auth";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://api.kuepass.com/api/"
).replace(/\/$/, "");

interface ExportButtonProps {
  eventId: string;
}

interface Attendee {
  id: string;
  name: string;
  email: string;
  phone_number?: string;
  title?: string;
  institution?: string;
  registration_date: string;
  is_validated: boolean;
  validated_at?: string;
  ticket_code: string;
  attendee_number: number;
  payment_status: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({ eventId }) => {
  const [isExporting, setIsExporting] = useState(false);

  const convertToCSV = (data: Attendee[]): string => {
    if (data.length === 0) return "";

    // Define CSV headers
    const headers = [
      "Attendee Number",
      "Name",
      "Email",
      "Phone Number",
      "Title",
      "Institution",
      "Registration Date",
      "Validation Status",
      "Validated At",
      "Ticket Code",
      "Payment Status",
    ];

    // Convert data to CSV rows
    const csvRows = data.map((attendee) => [
      attendee.attendee_number || "",
      `"${attendee.name || ""}"`,
      attendee.email || "",
      attendee.phone_number || "",
      `"${attendee.title || ""}"`,
      `"${attendee.institution || ""}"`,
      new Date(attendee.registration_date).toLocaleDateString(),
      attendee.is_validated ? "Validated" : "Not Validated",
      attendee.validated_at
        ? new Date(attendee.validated_at).toLocaleDateString()
        : "",
      attendee.ticket_code || "",
      attendee.payment_status || "",
    ]);

    // Combine headers and rows
    const csvContent = [headers, ...csvRows]
      .map((row) => row.join(","))
      .join("\n");

    return csvContent;
  };

  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);

      // Fetch attendees data
      const attendeesResponse = await authenticatedRequest<any>(
        `${API_BASE_URL}/attendees/?event_id=${eventId}`,
        "GET"
      );

      // Handle paginated response from backend
      let attendees: Attendee[] = [];
      if (Array.isArray(attendeesResponse)) {
        attendees = attendeesResponse;
      } else if (attendeesResponse?.results && Array.isArray(attendeesResponse.results)) {
        attendees = attendeesResponse.results; // Handle paginated response
      } else if (attendeesResponse?.data && Array.isArray(attendeesResponse.data)) {
        attendees = attendeesResponse.data;
      } else {
        throw new Error("Invalid attendees data received");
      }

      // Convert to CSV
      const csvContent = convertToCSV(attendees);

      if (!csvContent) {
        alert("No attendees data to export");
        return;
      }

      // Generate filename with current date
      const currentDate = new Date().toISOString().split("T")[0];
      const filename = `attendees_export_${eventId}_${currentDate}.csv`;

      // Download the CSV file
      downloadCSV(csvContent, filename);
    } catch (error: any) {
      console.error("Error exporting attendees:", error);
      alert(`Failed to export attendees: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      className={styles.exportBtn}
      onClick={handleExport}
      disabled={isExporting}
    >
      {isExporting ? "Exporting..." : "Export CSV"}
    </button>
  );
};

export default ExportButton;
