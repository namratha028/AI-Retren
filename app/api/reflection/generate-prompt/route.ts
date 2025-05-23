import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import OpenAI from "openai"

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions)

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get analysis results from request
    const { analysisResults } = await request.json()

    if (!analysisResults) {
      return NextResponse.json({ message: "No analysis results provided" }, { status: 400 })
    }

    // Generate reflection prompt using GPT-4
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a thoughtful guide for personal development based on Spiral Dynamics. 
          Your task is to create a single, powerful reflective question that will help the user 
          gain deeper insight into their current stage of development and potential growth areas.
          The question should be specific to their current stage and challenges.`,
        },
        {
          role: "user",
          content: `Based on this analysis of my speech: ${JSON.stringify(analysisResults)}, 
          generate ONE thoughtful reflection question that will help me gain deeper insight.`,
        },
      ],
      max_tokens: 150,
    })

    const prompt =
      completion.choices[0]?.message?.content || "What insights have you gained about yourself from this analysis?"

    return NextResponse.json(
      {
        prompt,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error generating reflection prompt:", error)
    return NextResponse.json(
      {
        message: "An error occurred while generating the reflection prompt",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
