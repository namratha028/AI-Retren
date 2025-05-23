import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectToDatabase } from "@/lib/mongodb"
import { authOptions } from "@/lib/auth"
import { ObjectId } from "mongodb"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions)

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get reflection data from request
    const { recordingId, reflectionPrompt, reflection, integrationPrompt, timestamp } = await request.json()

    if (!reflection || !reflectionPrompt) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
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

    // Encrypt sensitive data
    const encryptionKey = process.env.ENCRYPTION_KEY
    if (!encryptionKey) {
      throw new Error("Encryption key is not set")
    }

    const encrypt = (text: string) => {
      const iv = crypto.randomBytes(16)
      const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(encryptionKey), iv)
      let encrypted = cipher.update(text, "utf8", "hex")
      encrypted += cipher.final("hex")
      return {
        iv: iv.toString("hex"),
        content: encrypted,
      }
    }

    const encryptedReflection = encrypt(reflection)
    const encryptedReflectionPrompt = encrypt(reflectionPrompt)
    const encryptedIntegrationPrompt = integrationPrompt ? encrypt(integrationPrompt) : null

    // Save reflection to database
    const result = await db.collection("reflections").insertOne({
      userId,
      recordingId: recordingId ? new ObjectId(recordingId) : null,
      reflectionPrompt: encryptedReflectionPrompt,
      reflection: encryptedReflection,
      integrationPrompt: encryptedIntegrationPrompt,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      createdAt: new Date(),
    })

    console.log("Reflection saved successfully with ID:", result.insertedId.toString())

    return NextResponse.json(
      {
        message: "Reflection saved successfully",
        reflectionId: result.insertedId.toString(),
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error saving reflection:", error)
    return NextResponse.json(
      {
        message: "An error occurred while saving the reflection",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
