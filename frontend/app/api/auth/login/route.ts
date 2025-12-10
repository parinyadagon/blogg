import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Call backend login API
    const response = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    // Get the auth_token cookie from backend response
    const setCookieHeader = response.headers.get("set-cookie");

    // Create response with success data
    const nextResponse = NextResponse.json(data, { status: 200 });

    // Forward the cookie to the client
    if (setCookieHeader) {
      nextResponse.headers.set("set-cookie", setCookieHeader);
    }

    return nextResponse;
  } catch (error) {
    console.error("Login error:", error);
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
