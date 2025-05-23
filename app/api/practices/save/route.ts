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

    // Get practice data from request
    const practiceData = await request.json()

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

    // Check if practice already exists for this user
    const existingPractice = await db.collection("saved_practices").findOne({
      userId,
      practiceId: practiceData.practiceId,
    })

    let result

    if (existingPractice) {
      // If removing saved practice
      if (practiceData.remove) {
        result = await db.collection("saved_practices").deleteOne({
          userId,
          practiceId: practiceData.practiceId,
        })

        return NextResponse.json(
          {
            message: "Practice removed successfully",
          },
          { status: 200 },
        )
      }

      // Update existing practice
      result = await db.collection("saved_practices").updateOne(
        { userId, practiceId: practiceData.practiceId },
        {
          $set: {
            completed: practiceData.completed || false,
            completedAt: practiceData.completed ? new Date() : null,
            notes: practiceData.notes || "",
            updatedAt: new Date(),
          },
        },
      )
    } else {
      // Create new saved practice
      result = await db.collection("saved_practices").insertOne({
        userId,
        practiceId: practiceData.practiceId,
        title: practiceData.title,
        type: practiceData.type,
        spiralStage: practiceData.spiralStage,
        completed: practiceData.completed || false,
        completedAt: practiceData.completed ? new Date() : null,
        notes: practiceData.notes || "",
        createdAt: new Date(),
      })
    }

    return NextResponse.json(
      {
        message: existingPractice ? "Practice updated successfully" : "Practice saved successfully",
        practiceId: existingPractice ? existingPractice._id.toString() : result.insertedId.toString(),
      },
      { status: existingPractice ? 200 : 201 },
    )
  } catch (error) {
    console.error("Error saving practice:", error)
    return NextResponse.json(
      {
        message: "An error occurred while saving the practice",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
