"use client";

import { useState, useEffect, useCallback } from "react";
import { Modal, TextInput, Select } from "@mantine/core";
import { FaChair, FaPlus, FaSave } from "react-icons/fa";
import styles from "@/styles/dashboard-features.module.css";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.kuepass.com/api/"
).replace(/\/$/, "");

const getAuthToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("kuepass_auth_token") : null;

interface SeatingDashboardProps { eventId: string; }
interface SeatMap {
  id: string; name: string; total_seats: number; available_seats: number; layout_type: string;
}
interface Seat {
  id: string; seat_map: string; label: string; row: string; number: number;
  section: string; status: "available" | "reserved" | "blocked";
  reserved_for_name?: string; reserved_for_email?: string; price_tier?: string;
}

export default function SeatingDashboard({ eventId }: SeatingDashboardProps) {
  const [seatMaps, setSeatMaps] = useState<SeatMap[]>([]);
  const [selectedMap, setSelectedMap] = useState<SeatMap | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [seatsLoading, setSeatsLoading] = useState(false);

  const [createMapOpen, setCreateMapOpen] = useState(false);
  const [mapForm, setMapForm] = useState({ name: "", layout_type: "theater", rows: "5", seats_per_row: "10" });
  const [mapSaving, setMapSaving] = useState(false);

  const fetchMaps = useCallback(async () => {
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/events/${eventId}/seat-map/`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        const maps = data.id ? [data] : [];
        setSeatMaps(maps);
        if (maps.length > 0 && !selectedMap) setSelectedMap(maps[0]);
      }
    } catch {} finally { setLoading(false); }
  }, [eventId]);

  const fetchSeats = useCallback(async (mapId: string) => {
    setSeatsLoading(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/events/${eventId}/seats/`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        setSeats(data.seats || []);
      }
    } catch {} finally { setSeatsLoading(false); }
  }, []);

  useEffect(() => { fetchMaps(); }, [fetchMaps]);
  useEffect(() => { if (selectedMap) fetchSeats(selectedMap.id); }, [selectedMap, fetchSeats]);

  const handleCreateMap = async () => {
    setMapSaving(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/events/${eventId}/seat-map/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          event: eventId, name: mapForm.name || "Main Hall", layout_type: mapForm.layout_type,
          rows: parseInt(mapForm.rows), seats_per_row: parseInt(mapForm.seats_per_row),
        }),
      });
      if (res.ok) {
        setCreateMapOpen(false);
        setMapForm({ name: "", layout_type: "theater", rows: "5", seats_per_row: "10" });
        fetchMaps();
      } else alert("Failed to create seat map");
    } catch { alert("Error"); } finally { setMapSaving(false); }
  };

  const toggleSeatStatus = async (seat: Seat) => {
    const newStatus = seat.status === "available" ? "blocked" : "available";
    try {
      const token = getAuthToken();
      await fetch(`${API_BASE_URL}/seats/${seat.id}/`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (selectedMap) fetchSeats(selectedMap.id);
    } catch {}
  };

  const seatsByRow = seats.reduce<Record<string, Seat[]>>((acc, seat) => {
    const row = seat.row || "?";
    if (!acc[row]) acc[row] = [];
    acc[row].push(seat);
    return acc;
  }, {});

  const stats = {
    total: seats.length,
    available: seats.filter(s => s.status === "available").length,
    reserved: seats.filter(s => s.status === "reserved").length,
    blocked: seats.filter(s => s.status === "blocked").length,
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <h1 className={styles.pageTitle}>
            <span className={styles.pageTitleIcon}><FaChair /></span>
            Seating Management
          </h1>
          <p className={styles.pageSubtitle}>Design seat maps and manage reservations</p>
        </div>
        <button className={styles.primaryBtn} onClick={() => setCreateMapOpen(true)}>
          <FaPlus /> Create Seat Map
        </button>
      </div>

      {loading ? (
        <div className={styles.loadingContainer}><div className={styles.spinner} /></div>
      ) : seatMaps.length === 0 ? (
        <div className={styles.card}>
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}><FaChair /></div>
            <p className={styles.emptyStateText}>No seat maps yet</p>
            <p className={styles.emptyStateHint}>Create one to assign seating for your event.</p>
          </div>
        </div>
      ) : (
        <>
          {/* Map selector */}
          {seatMaps.length > 1 && (
            <div className={styles.filterPills}>
              {seatMaps.map(m => (
                <button key={m.id}
                  className={`${styles.filterPill} ${selectedMap?.id === m.id ? styles.filterPillActive : ""}`}
                  onClick={() => setSelectedMap(m)}>
                  {m.name}
                </button>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.total}</div>
              <div className={styles.statLabel}>Total Seats</div>
            </div>
            <div className={styles.statCard}>
              <div className={`${styles.statValue} ${styles.statGreen}`}>{stats.available}</div>
              <div className={styles.statLabel}>Available</div>
            </div>
            <div className={styles.statCard}>
              <div className={`${styles.statValue} ${styles.statBlue}`}>{stats.reserved}</div>
              <div className={styles.statLabel}>Reserved</div>
            </div>
            <div className={styles.statCard}>
              <div className={`${styles.statValue} ${styles.statGray}`}>{stats.blocked}</div>
              <div className={styles.statLabel}>Blocked</div>
            </div>
          </div>

          {/* Seat grid */}
          <div className={styles.card}>
            <div className={styles.legend}>
              <div className={styles.legendItem}>
                <div className={styles.legendDot} style={{ background: "#22c55e" }} /> Available
              </div>
              <div className={styles.legendItem}>
                <div className={styles.legendDot} style={{ background: "#3b82f6" }} /> Reserved
              </div>
              <div className={styles.legendItem}>
                <div className={styles.legendDot} style={{ background: "#9ca3af" }} /> Blocked
              </div>
            </div>

            {seatsLoading ? (
              <div className={styles.loadingContainer}><div className={styles.spinner} /></div>
            ) : (
              <div className={styles.seatGrid}>
                {Object.entries(seatsByRow).sort().map(([row, rowSeats]) => (
                  <div key={row} className={styles.seatRow}>
                    <span className={styles.seatRowLabel}>{row}</span>
                    {rowSeats.sort((a, b) => a.number - b.number).map(seat => (
                      <button key={seat.id}
                        className={`${styles.seat} ${
                          seat.status === "available" ? styles.seatAvailable :
                          seat.status === "reserved" ? styles.seatReserved :
                          styles.seatBlocked
                        }`}
                        onClick={() => seat.status !== "reserved" && toggleSeatStatus(seat)}
                        title={`${seat.label || `${row}${seat.number}`} — ${seat.status}${seat.reserved_for_name ? ` (${seat.reserved_for_name})` : ""}`}
                        disabled={seat.status === "reserved"}>
                        {seat.number}
                      </button>
                    ))}
                  </div>
                ))}
                <div className={styles.stageLabel}>STAGE</div>
              </div>
            )}
          </div>
        </>
      )}

      <Modal opened={createMapOpen} onClose={() => setCreateMapOpen(false)} title="Create Seat Map" centered>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <TextInput label="Map Name" placeholder="Main Hall" value={mapForm.name}
            onChange={(e) => setMapForm({ ...mapForm, name: e.currentTarget.value })} />
          <Select label="Layout Type" data={[
            { value: "theater", label: "Theater" }, { value: "classroom", label: "Classroom" },
            { value: "banquet", label: "Banquet" }, { value: "custom", label: "Custom" },
          ]} value={mapForm.layout_type}
            onChange={(v) => setMapForm({ ...mapForm, layout_type: v || "theater" })} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <TextInput label="Rows" type="number" value={mapForm.rows}
              onChange={(e) => setMapForm({ ...mapForm, rows: e.currentTarget.value })} />
            <TextInput label="Seats per Row" type="number" value={mapForm.seats_per_row}
              onChange={(e) => setMapForm({ ...mapForm, seats_per_row: e.currentTarget.value })} />
          </div>
          <button className={styles.primaryBtn} onClick={handleCreateMap} disabled={mapSaving}>
            <FaSave /> {mapSaving ? "Creating..." : "Create"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
