import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: Request) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions)

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get request body
    const { transcript, analysis } = await request.json()

    if (!transcript) {
      return NextResponse.json({ message: "No transcript provided" }, { status: 400 })
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Store the transcript and analysis
    const result = await db.collection("transcripts").insertOne({
      userId: session.user.id,
      transcript,
      analysis,
      timestamp: new Date(),
    })

    return NextResponse.json({
      message: "Transcript stored successfully",
      transcriptId: result.insertedId,
      success: true,
    })
  } catch (error) {
    console.error("Error storing transcript:", error)
    return NextResponse.json(
      {
        message: "An error occurred while storing the transcript",
        error: error instanceof Error ? error.message : String(error),
        success: false,
      },
      { status: 500 },
    )
  }
}
