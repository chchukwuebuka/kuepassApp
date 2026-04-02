"use client";

import React, { useState, useEffect } from "react";
import {
  Text,
  Group,
  Badge,
  ScrollArea,
  Center,
  Tooltip,
  ActionIcon,
  Loader,
  Alert,
  Skeleton,
  Collapse,
} from "@mantine/core";
import {
  AlertCircle,
  Users,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  FileText,
  Calendar,
  Gift,
} from "lucide-react";
import { authenticatedRequest } from "@/app/services/auth";

interface Attendee {
  id: string;
  name: string;
  email: string;
  responses?: any[];
  selected_itinerary?: any[];
  selected_services?: any[];
}

interface AttendeeDetailsTableProps {
  eventId: string;
  searchQuery?: string;
}

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.kuepass.com/api/"
).replace(/\/$/, "");

const AttendeeDetailsTable: React.FC<AttendeeDetailsTableProps> = ({
  eventId,
  searchQuery = "",
}) => {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const fetchAttendees = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authenticatedRequest<any>(
        `${API_BASE_URL}/attendees/?event_id=${eventId}`,
        "GET"
      );
      let data: Attendee[] = [];
      if (Array.isArray(response)) {
        data = response;
      } else if (response?.results && Array.isArray(response.results)) {
        data = response.results;
      } else if (response?.data && Array.isArray(response.data)) {
        data = response.data;
      }
      setAttendees(data);
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message || "Failed to fetch attendees. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!eventId) {
      setError("No event selected.");
      setAttendees([]);
      return;
    }
    fetchAttendees();
  }, [eventId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAttendees();
    setTimeout(() => setRefreshing(false), 500);
  };

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const filteredAttendees = attendees.filter((attendee) => {
    return searchQuery
      ? attendee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        attendee.email.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
  });

  if (error) {
    return (
      <div style={{ padding: "20px" }}>
        <Alert icon={<AlertCircle size={16} />} title="Error" color="red">
          {error}
        </Alert>
        <Center mt="md">
          <button style={{ padding: "8px 16px", borderRadius: "8px", background: "#f1f3f5", border: "none", cursor: "pointer" }} onClick={fetchAttendees}>
            Try Again
          </button>
        </Center>
      </div>
    );
  }

  return (
    <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e9ecef", overflow: "hidden", marginTop: "16px" }}>
      <div style={{ padding: "16px 24px", borderBottom: "1px solid #e9ecef", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Group gap="xs">
          <FileText size={20} color="#025a3a" />
          <Text fw={600} size="lg" c="dark.9">Registration Details</Text>
          <Badge size="lg" radius="xl" color="green">{filteredAttendees.length}</Badge>
        </Group>

        <Tooltip label="Refresh">
          <ActionIcon color="green" variant="light" onClick={handleRefresh} loading={refreshing} radius="xl" size="lg">
            <RefreshCw size={16} />
          </ActionIcon>
        </Tooltip>
      </div>

      {loading ? (
        <div style={{ padding: "32px" }}>
          <Center><Loader color="green" size="md" /></Center>
        </div>
      ) : filteredAttendees.length === 0 ? (
        <div style={{ padding: "40px", textAlign: "center" }}>
          <Text c="dimmed">No responses to display.</Text>
        </div>
      ) : (
        <ScrollArea>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #e9ecef" }}>
                <th style={{ padding: "16px 24px", fontWeight: 600, fontSize: "14px", color: "#495057" }}>Attendee</th>
                <th style={{ padding: "16px 24px", fontWeight: 600, fontSize: "14px", color: "#495057", width: "180px" }}>Email</th>
                <th style={{ padding: "16px 24px", fontWeight: 600, fontSize: "14px", color: "#495057", width: "100px", textAlign: "center" }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendees.map((attendee) => {
                const isExpanded = expandedRows.has(attendee.id);
                const hasAnswers = attendee.responses && attendee.responses.length > 0;
                const hasItinerary = attendee.selected_itinerary && attendee.selected_itinerary.length > 0;
                const hasServices = attendee.selected_services && attendee.selected_services.length > 0;
                const hasAnyData = hasAnswers || hasItinerary || hasServices;

                return (
                  <React.Fragment key={attendee.id}>
                    <tr 
                      onClick={() => hasAnyData && toggleRow(attendee.id)}
                      style={{ 
                        borderBottom: "1px solid #e9ecef", 
                        cursor: hasAnyData ? "pointer" : "default",
                        background: isExpanded ? "rgba(2, 90, 58, 0.02)" : "transparent",
                        transition: "background 0.2s"
                      }}
                    >
                      <td style={{ padding: "16px 24px" }}>
                        <Text fw={600} size="sm">{attendee.name}</Text>
                      </td>
                      <td style={{ padding: "16px 24px", fontSize: "14px", color: "#6c757d" }}>{attendee.email}</td>
                      <td style={{ padding: "16px 24px", textAlign: "center" }}>
                        {hasAnyData ? (
                          <ActionIcon variant="transparent" color={isExpanded ? "green" : "gray"}>
                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </ActionIcon>
                        ) : (
                          <Text size="xs" c="dimmed">No Data</Text>
                        )}
                      </td>
                    </tr>
                    
                    {/* EXPANDABLE ROW CONTENT */}
                    {hasAnyData && (
                      <tr>
                        <td colSpan={3} style={{ padding: 0, borderBottom: isExpanded ? "1px solid #e9ecef" : "none" }}>
                          <Collapse in={isExpanded}>
                            <div style={{ padding: "24px", background: "#fafbfc", borderLeft: "4px solid #025a3a", display: "flex", gap: "32px", flexWrap: "wrap" }}>
                              
                              {hasAnswers && (
                                <div style={{ flex: "1 1 300px" }}>
                                  <Group gap="xs" mb="sm">
                                    <FileText size={16} color="#868e96" />
                                    <Text fw={600} size="sm" c="dark.6">Survey Responses</Text>
                                  </Group>
                                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                    {attendee.responses?.map((r: any, idx: number) => (
                                      <div key={idx} style={{ background: "#fff", padding: "12px", borderRadius: "8px", border: "1px solid #e9ecef" }}>
                                        <Text size="xs" fw={600} c="dimmed">{r.question_title || "Question"}</Text>
                                        <Text size="sm" mt={4}>
                                          {r.text_response || r.selected_options?.map((opt: any) => opt.text || opt.option).join(", ") || "-"}
                                        </Text>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {hasItinerary && (
                                <div style={{ flex: "1 1 250px" }}>
                                  <Group gap="xs" mb="sm">
                                    <Calendar size={16} color="#868e96" />
                                    <Text fw={600} size="sm" c="dark.6">Selected Itinerary</Text>
                                  </Group>
                                  <div style={{ background: "#fff", padding: "12px", borderRadius: "8px", border: "1px solid #e9ecef", display: "flex", flexDirection: "column", gap: "8px" }}>
                                    {attendee.selected_itinerary?.map((item: any, idx: number) => (
                                      <div key={idx} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                                        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#025a3a", marginTop: "8px" }} />
                                        <div>
                                          <Text size="sm" fw={500}>{item.selected_session || item.selected_track || item.id || "Session"}</Text>
                                          {item.date && <Text size="xs" c="dimmed">{item.date}</Text>}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {hasServices && (
                                <div style={{ flex: "1 1 250px" }}>
                                  <Group gap="xs" mb="sm">
                                    <Gift size={16} color="#868e96" />
                                    <Text fw={600} size="sm" c="dark.6">Services & Gifts</Text>
                                  </Group>
                                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                    {attendee.selected_services?.map((svc: any, idx: number) => (
                                      <Badge key={idx} color="grape" variant="light" size="lg" radius="sm">
                                        {svc.name || svc.id || "Provided Service"}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                            </div>
                          </Collapse>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </ScrollArea>
      )}
    </div>
  );
};

export default AttendeeDetailsTable;
