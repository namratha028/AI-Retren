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

    console.log("Fetching recordings for user:", session.user.id)

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

    // Get recordings for the current user
    const recordings = await db
      .collection("recordings")
      .find({ userId })
      .sort({ timestamp: -1 })
      .project({ audioData: 0 }) // Exclude audio data from the initial fetch to reduce payload size
      .toArray()

    console.log(`Found ${recordings.length} recordings for user`)

    // Convert ObjectIds to strings for JSON serialization
    const serializedRecordings = recordings.map((recording) => ({
      ...recording,
      _id: recording._id.toString(),
      userId: typeof recording.userId === "object" ? recording.userId.toString() : recording.userId,
      hasAudio: !!recording.audioData, // Indicate if this recording has audio data
    }))

    return NextResponse.json(serializedRecordings)
  } catch (error) {
    console.error("Error fetching recordings:", error)
    return NextResponse.json(
      {
        message: "An error occurred while fetching recordings",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
