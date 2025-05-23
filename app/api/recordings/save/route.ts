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

    console.log("Processing recording save request...")

    // Handle form data with audio file
    const formData = await request.formData()
    const transcript = formData.get("transcript") as string
    const duration = Number.parseInt(formData.get("duration") as string) || 0
    const timestamp = new Date(formData.get("timestamp") as string) || new Date()

    // Get audio file if present
    const audioFile = formData.get("audio") as File | null
    let audioData = null

    if (!audioFile) {
      console.warn("No audio file provided in the request")
    } else {
      try {
        // Convert file to buffer for MongoDB storage
        const arrayBuffer = await audioFile.arrayBuffer()
        audioData = Buffer.from(arrayBuffer)
        console.log(`Audio data processed: ${audioData.length} bytes`)
      } catch (error) {
        console.error("Error processing audio file:", error)
        return NextResponse.json(
          { message: "Error processing audio file", error: error instanceof Error ? error.message : String(error) },
          { status: 400 },
        )
      }
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Convert string ID to ObjectId if needed
    let userId = session.user.id
    if (!userId) {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 })
    }

    try {
      // Check if the ID is already an ObjectId
      if (typeof userId === "string" && userId.length === 24) {
        userId = new ObjectId(userId)
      }
    } catch (error) {
      console.log("Using string ID as is:", userId)
    }

    // Save recording to database
    try {
      const recordingDoc = {
        userId,
        transcript: transcript || "",
        duration: duration || 0,
        timestamp: timestamp,
        audioData: audioData, // Store the audio data in MongoDB
        createdAt: new Date(),
      }

      console.log("Saving recording document:", {
        ...recordingDoc,
        audioData: audioData ? `[Buffer: ${audioData.length} bytes]` : null,
      })

      const result = await db.collection("recordings").insertOne(recordingDoc)

      console.log(`Recording saved with ID: ${result.insertedId.toString()}`)

      return NextResponse.json(
        {
          message: "Recording saved successfully",
          recordingId: result.insertedId.toString(),
        },
        { status: 201 },
      )
    } catch (dbError) {
      console.error("Database error while saving recording:", dbError)
      return NextResponse.json(
        {
          message: "Database error while saving the recording",
          error: dbError instanceof Error ? dbError.message : String(dbError),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error saving recording:", error)
    return NextResponse.json(
      {
        message: "An error occurred while saving the recording",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
