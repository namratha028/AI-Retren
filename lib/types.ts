export interface SpiralDynamicsAnalysis {
  dominantColor: string
  colorName: string
  colorHex: string
  description: string
  scores: {
    [key: string]: number
  }
  summary: string
  feedback: {
    insights: string[]
    recommendations: string[]
    resources: {
      title: string
      type: string
    }[]
  }
  colorDescriptions: {
    [key: string]: {
      name: string
      hex: string
      description: string
    }
  }
}

export interface PersonalityAssessment {
  userId: string
  scores: {
    [key: string]: number
  }
  dominantColor: string
  colorName: string
  colorHex: string
  description: string
  timestamp: Date
  createdAt: Date
}

export interface Pattern {
  userId: string
  type: "limiting" | "empowering"
  phrase: string
  frequency: number
  firstDetected: Date
  lastDetected: Date
  spiralStage?: string
  suggestion?: string
  createdAt: Date
}

export interface Practice {
  userId: string
  practiceId: string
  title: string
  type: string
  spiralStage: string
  completed: boolean
  completedAt?: Date
  notes?: string
  createdAt: Date
}

export interface TransformationGoal {
  userId: string
  currentStage: string
  targetStage: string
  startDate: Date
  targetDate?: Date
  progress: number
  createdAt: Date
  updatedAt: Date
}

export interface Recording {
  userId: string
  transcript: string
  duration: number
  timestamp: Date
  createdAt: Date
}

export interface User {
  id: string
  name: string
  email: string
  image?: string
  currentStage?: string
  targetStage?: string
  onboardingCompleted?: boolean
  createdAt: Date
  updatedAt: Date
}
