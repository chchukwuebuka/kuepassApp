import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://keupass-48c2ae65f897.herokuapp.com/api";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Try public endpoint first, then fallback to authenticated endpoint
    let response = await fetch(`${API_BASE_URL}/attendees/${userId}/public/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    // If public endpoint doesn't exist (404), try the regular endpoint
    if (response.status === 404) {
      response = await fetch(`${API_BASE_URL}/attendees/${userId}/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
    }

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const errorData = await response.text();
      console.error("Backend API error:", errorData);

      return NextResponse.json(
        { error: "Failed to fetch user data" },
        { status: response.status }
      );
    }

    const userData = await response.json();

    // Handle the new response format from backend
    if (userData.success && userData.data) {
      // New format with success/data wrapper
      return NextResponse.json(userData.data, { status: 200 });
    } else {
      // Legacy format - return as is
      return NextResponse.json(userData, { status: 200 });
    }
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
