"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Button, 
  Text, 
  Group, 
  Stack, 
  Select, 
  Loader, 
  Center, 
  Alert,
  Table,
  Badge,
  Paper,
  ActionIcon
} from "@mantine/core";
import { FaUpload, FaFileExcel, FaFilePdf, FaInfoCircle, FaCheckCircle, FaExclamationCircle, FaTimes } from "react-icons/fa";
import styles from "./styles.module.css";
import { authenticatedRequest, getAuthToken } from "../../app/services/auth";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.kuepass.com/api/"
).replace(/\/$/, "");

interface Ticket {
  id: string;
  name: string;
  category_price: string;
}

interface BulkPreRegistrationProps {
  eventId: string;
}

const BulkPreRegistration: React.FC<BulkPreRegistrationProps> = ({ eventId }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingTickets, setIsFetchingTickets] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!eventId) return;
    
    const fetchTickets = async () => {
      try {
        setIsFetchingTickets(true);
        const res = await authenticatedRequest<Ticket[]>(
          `${API_BASE_URL}/tickets/?event=${eventId}`,
          "GET"
        );
        
        let ticketsList: Ticket[] = [];
        if (Array.isArray(res)) {
          ticketsList = res;
        } else if (Array.isArray((res as any).data)) {
          ticketsList = (res as any).data;
        } else if (Array.isArray((res as any).results)) {
          ticketsList = (res as any).results;
        }
        
        setTickets(ticketsList);
      } catch (err: any) {
        console.error("Failed to load tickets:", err);
      } finally {
        setIsFetchingTickets(false);
      }
    };

    fetchTickets();
  }, [eventId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
        "application/vnd.ms-excel",
        "text/csv",
        "application/pdf"
      ];
      
      if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv|pdf)$/)) {
        setError("Please upload an Excel (.xlsx, .xls), CSV, or PDF file.");
        return;
      }
      
      setSelectedFile(file);
      setError(null);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!eventId) {
      setError("Please select an event from the top dropdown first.");
      return;
    }
    
    if (!selectedTicketId) {
      setError("Please select a ticket type for these attendees.");
      return;
    }
    
    if (!selectedFile) {
      setError("Please select a file to upload.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setResult(null);

      const formData = new FormData();
      formData.append("excel_file", selectedFile);
      formData.append("event_id", eventId);
      formData.append("ticket_id", selectedTicketId);

      // Using fetch directly because authenticatedRequest might stringify the FormData
      const token = getAuthToken();
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/bulk-preregister/`, {
        method: "POST",
        headers,
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to process bulk upload.");
      }

      setResult(data);
      clearFile();
      
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTemplate = () => {
    // Generate a simple CSV template structure
    const csvContent = "data:text/csv;charset=utf-8,Full Name,Email Address,Phone Number\nJohn Doe,john@example.com,+2348000000000\nJane Smith,jane@example.com,+2349000000000";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "kuepass_preregistration_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!eventId) {
    return (
      <Center style={{ height: "200px" }}>
        <Text color="dimmed">Please select an event to use this feature.</Text>
      </Center>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Bulk Pre-Registration</h2>
        <p>
          Upload attendee details in bulk. Each uploaded attendee will receive a 
          personalized email with a unique link to complete their info and answer any follow-up questions.
        </p>
      </div>

      {error && (
        <Alert icon={<FaExclamationCircle size={16} />} title="Error" color="red" mb="md" variant="filled">
          {error}
        </Alert>
      )}

      {result && result.success && (
        <Alert icon={<FaCheckCircle size={16} />} title="Success" color="green" mb="lg" variant="light">
          {result.message}
        </Alert>
      )}

      <div className={styles.contentGrid}>
        {/* Upload Form Section */}
        <Paper className={styles.card} p="xl" radius="md" withBorder>
          <Stack gap="xl">
            <div>
              <Text fw={600} mb={8}>1. Select Ticket Type</Text>
              <Text size="sm" color="dimmed" mb={8}>What ticket should these pre-registered attendees receive?</Text>
              {isFetchingTickets ? (
                <Loader size="sm" />
              ) : (
                <Select
                  placeholder={tickets.length === 0 ? "No tickets found" : "Select a ticket"}
                  data={tickets.map(t => ({ 
                    value: t.id, 
                    label: `${t.name} (₦${parseFloat(t.category_price).toFixed(2)})` 
                  }))}
                  value={selectedTicketId}
                  onChange={setSelectedTicketId}
                  disabled={tickets.length === 0 || isLoading}
                  searchable
                />
              )}
            </div>

            <div>
              <Group justify="space-between" mb={8}>
                <Text fw={600}>2. Upload Attendee File</Text>
                <Button variant="subtle" size="xs" onClick={downloadTemplate}>
                  Download Template
                </Button>
              </Group>
              <Text size="sm" color="dimmed" mb={16}>
                Upload a CSV or Excel file containing columns: <strong>Full Name</strong>, <strong>Email Address</strong>, and <strong>Phone Number</strong>.
              </Text>
              
              <div 
                className={styles.uploadArea} 
                onClick={() => fileInputRef.current?.click()}
                style={{ 
                  borderColor: selectedFile ? "var(--mantine-color-green-5)" : "var(--mantine-color-gray-4)",
                  backgroundColor: selectedFile ? "var(--mantine-color-green-0)" : "transparent"
                }}
              >
                <input
                  type="file"
                  accept=".csv, .xls, .xlsx, .pdf, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, application/pdf"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  ref={fileInputRef}
                  disabled={isLoading}
                />
                
                {selectedFile ? (
                  <Stack align="center" gap={4}>
                    {selectedFile.name.toLowerCase().endsWith('.pdf') ? (
                      <FaFilePdf size={32} color="var(--mantine-color-red-6)" />
                    ) : (
                      <FaFileExcel size={32} color="var(--mantine-color-green-6)" />
                    )}
                    <Group gap="xs">
                      <Text fw={500} size="sm">{selectedFile.name}</Text>
                      <ActionIcon 
                        size="sm" 
                        color="red" 
                        variant="subtle" 
                        onClick={(e) => { e.stopPropagation(); clearFile(); }}
                      >
                        <FaTimes />
                      </ActionIcon>
                    </Group>
                    <Text size="xs" color="dimmed">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </Text>
                  </Stack>
                ) : (
                  <Stack align="center" gap={4}>
                    <FaUpload size={32} color="var(--mantine-color-gray-5)" />
                    <Text fw={500} size="sm mt-2">Click to browse or drag and drop</Text>
                    <Text size="xs" color="dimmed">Excel (.xlsx), CSV, or PDF formats allowed</Text>
                  </Stack>
                )}
              </div>
            </div>

            <Button
              size="md"
              color="green"
              fullWidth
              loading={isLoading}
              onClick={handleSubmit}
              leftSection={<FaUpload />}
              disabled={!selectedFile || !selectedTicketId}
            >
              Process Pre-Registrations
            </Button>
          </Stack>
        </Paper>

        {/* Results Section */}
        {result && (
          <Paper className={styles.card} p="xl" radius="md" withBorder>
            <Stack gap="lg">
              <Text fw={600} size="lg">Upload Results</Text>
              
              <Group grow>
                <Paper withBorder p="sm" radius="md" bg="green.0">
                  <Text size="xs" tt="uppercase" fw={700} c="green.9">Success</Text>
                  <Text size="xl" fw={700} c="green.9">{result.summary?.new_registrations || 0}</Text>
                </Paper>
                <Paper withBorder p="sm" radius="md" bg="blue.0">
                  <Text size="xs" tt="uppercase" fw={700} c="blue.9">Skipped (Exists)</Text>
                  <Text size="xl" fw={700} c="blue.9">{result.summary?.already_registered || 0}</Text>
                </Paper>
                <Paper withBorder p="sm" radius="md" bg="red.0">
                  <Text size="xs" tt="uppercase" fw={700} c="red.9">Failed</Text>
                  <Text size="xl" fw={700} c="red.9">{result.summary?.failed || 0}</Text>
                </Paper>
              </Group>

              {result.failed_registrations && result.failed_registrations.length > 0 && (
                <div>
                  <Group mb="xs" gap="xs">
                    <FaExclamationCircle color="red" />
                    <Text fw={600} size="sm">Failed Rows ({result.failed_registrations.length})</Text>
                  </Group>
                  <div className={styles.tableWrapper}>
                    <Table striped highlightOnHover size="xs" withTableBorder>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Row</Table.Th>
                          <Table.Th>Email</Table.Th>
                          <Table.Th>Error</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {result.failed_registrations.map((row: any, i: number) => (
                          <Table.Tr key={i}>
                            <Table.Td>{row.row}</Table.Td>
                            <Table.Td>{row.email || 'Missing'}</Table.Td>
                            <Table.Td>
                              <Text size="xs" c="red">{row.error}</Text>
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </div>
                </div>
              )}

              {result.already_registered && result.already_registered.length > 0 && (
                <div>
                  <Group mb="xs" gap="xs">
                    <FaInfoCircle color="blue" />
                    <Text fw={600} size="sm">Already Registered ({result.already_registered.length})</Text>
                  </Group>
                  <div className={styles.tableWrapper}>
                    <Table striped highlightOnHover size="xs" withTableBorder>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Row</Table.Th>
                          <Table.Th>Name</Table.Th>
                          <Table.Th>Email</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {result.already_registered.map((row: any, i: number) => (
                          <Table.Tr key={i}>
                            <Table.Td>{row.row}</Table.Td>
                            <Table.Td>{row.name}</Table.Td>
                            <Table.Td>{row.email}</Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </div>
                </div>
              )}
            </Stack>
          </Paper>
        )}
      </div>
    </div>
  );
};

export default BulkPreRegistration;
