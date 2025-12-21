import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Call backend API
    const response = await fetch(`${BACKEND_URL}/api/v1/posts/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Get post error:", error);
    return NextResponse.json(
      {
        success: false,
        code: 500,
        message: "Internal server error",
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch post data",
        },
      },
      { status: 500 }
    );
  }
}
