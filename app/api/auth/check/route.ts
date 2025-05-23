import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const startTime = Date.now()
    const session = await getServerSession(authOptions)
    const endTime = Date.now()

    console.log(`Auth check completed in ${endTime - startTime}ms`)

    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        currentStage: session.user.currentStage || null,
        targetStage: session.user.targetStage || null,
        onboardingCompleted: session.user.onboardingCompleted || false,
      },
    })
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json(
      {
        authenticated: false,
        error: "Failed to check authentication status",
      },
      { status: 500 },
    )
  }
}
