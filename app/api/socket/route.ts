import { NextResponse } from "next/server";

export async function GET() {
  return new NextResponse("Socket server is running", {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
