import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    // Validate input
    if (!name || !email || !password) {
      console.log("Missing required fields:", { name: !!name, email: !!email, password: !!password })
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    console.log("Attempting to register user:", email)

    // Connect to database
    const { db } = await connectToDatabase()

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ email })
    if (existingUser) {
      console.log("User already exists:", email)
      return NextResponse.json({ message: "User with this email already exists" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Create user
    const result = await db.collection("users").insertOne({
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    })

    // Convert the MongoDB ObjectId to string for the response
    const userId = result.insertedId.toString()

    console.log("User registered successfully with ID:", userId)

    return NextResponse.json({ message: "User created successfully", userId }, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)

    // Return a more specific error message
    const errorMessage = error instanceof Error ? error.message : "An error occurred during registration"

    return NextResponse.json({ message: errorMessage }, { status: 500 })
  }
}
