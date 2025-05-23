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

    // Get analysis data from request
    const analysisData = await request.json()

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

    // Save analysis to database with proper data structure
    const result = await db.collection("analyses").insertOne({
      userId,
      dominantColor: analysisData.dominantColor,
      colorName: analysisData.colorName,
      colorHex: analysisData.colorHex,
      summary: analysisData.summary || "",
      scores: analysisData.scores || {},
      feedback: analysisData.feedback || {
        insights: [],
        recommendations: [],
        resources: [],
      },
      timestamp: new Date(analysisData.timestamp) || new Date(),
      createdAt: new Date(),
    })

    console.log("Analysis saved successfully with ID:", result.insertedId.toString())

    return NextResponse.json(
      {
        message: "Analysis saved successfully",
        analysisId: result.insertedId.toString(),
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error saving analysis:", error)
    return NextResponse.json(
      {
        message: "An error occurred while saving the analysis",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
