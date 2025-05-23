import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectToDatabase } from "@/lib/mongodb"
import { authOptions } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions)

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const recordingId = params.id

    if (!recordingId) {
      return NextResponse.json({ message: "Recording ID is required" }, { status: 400 })
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Get recording by ID
    const recording = await db.collection("recordings").findOne({
      _id: new ObjectId(recordingId),
    })

    if (!recording) {
      return NextResponse.json({ message: "Recording not found" }, { status: 404 })
    }

    // Check if user owns this recording
    let userId = session.user.id
    try {
      if (userId.length === 24) {
        userId = new ObjectId(userId)
      }
    } catch (error) {
      console.log("Using string ID as is")
    }

    const recordingUserId = typeof recording.userId === "string" ? recording.userId : recording.userId.toString()

    const sessionUserId = typeof userId === "string" ? userId : userId.toString()

    if (recordingUserId !== sessionUserId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Check if recording has audio data
    if (!recording.audioData) {
      return NextResponse.json({ message: "No audio data available for this recording" }, { status: 404 })
    }

    // Return audio data with appropriate headers
    return new NextResponse(recording.audioData.buffer, {
      headers: {
        "Content-Type": "audio/webm",
        "Content-Disposition": `attachment; filename="recording-${recordingId}.webm"`,
      },
    })
  } catch (error) {
    console.error("Error fetching recording audio:", error)
    return NextResponse.json(
      {
        message: "An error occurred while fetching recording audio",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
