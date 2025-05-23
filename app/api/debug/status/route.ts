import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    // Try to connect to the database
    const { client, db } = await connectToDatabase()

    // Get list of collections
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map((col: any) => col.name)

    // Check if users collection exists
    const hasUsersCollection = collectionNames.includes("users")

    // Get MongoDB version
    const serverStatus = await db.admin().serverStatus()
    const version = serverStatus.version

    return NextResponse.json({
      status: "success",
      message: "Connected to database successfully",
      database: db.databaseName,
      collections: collectionNames,
      hasUsersCollection,
      mongoVersion: version,
      nodeVersion: process.version,
    })
  } catch (error) {
    console.error("Database status check error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Failed to connect to database",
        nodeVersion: process.version,
      },
      { status: 500 },
    )
  }
}
