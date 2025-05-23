import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { analyzeText } from "@/lib/spiral-dynamics-analyzer"

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get text from request
    const body = await req.json()
    const { text } = body

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "No text provided or invalid format" }, { status: 400 })
    }

    if (text.trim().length < 10) {
      return NextResponse.json(
        { error: "Text too short for analysis. Please provide at least 10 characters." },
        { status: 400 },
      )
    }

    console.log("Analyzing text:", text.substring(0, 100) + "...")

    // Add processing delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Analyze the text using the local analyzer
    const analysis = await analyzeText(text)

    console.log("Analysis completed for user:", session.user?.email)

    // Save the analysis to database
    try {
      await saveAnalysisToDatabase(text, analysis, session.user?.email || "")
    } catch (saveError) {
      console.error("Failed to save analysis:", saveError)
      // Don't fail the request if saving fails
    }

    return NextResponse.json({
      ...analysis,
      success: true,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Text analysis error:", error)

    // Return a more helpful error response
    return NextResponse.json(
      {
        error: "Analysis failed",
        message: "Unable to analyze the text. Please try again.",
        success: false,
      },
      { status: 500 },
    )
  }
}

async function saveAnalysisToDatabase(text: string, analysis: any, userEmail: string) {
  // In a real app, this would save to MongoDB
  console.log("Saving analysis to database:", {
    userEmail,
    textLength: text.length,
    dominantColor: analysis.dominantColor,
    timestamp: new Date().toISOString(),
  })
}
