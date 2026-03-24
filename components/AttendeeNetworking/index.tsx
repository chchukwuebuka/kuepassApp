"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Paper, Text, TextInput, Button, Group, Stack, Badge,
  Avatar, ActionIcon, Loader, Center, Textarea, Divider,
} from "@mantine/core";
import { FaUserFriends, FaSearch, FaHandshake, FaComments, FaLinkedin } from "react-icons/fa";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "https://api.kuepass.com/api/"
).replace(/\/$/, "");

const getAuthToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("kuepass_auth_token") : null;

interface AttendeeNetworkingProps {
  eventId: string;
}

interface Attendee {
  id: string;
  name: string;
  email?: string;
  company?: string;
  title?: string;
  bio?: string;
  linkedin_url?: string;
  interests?: string[];
  avatar_url?: string;
  is_connected?: boolean;
  connection_status?: string;
}

export default function AttendeeNetworking({ eventId }: AttendeeNetworkingProps) {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [messageId, setMessageId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");

  const fetchAttendees = useCallback(async () => {
    try {
      const token = getAuthToken();
      const headers: any = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE_URL}/events/${eventId}/networking/attendees/`, { headers });
      if (res.ok) {
        const data = await res.json();
        setAttendees(Array.isArray(data) ? data : data.results || data.attendees || []);
      }
    } catch {} finally { setLoading(false); }
  }, [eventId]);

  useEffect(() => { fetchAttendees(); }, [fetchAttendees]);

  const handleConnect = async (attendeeId: string) => {
    setConnectingId(attendeeId);
    try {
      const token = getAuthToken();
      await fetch(`${API_BASE_URL}/networking/connect/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: eventId, target_attendee_id: attendeeId }),
      });
      fetchAttendees();
    } catch {} finally { setConnectingId(null); }
  };

  const handleSendMessage = async (attendeeId: string) => {
    if (!messageText.trim()) return;
    try {
      const token = getAuthToken();
      await fetch(`${API_BASE_URL}/networking/message/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: eventId, target_attendee_id: attendeeId, message: messageText }),
      });
      setMessageId(null);
      setMessageText("");
      alert("Message sent!");
    } catch { alert("Failed to send message"); }
  };

  const filteredAttendees = attendees.filter((a) => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return (
      a.name?.toLowerCase().includes(q) ||
      a.company?.toLowerCase().includes(q) ||
      a.title?.toLowerCase().includes(q) ||
      a.interests?.some((i) => i.toLowerCase().includes(q))
    );
  });

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const randomColor = (name: string) => {
    const colors = ["#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#f97316", "#06b6d4", "#10b981", "#3b82f6"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <Group justify="space-between" mb="md">
        <div>
          <Text fw={700} size="xl">Attendee Networking</Text>
          <Text size="sm" c="dimmed">Connect with other attendees at this event</Text>
        </div>
        <Badge size="lg" variant="light">{filteredAttendees.length} attendees</Badge>
      </Group>

      <TextInput
        placeholder="Search by name, company, or interests..."
        leftSection={<FaSearch size={14} />}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.currentTarget.value)}
        mb="lg"
        size="md"
      />

      {loading ? <Center style={{ padding: 40 }}><Loader /></Center> : filteredAttendees.length === 0 ? (
        <Paper p="xl" withBorder radius="md" ta="center">
          <FaUserFriends size={48} color="#ccc" />
          <Text c="dimmed" mt="md">
            {searchQuery ? "No attendees match your search" : "No attendees available for networking yet"}
          </Text>
        </Paper>
      ) : (
        <Stack gap="sm">
          {filteredAttendees.map((attendee) => (
            <Paper key={attendee.id} p="md" withBorder radius="md"
              style={{ transition: "box-shadow 0.2s", cursor: "default" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
            >
              <Group align="flex-start" gap="md">
                <Avatar
                  src={attendee.avatar_url}
                  size={48}
                  radius="xl"
                  color="violet"
                  style={{ background: attendee.avatar_url ? undefined : randomColor(attendee.name) }}
                >
                  {!attendee.avatar_url && getInitials(attendee.name)}
                </Avatar>
                <div style={{ flex: 1 }}>
                  <Group gap="xs" mb={2}>
                    <Text fw={600} size="md">{attendee.name}</Text>
                    {attendee.is_connected && <Badge size="xs" color="green">Connected</Badge>}
                    {attendee.connection_status === "pending" && <Badge size="xs" color="yellow">Pending</Badge>}
                  </Group>
                  {(attendee.title || attendee.company) && (
                    <Text size="sm" c="dimmed">
                      {attendee.title}{attendee.title && attendee.company ? " at " : ""}{attendee.company}
                    </Text>
                  )}
                  {attendee.bio && <Text size="xs" c="dimmed" mt={4}>{attendee.bio}</Text>}
                  {attendee.interests && attendee.interests.length > 0 && (
                    <Group gap={4} mt={6}>
                      {attendee.interests.map((interest, i) => (
                        <Badge key={i} size="xs" variant="light" color="grape">{interest}</Badge>
                      ))}
                    </Group>
                  )}

                  {/* Message form */}
                  {messageId === attendee.id && (
                    <Stack gap="xs" mt="sm">
                      <Textarea
                        placeholder={`Send a message to ${attendee.name}...`}
                        value={messageText}
                        onChange={(e) => setMessageText(e.currentTarget.value)}
                        size="sm"
                        rows={2}
                      />
                      <Group gap="xs">
                        <Button size="xs" onClick={() => handleSendMessage(attendee.id)}>Send</Button>
                        <Button size="xs" variant="subtle" onClick={() => { setMessageId(null); setMessageText(""); }}>Cancel</Button>
                      </Group>
                    </Stack>
                  )}
                </div>

                <Group gap={4}>
                  {attendee.linkedin_url && (
                    <ActionIcon variant="subtle" component="a" href={attendee.linkedin_url} target="_blank" color="blue">
                      <FaLinkedin size={16} />
                    </ActionIcon>
                  )}
                  {!attendee.is_connected && attendee.connection_status !== "pending" && (
                    <Button
                      size="xs"
                      variant="light"
                      leftSection={<FaHandshake size={12} />}
                      loading={connectingId === attendee.id}
                      onClick={() => handleConnect(attendee.id)}
                    >
                      Connect
                    </Button>
                  )}
                  {messageId !== attendee.id && (
                    <ActionIcon variant="subtle" onClick={() => { setMessageId(attendee.id); setMessageText(""); }}>
                      <FaComments size={14} />
                    </ActionIcon>
                  )}
                </Group>
              </Group>
            </Paper>
          ))}
        </Stack>
      )}
    </div>
  );
}
