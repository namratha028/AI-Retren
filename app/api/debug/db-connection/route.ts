import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    // Try to connect to the database
    const { client, db } = await connectToDatabase()

    // Get list of collections
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map((col) => col.name)

    return NextResponse.json({
      status: "success",
      message: "Connected to database successfully",
      database: db.databaseName,
      collections: collectionNames,
    })
  } catch (error) {
    console.error("Database connection error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Failed to connect to database",
      },
      { status: 500 },
    )
  }
}
