import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "https://keupass-48c2ae65f897.herokuapp.com/api"
).replace(/\/$/, "");

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
    let attendeeData;
    if (userData.success && userData.data) {
      // New format with success/data wrapper
      attendeeData = userData.data;
    } else {
      // Legacy format - return as is
      attendeeData = userData;
    }

    // If there are responses, fetch question details to get question text
    if (attendeeData.responses && attendeeData.responses.length > 0) {
      try {
        // Fetch questions for this event
        const questionsResponse = await fetch(
          `${API_BASE_URL}/event-forms/${attendeeData.event}/questions/`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        if (questionsResponse.ok) {
          const questionsData = await questionsResponse.json();

          // Create a map of question ID to question text
          const questionMap = new Map();
          if (Array.isArray(questionsData)) {
            questionsData.forEach((question: any) => {
              questionMap.set(question.id, question.title);
            });
          }

          // Enrich responses with question text
          attendeeData.responses = attendeeData.responses.map(
            (response: any) => ({
              ...response,
              question_text:
                questionMap.get(response.question) ||
                `Question ${response.question}`,
            })
          );
        }
      } catch (error) {
        console.error("Error fetching question details:", error);
        // Continue without question text enrichment
      }
    }

    return NextResponse.json(attendeeData, { status: 200 });
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
