import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { connectToDatabase } from "@/lib/mongodb"
import { compare } from "bcryptjs"

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "your-fallback-secret-key-for-development",
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Connect to database - reuse connection if possible
          const { db } = await connectToDatabase()

          // Only fetch necessary fields for authentication
          const user = await db.collection("users").findOne(
            { email: credentials.email },
            {
              projection: {
                _id: 1,
                name: 1,
                email: 1,
                password: 1,
                image: 1,
                currentStage: 1,
                targetStage: 1,
                onboardingCompleted: 1,
              },
            },
          )

          if (!user) {
            console.log("User not found")
            return null
          }

          const isPasswordValid = await compare(credentials.password, user.password)

          if (!isPasswordValid) {
            console.log("Invalid password")
            return null
          }

          // Return only what's needed for the session
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            image: user.image || null,
            currentStage: user.currentStage || null,
            targetStage: user.targetStage || null,
            onboardingCompleted: user.onboardingCompleted || false,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.currentStage = user.currentStage
        token.targetStage = user.targetStage
        token.onboardingCompleted = user.onboardingCompleted
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.currentStage = (token.currentStage as string) || null
        session.user.targetStage = (token.targetStage as string) || null
        session.user.onboardingCompleted = (token.onboardingCompleted as boolean) || false
      }
      return session
    },
  },
  debug: process.env.NODE_ENV === "development",
}
