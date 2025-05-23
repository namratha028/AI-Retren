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

    // Get goal data from request
    const goalData = await request.json()

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

    // Check if a goal already exists for this user
    const existingGoal = await db.collection("transformation_goals").findOne({ userId })

    let result

    if (existingGoal) {
      // Update existing goal
      result = await db.collection("transformation_goals").updateOne(
        { userId },
        {
          $set: {
            currentStage: goalData.currentStage,
            targetStage: goalData.targetStage,
            targetDate: goalData.targetDate ? new Date(goalData.targetDate) : undefined,
            progress: goalData.progress || 0,
            updatedAt: new Date(),
          },
        },
      )
    } else {
      // Create new goal
      result = await db.collection("transformation_goals").insertOne({
        userId,
        currentStage: goalData.currentStage,
        targetStage: goalData.targetStage,
        startDate: new Date(),
        targetDate: goalData.targetDate ? new Date(goalData.targetDate) : undefined,
        progress: goalData.progress || 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    // Update user's target stage
    await db.collection("users").updateOne(
      { _id: typeof userId === "string" ? userId : new ObjectId(userId) },
      {
        $set: {
          targetStage: goalData.targetStage,
          updatedAt: new Date(),
        },
      },
      { upsert: false },
    )

    return NextResponse.json(
      {
        message: existingGoal ? "Transformation goal updated successfully" : "Transformation goal saved successfully",
        goalId: existingGoal ? existingGoal._id.toString() : result.insertedId.toString(),
      },
      { status: existingGoal ? 200 : 201 },
    )
  } catch (error) {
    console.error("Error saving transformation goal:", error)
    return NextResponse.json(
      {
        message: "An error occurred while saving the transformation goal",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
