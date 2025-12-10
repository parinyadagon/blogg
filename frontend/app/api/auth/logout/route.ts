import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

export async function POST(request: NextRequest) {
  try {
    // Get the auth_token cookie from the request
    const authToken = request.cookies.get("auth_token");

    // Call backend logout API
    const response = await fetch(`${BACKEND_URL}/api/v1/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authToken && { Cookie: `auth_token=${authToken.value}` }),
      },
    });

    const data = await response.json();

    // Create response
    const nextResponse = NextResponse.json(data, { status: response.status });

    // Clear the cookie on the client side
    nextResponse.cookies.delete("auth_token");

    return nextResponse;
  } catch (error) {
    console.error("Logout error:", error);

    // Even if backend fails, clear the cookie
    const nextResponse = NextResponse.json(
      {
        success: true,
        code: 200,
        message: "Logout successful",
      },
      { status: 200 }
    );

    nextResponse.cookies.delete("auth_token");
    return nextResponse;
  }
}
