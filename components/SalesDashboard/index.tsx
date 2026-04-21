"use client";

import React, { useState, useEffect } from "react";
import { authenticatedRequest } from "../../app/services/auth";
import {
  Paper,
  Title,
  Text,
  Loader,
  Center,
  Alert,
  SimpleGrid,
  RingProgress,
  Stack,
} from "@mantine/core";
import {
  IconAlertTriangle,
  IconChartLine,
  IconTicket,
  IconTrendingUp,
} from "@tabler/icons-react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import styles from "./styles.module.css";

// Only register Chart.js once
if (!ChartJS.getChart("chart")) {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ChartTitle,
    Tooltip,
    Legend,
    Filler
  );
}

interface ForecastDataPoint {
  ds: string;
  y: number | null;
  yhat: number;
  yhat_lower: number;
  yhat_upper: number;
}

interface SalesDashboardProps {
  ticketTypeId: string;
  ticketName: string;
  totalQuantity: number | "Unlimited";
}

const SalesDashboard: React.FC<SalesDashboardProps> = ({
  ticketTypeId,
  ticketName,
  totalQuantity,
}) => {
  const [chartData, setChartData] = useState<any>({});
  const [stats, setStats] = useState({ totalSold: 0, finalForecast: 0 });
  const [anomalies, setAnomalies] = useState<ForecastDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndProcessData = async () => {
      if (!ticketTypeId) return;
      setIsLoading(true);
      setError(null);

      try {
        // --- THIS IS THE CORRECTED API CALL ---
        // We now use your trusted function, which handles authentication correctly.
        const data = await authenticatedRequest<ForecastDataPoint[]>(
          `https://api.kuepass.com/api//tickets/${ticketTypeId}/forecast/`,
          "GET"
        );

        // Your backend sends a 400 with an error message, which your helper should catch.
        // We add this check in case the helper returns the error object instead of throwing.
        if ((data as any)?.error) {
          throw new Error((data as any).error);
        }

        if (!data || !Array.isArray(data) || data.length === 0) {
          throw new Error("Not enough sales data to generate a forecast.");
        }

        const labels = data.map((d) =>
          new Date(d.ds).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        );
        const actualSales = data.map((d) => d.y);
        const forecastedSales = data.map((d) => d.yhat);
        const lowerBound = data.map((d) => d.yhat_lower);
        const upperBound = data.map((d) => d.yhat_upper);

        setChartData({
          labels,
          datasets: [
            {
              label: "Confidence Interval",
              data: upperBound,
              fill: "-1",
              backgroundColor: "rgba(75, 192, 192, 0.1)",
              borderColor: "transparent",
              pointRadius: 0,
            },
            {
              label: "Lower Bound",
              data: lowerBound,
              fill: false,
              borderColor: "transparent",
              pointRadius: 0,
            },
            {
              label: "Actual Sales",
              data: actualSales,
              borderColor: "#025a3a",
              backgroundColor: "#025a3a",
              tension: 0.3,
              borderWidth: 3,
            },
            {
              label: "Forecasted Sales",
              data: forecastedSales,
              borderColor: "#ffa500",
              backgroundColor: "#ffa500",
              borderDash: [5, 5],
              tension: 0.3,
              borderWidth: 2,
            },
          ],
        });

        const lastActualSale =
          [...actualSales].reverse().find((d) => d !== null) || 0;
        const finalForecastedSale =
          forecastedSales[forecastedSales.length - 1] || 0;
        setStats({
          totalSold: lastActualSale,
          finalForecast: finalForecastedSale,
        });

        const foundAnomalies = data.filter(
          (d) => d.y !== null && (d.y > d.yhat_upper || d.y < d.yhat_lower)
        );
        setAnomalies(foundAnomalies);
      } catch (err: any) {
        // Prefer detailed error message from the API if available
        let errorMsg = err.message || "An unknown error occurred.";
        if (err.data && (err.data.detail || err.data.message)) {
          errorMsg = err.data.detail || err.data.message;
        }
        // Optionally, filter out Heroku router log lines
        if (errorMsg.startsWith("API Error: 400 Bad Request")) {
          errorMsg =
            "Sales forecast is unavailable for this ticket. Please check your data or try again later.";
        }
        setError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAndProcessData();
  }, [ticketTypeId]);

  if (isLoading) {
    return (
      <Center style={{ padding: "2rem" }}>
        <Loader />
        <Text ml="md">Analyzing sales data...</Text>
      </Center>
    );
  }

  if (error) {
    return (
      <Paper withBorder p="xl" radius="md">
        <Alert
          icon={<IconAlertTriangle size={16} />}
          title="Dashboard Unavailable"
          color="orange"
        >
          {error}
        </Alert>
      </Paper>
    );
  }

  const salesPercentage =
    totalQuantity === "Unlimited"
      ? 0
      : Math.round((stats.totalSold / (totalQuantity as number)) * 100);

  return (
    <Paper withBorder p="xl" radius="md" className={styles.dashboardContainer}>
      <Title order={3} className={styles.dashboardTitle}>
        Performance:{" "}
        <span className={styles.ticketNameHighlight}>{ticketName}</span>
      </Title>
      <SimpleGrid cols={{ base: 1, sm: 3 }} mt="xl">
        <Paper withBorder p="md" radius="md">
          <Stack align="center">
            <RingProgress
              size={100}
              thickness={8}
              roundCaps
              sections={[{ value: salesPercentage, color: "green" }]}
              label={
                <Center>
                  <IconTicket size="1.4rem" stroke={1.5} />
                </Center>
              }
            />
            <Text fz="xl" fw={700}>
              {stats.totalSold.toLocaleString()}
            </Text>
            <Text fz="sm" c="dimmed">
              Tickets Sold
            </Text>
            {totalQuantity !== "Unlimited" && (
              <Text fz="xs">
                ({salesPercentage}% of {totalQuantity})
              </Text>
            )}
          </Stack>
        </Paper>
        <Paper withBorder p="md" radius="md">
          <Stack align="center">
            <IconTrendingUp
              size={48}
              stroke={1.5}
              className={styles.statIcon}
            />
            <Text fz="xl" fw={700}>
              {Math.round(stats.finalForecast).toLocaleString()}
            </Text>
            <Text fz="sm" c="dimmed">
              Final Forecasted Sales
            </Text>
            <Text fz="xs">AI&apos;s prediction for total sales</Text>
          </Stack>
        </Paper>
        <Paper withBorder p="md" radius="md">
          <Stack align="center">
            <IconAlertTriangle
              size={48}
              stroke={1.5}
              className={styles.statIcon}
            />
            <Text fz="xl" fw={700}>
              {anomalies.length}
            </Text>
            <Text fz="sm" c="dimmed">
              Anomaly Alerts
            </Text>
            <Text fz="xs">Days with unusual sales activity</Text>
          </Stack>
        </Paper>
      </SimpleGrid>
      {anomalies.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <Alert
            icon={<IconAlertTriangle size={16} />}
            title="Anomaly Alerts Detected!"
            color="orange"
            variant="light"
          >
            <Text>
              We&apos;ve detected unusual sales activity on the following days.
            </Text>
            <ul>
              {anomalies.map((anomaly) => (
                <li key={anomaly.ds}>
                  <strong>{new Date(anomaly.ds).toLocaleDateString()}:</strong>{" "}
                  Sold {anomaly.y} (Forecast was{" "}
                  {Math.round(anomaly.yhat_lower)} -{" "}
                  {Math.round(anomaly.yhat_upper)})
                </li>
              ))}
            </ul>
          </Alert>
        </div>
      )}
      <div style={{ marginTop: "2rem" }}>
        <Title order={4}>
          <IconChartLine size={20} /> Sales Trend
        </Title>
        {Object.keys(chartData).length > 0 && (
          <Line
            options={{
              responsive: true,
              plugins: { legend: { position: "top" } },
            }}
            data={chartData}
          />
        )}
      </div>
    </Paper>
  );
};
export default SalesDashboard;
