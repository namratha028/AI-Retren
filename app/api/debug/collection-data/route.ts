import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const collection = searchParams.get("collection")

  if (!collection) {
    return NextResponse.json(
      {
        status: "error",
        message: "Collection name is required",
      },
      { status: 400 },
    )
  }

  try {
    // Connect to the database
    const { db } = await connectToDatabase()

    // Get documents from the collection (limit to 20 for safety)
    const documents = await db.collection(collection).find({}).limit(20).toArray()

    // Convert ObjectIds to strings for JSON serialization
    const serializedDocuments = documents.map((doc) => {
      return {
        ...doc,
        _id: doc._id.toString(),
        userId: doc.userId && typeof doc.userId === "object" ? doc.userId.toString() : doc.userId,
      }
    })

    return NextResponse.json({
      status: "success",
      collection,
      count: documents.length,
      documents: serializedDocuments,
    })
  } catch (error) {
    console.error(`Error fetching ${collection} data:`, error)
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : `Failed to fetch ${collection} data`,
      },
      { status: 500 },
    )
  }
}
