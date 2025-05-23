import { MongoClient, ServerApiVersion } from "mongodb"

// Use environment variable with fallback
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://raghavendrachanda1220:1234@cluster0.7ppzuoj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
const MONGODB_DB = process.env.MONGODB_DB || "spiral_dynamics"

// Cache the MongoDB connection to reuse it across requests
let cachedClient: MongoClient | null = null
let cachedDb: any = null

export async function connectToDatabase() {
  // If we have the cached connection, use it
  if (cachedClient && cachedDb) {
    console.log("Using cached database connection")
    return { client: cachedClient, db: cachedDb }
  }

  if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable")
  }

  if (!MONGODB_DB) {
    throw new Error("Please define the MONGODB_DB environment variable")
  }

  try {
    console.log("Creating new MongoDB connection...")

    // Create a new MongoDB connection with optimized options
    const client = new MongoClient(MONGODB_URI, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
      // Add connection pooling options
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 60000,
      connectTimeoutMS: 10000, // Increased timeout
    })

    // Connect with timeout
    console.log("Connecting to MongoDB...")
    await Promise.race([
      client.connect(),
      new Promise((_, reject) => setTimeout(() => reject(new Error("MongoDB connection timeout")), 10000)),
    ])
    console.log("Connected to MongoDB")

    const db = client.db(MONGODB_DB)
    console.log("Database selected:", MONGODB_DB)

    // Cache the connection
    cachedClient = client
    cachedDb = db

    return { client, db }
  } catch (error) {
    console.error("MongoDB connection error:", error)
    throw new Error(`Failed to connect to database: ${error instanceof Error ? error.message : String(error)}`)
  }
}
