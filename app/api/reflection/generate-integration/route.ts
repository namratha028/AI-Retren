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

    // Get reflection and analysis results from request
    const { reflection, analysisResults } = await request.json()

    if (!reflection) {
      return NextResponse.json({ message: "No reflection provided" }, { status: 400 })
    }

    // Generate integration prompt using GPT-4
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a thoughtful guide for personal development based on Spiral Dynamics. 
          Your task is to create a practical integration suggestion that will help the user 
          apply their insights to daily life. The suggestion should be specific, actionable, 
          and aligned with their current stage of development.`,
        },
        {
          role: "user",
          content: `Based on my analysis: ${JSON.stringify(analysisResults)}, 
          and my reflection: "${reflection}", 
          suggest ONE practical way I can integrate this insight into my daily life.`,
        },
      ],
      max_tokens: 200,
    })

    const prompt =
      completion.choices[0]?.message?.content ||
      "Consider setting aside 5 minutes each day to reflect on how your values influence your decisions."

    return NextResponse.json(
      {
        prompt,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error generating integration prompt:", error)
    return NextResponse.json(
      {
        message: "An error occurred while generating the integration prompt",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
