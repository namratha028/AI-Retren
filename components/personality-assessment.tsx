"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, ChevronLeft, CheckCircle } from "lucide-react"

interface Question {
  id: string
  text: string
  options: {
    value: string
    label: string
    color?: string
    spiralStage?: string
  }[]
}

// Sample questions based on Spiral Dynamics
const questions: Question[] = [
  {
    id: "q1",
    text: "When facing a conflict, which approach do you prefer?",
    options: [
      {
        value: "purple",
        label: "Seek guidance from traditions or elders",
        color: "#9B59B6",
        spiralStage: "Purple - Tribal",
      },
      { value: "red", label: "Assert power and take control", color: "#E74C3C", spiralStage: "Red - Power" },
      {
        value: "blue",
        label: "Follow established rules and procedures",
        color: "#3498DB",
        spiralStage: "Blue - Order",
      },
      {
        value: "orange",
        label: "Find the most efficient or strategic solution",
        color: "#F39C12",
        spiralStage: "Orange - Achievement",
      },
      {
        value: "green",
        label: "Ensure everyone's voice is heard and valued",
        color: "#2ECC71",
        spiralStage: "Green - Community",
      },
      {
        value: "yellow",
        label: "Understand the complex systems at play",
        color: "#F1C40F",
        spiralStage: "Yellow - Systemic",
      },
    ],
  },
  {
    id: "q2",
    text: "What motivates you most in your work or personal projects?",
    options: [
      {
        value: "purple",
        label: "Being part of a close-knit community",
        color: "#9B59B6",
        spiralStage: "Purple - Tribal",
      },
      { value: "red", label: "Recognition, status, and personal gain", color: "#E74C3C", spiralStage: "Red - Power" },
      {
        value: "blue",
        label: "Doing what's right and following proper procedures",
        color: "#3498DB",
        spiralStage: "Blue - Order",
      },
      {
        value: "orange",
        label: "Achievement, success, and innovation",
        color: "#F39C12",
        spiralStage: "Orange - Achievement",
      },
      {
        value: "green",
        label: "Making a positive difference for others",
        color: "#2ECC71",
        spiralStage: "Green - Community",
      },
      {
        value: "yellow",
        label: "Learning, growth, and understanding complexity",
        color: "#F1C40F",
        spiralStage: "Yellow - Systemic",
      },
    ],
  },
  {
    id: "q3",
    text: "How do you typically make important decisions?",
    options: [
      {
        value: "purple",
        label: "Based on what my family or community would approve of",
        color: "#9B59B6",
        spiralStage: "Purple - Tribal",
      },
      {
        value: "red",
        label: "Based on what benefits me the most right now",
        color: "#E74C3C",
        spiralStage: "Red - Power",
      },
      {
        value: "blue",
        label: "Based on rules, principles, and what's proper",
        color: "#3498DB",
        spiralStage: "Blue - Order",
      },
      {
        value: "orange",
        label: "Based on data, efficiency, and strategic advantage",
        color: "#F39C12",
        spiralStage: "Orange - Achievement",
      },
      {
        value: "green",
        label: "Based on how it affects everyone involved",
        color: "#2ECC71",
        spiralStage: "Green - Community",
      },
      {
        value: "yellow",
        label: "Based on a holistic view of the entire situation",
        color: "#F1C40F",
        spiralStage: "Yellow - Systemic",
      },
    ],
  },
  {
    id: "q4",
    text: "What's your view on societal rules and norms?",
    options: [
      {
        value: "purple",
        label: "Sacred traditions that preserve our identity",
        color: "#9B59B6",
        spiralStage: "Purple - Tribal",
      },
      {
        value: "red",
        label: "Constraints to be challenged or worked around",
        color: "#E74C3C",
        spiralStage: "Red - Power",
      },
      {
        value: "blue",
        label: "Important structures that maintain order",
        color: "#3498DB",
        spiralStage: "Blue - Order",
      },
      {
        value: "orange",
        label: "Guidelines that should evolve for efficiency",
        color: "#F39C12",
        spiralStage: "Orange - Achievement",
      },
      {
        value: "green",
        label: "Should be inclusive and consider all perspectives",
        color: "#2ECC71",
        spiralStage: "Green - Community",
      },
      {
        value: "yellow",
        label: "Useful in context but should be flexible",
        color: "#F1C40F",
        spiralStage: "Yellow - Systemic",
      },
    ],
  },
  {
    id: "q5",
    text: "How do you respond to new ideas or change?",
    options: [
      { value: "purple", label: "Cautious - prefer familiar ways", color: "#9B59B6", spiralStage: "Purple - Tribal" },
      { value: "red", label: "Interested if it gives me an advantage", color: "#E74C3C", spiralStage: "Red - Power" },
      {
        value: "blue",
        label: "Accept if it comes from proper authority",
        color: "#3498DB",
        spiralStage: "Blue - Order",
      },
      {
        value: "orange",
        label: "Embrace if it's better or more efficient",
        color: "#F39C12",
        spiralStage: "Orange - Achievement",
      },
      {
        value: "green",
        label: "Consider how it affects everyone involved",
        color: "#2ECC71",
        spiralStage: "Green - Community",
      },
      {
        value: "yellow",
        label: "Evaluate based on the whole system",
        color: "#F1C40F",
        spiralStage: "Yellow - Systemic",
      },
    ],
  },
]

export function PersonalityAssessment({ onComplete }: { onComplete: (results: any) => void }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [currentAnswer, setCurrentAnswer] = useState<string | null>(null)
  const [isComplete, setIsComplete] = useState(false)

  const handleNext = () => {
    if (currentAnswer) {
      // Save the current answer
      setAnswers((prev) => ({
        ...prev,
        [questions[currentQuestionIndex].id]: currentAnswer,
      }))

      // Move to next question or complete
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1)
        setCurrentAnswer(null)
      } else {
        // Calculate results
        const results = calculateResults(answers)
        setIsComplete(true)
        onComplete(results)
      }
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
      setCurrentAnswer(answers[questions[currentQuestionIndex - 1].id] || null)
    }
  }

  const calculateResults = (answers: Record<string, string>) => {
    // Count occurrences of each value
    const counts: Record<string, number> = {}
    Object.values(answers).forEach((value) => {
      counts[value] = (counts[value] || 0) + 1
    })

    // Calculate percentages
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0)
    const scores: Record<string, number> = {}
    Object.entries(counts).forEach(([value, count]) => {
      scores[value] = count / total
    })

    // Determine dominant color
    const dominantColor = Object.entries(scores).reduce(
      (max, [color, score]) => (score > max.score ? { color, score } : max),
      { color: "", score: 0 },
    )

    // Get color info
    const colorInfo = {
      beige: {
        name: "Beige - Survival",
        hex: "#E8D0AA",
        description: "Focused on immediate survival needs and basic physiological requirements.",
      },
      purple: {
        name: "Purple - Tribal",
        hex: "#9B59B6",
        description: "Magical thinking, tribal bonds, and traditions. Strong sense of belonging.",
      },
      red: {
        name: "Red - Power",
        hex: "#E74C3C",
        description: "Impulsive, egocentric. Focused on power, dominance, and immediate gratification.",
      },
      blue: {
        name: "Blue - Order",
        hex: "#3498DB",
        description: "Purpose, order, and meaning. Follows rules and moral codes.",
      },
      orange: {
        name: "Orange - Achievement",
        hex: "#F39C12",
        description: "Strategic, achievement-oriented, and competitive. Focused on success and progress.",
      },
      green: {
        name: "Green - Community",
        hex: "#2ECC71",
        description: "Communitarian, egalitarian. Values harmony, equality, and community well-being.",
      },
      yellow: {
        name: "Yellow - Systemic",
        hex: "#F1C40F",
        description: "Integrative, flexible thinking. Sees complexity and multiple perspectives.",
      },
      turquoise: {
        name: "Turquoise - Holistic",
        hex: "#1ABC9C",
        description: "Holistic, global view. Concerned with planetary consciousness.",
      },
    }

    const colorData = colorInfo[dominantColor.color as keyof typeof colorInfo]

    return {
      scores,
      dominantColor: dominantColor.color,
      colorName: colorData?.name || "Unknown",
      colorHex: colorData?.hex || "#888888",
      description: colorData?.description || "",
      colorDescriptions: colorInfo,
      timestamp: new Date(),
    }
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Personality Assessment</CardTitle>
        <CardDescription>Answer these questions to help us understand your Spiral Dynamics profile</CardDescription>
        <Progress value={progress} className="mt-2" />
      </CardHeader>

      <CardContent>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-4">
              <h3 className="text-lg font-medium">
                Question {currentQuestionIndex + 1} of {questions.length}
              </h3>
              <p className="text-lg">{currentQuestion.text}</p>

              <RadioGroup value={currentAnswer || ""} onValueChange={setCurrentAnswer} className="space-y-3 pt-3">
                {currentQuestion.options.map((option) => (
                  <div
                    key={option.value}
                    className={`flex items-center space-x-2 rounded-lg border p-4 transition-colors ${
                      currentAnswer === option.value
                        ? "border-primary bg-primary/5"
                        : "border-input hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <RadioGroupItem value={option.value} id={option.value} className="mt-0" />
                    <Label htmlFor={option.value} className="flex flex-1 cursor-pointer items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: option.color }}></div>
                        <span>{option.label}</span>
                      </div>
                      {currentAnswer === option.value && <CheckCircle className="h-4 w-4 text-primary" />}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </motion.div>
        </AnimatePresence>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button onClick={handleNext} disabled={!currentAnswer}>
          {currentQuestionIndex < questions.length - 1 ? (
            <>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          ) : (
            "Complete"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
