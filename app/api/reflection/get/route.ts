import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectToDatabase } from "@/lib/mongodb"
import { authOptions } from "@/lib/auth"
import { ObjectId } from "mongodb"
import crypto from "crypto"

export async function GET(request: Request) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions)

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get query parameters
    const url = new URL(request.url)
    const recordingId = url.searchParams.get("recordingId")

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

    // Build query
    const query: any = { userId }
    if (recordingId) {
      query.recordingId = new ObjectId(recordingId)
    }

    // Get reflections from database
    const reflections = await db.collection("reflections").find(query).sort({ timestamp: -1 }).toArray()

    // Decrypt sensitive data
    const encryptionKey = process.env.ENCRYPTION_KEY
    if (!encryptionKey) {
      throw new Error("Encryption key is not set")
    }

    const decrypt = (encrypted: { iv: string; content: string }) => {
      const decipher = crypto.createDecipheriv(
        "aes-256-cbc",
        Buffer.from(encryptionKey),
        Buffer.from(encrypted.iv, "hex"),
      )
      let decrypted = decipher.update(encrypted.content, "hex", "utf8")
      decrypted += decipher.final("utf8")
      return decrypted
    }

    // Process reflections
    const processedReflections = reflections.map((reflection) => {
      return {
        id: reflection._id.toString(),
        recordingId: reflection.recordingId ? reflection.recordingId.toString() : null,
        reflectionPrompt: decrypt(reflection.reflectionPrompt),
        reflection: decrypt(reflection.reflection),
        integrationPrompt: reflection.integrationPrompt ? decrypt(reflection.integrationPrompt) : null,
        timestamp: reflection.timestamp,
        createdAt: reflection.createdAt,
      }
    })

    return NextResponse.json(
      {
        reflections: processedReflections,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error getting reflections:", error)
    return NextResponse.json(
      {
        message: "An error occurred while getting reflections",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
