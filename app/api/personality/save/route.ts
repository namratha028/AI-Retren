import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectToDatabase } from "@/lib/mongodb"
import { authOptions } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function POST(request: Request) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions)

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get assessment data from request
    const assessmentData = await request.json()

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

    // Save assessment to database
    const result = await db.collection("personality_assessments").insertOne({
      userId,
      scores: assessmentData.scores || {},
      dominantColor: assessmentData.dominantColor,
      colorName: assessmentData.colorName,
      colorHex: assessmentData.colorHex,
      description: assessmentData.description || "",
      timestamp: new Date(assessmentData.timestamp) || new Date(),
      createdAt: new Date(),
    })

    // Update user's current stage
    await db.collection("users").updateOne(
      { _id: typeof userId === "string" ? userId : new ObjectId(userId) },
      {
        $set: {
          currentStage: assessmentData.dominantColor,
          updatedAt: new Date(),
        },
      },
      { upsert: false },
    )

    console.log("Personality assessment saved successfully with ID:", result.insertedId.toString())

    return NextResponse.json(
      {
        message: "Personality assessment saved successfully",
        assessmentId: result.insertedId.toString(),
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error saving personality assessment:", error)
    return NextResponse.json(
      {
        message: "An error occurred while saving the personality assessment",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
