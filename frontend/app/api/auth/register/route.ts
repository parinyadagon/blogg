import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Call backend register API
    const response = await fetch(`${BACKEND_URL}/api/v1/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      {
        success: false,
        code: 500,
        message: "Internal server error",
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to connect to authentication service",
        },
      },
      { status: 500 }
    );
  }
}
