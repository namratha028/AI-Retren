import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectToDatabase } from "@/lib/mongodb"
import { authOptions } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions)

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const id = params.id

    if (!id) {
      return NextResponse.json({ message: "Recording ID is required" }, { status: 400 })
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

    // Find the recording to verify ownership
    const recording = await db.collection("recordings").findOne({
      _id: new ObjectId(id),
      userId,
    })

    if (!recording) {
      return NextResponse.json({ message: "Recording not found or not authorized" }, { status: 404 })
    }

    // Delete the recording
    const result = await db.collection("recordings").deleteOne({
      _id: new ObjectId(id),
      userId,
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "Failed to delete recording" }, { status: 500 })
    }

    return NextResponse.json(
      {
        message: "Recording deleted successfully",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error deleting recording:", error)
    return NextResponse.json(
      {
        message: "An error occurred while deleting the recording",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
