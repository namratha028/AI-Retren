import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectToDatabase } from "@/lib/mongodb"
import { authOptions } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    // Get the current session
    const session = await getServerSession(authOptions)

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

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

    // Get personality assessments for the current user
    const assessments = await db
      .collection("personality_assessments")
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray()

    // Convert ObjectIds to strings for JSON serialization
    const serializedAssessments = assessments.map((assessment) => ({
      ...assessment,
      _id: assessment._id.toString(),
      userId: typeof assessment.userId === "object" ? assessment.userId.toString() : assessment.userId,
    }))

    return NextResponse.json(serializedAssessments)
  } catch (error) {
    console.error("Error fetching personality assessments:", error)
    return NextResponse.json(
      {
        message: "An error occurred while fetching personality assessments",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
