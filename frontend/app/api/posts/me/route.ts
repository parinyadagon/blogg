import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

export async function GET(request: NextRequest) {
  try {
    // Get cookies from request (auth token)
    const cookieHeader = request.headers.get("cookie");

    // Call backend my posts API
    const response = await fetch(`${BACKEND_URL}/api/v1/posts/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      cache: "no-store", // Disable caching for fresh data
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Fetch my posts error:", error);
    return NextResponse.json(
      {
        success: false,
        code: 500,
        message: "Internal server error",
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to connect to posts service",
        },
      },
      { status: 500 }
    );
  }
}
