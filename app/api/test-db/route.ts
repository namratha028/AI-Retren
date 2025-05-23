import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    console.log("Testing database connection...")

    // Connect to database
    const { db } = await connectToDatabase()

    // Try to get a count from a collection
    const count = await db.collection("recordings").countDocuments()

    return NextResponse.json({
      status: "success",
      message: "Database connection successful",
      recordingsCount: count,
    })
  } catch (error) {
    console.error("Database test error:", error)

    return NextResponse.json(
      {
        status: "error",
        message: "Database connection failed",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
