import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectToDatabase } from "@/lib/mongodb"
import { authOptions } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function GET(request: Request) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions)

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    console.log("Fetching analyses for user:", session.user.id)

    // Connect to database
    const { db } = await connectToDatabase()

    // Convert string ID to ObjectId if needed
    let userId = session.user.id
    try {
      // Check if the ID is already an ObjectId
      if (userId.length === 24) {
        userId = new ObjectId(userId)
      }
    } catch (error) {
      console.log("Using string ID as is")
    }

    // Get analyses for the current user
    const analyses = await db.collection("analyses").find({ userId }).sort({ createdAt: -1 }).toArray()

    console.log(`Found ${analyses.length} analyses for user`)

    // Convert ObjectIds to strings for JSON serialization
    const serializedAnalyses = analyses.map((analysis) => ({
      ...analysis,
      _id: analysis._id.toString(),
      userId: typeof analysis.userId === "object" ? analysis.userId.toString() : analysis.userId,
    }))

    return NextResponse.json(serializedAnalyses)
  } catch (error) {
    console.error("Error fetching analyses:", error)
    return NextResponse.json(
      {
        message: "An error occurred while fetching analyses",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
