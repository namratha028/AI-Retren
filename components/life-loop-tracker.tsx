"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, TrendingUp, TrendingDown, RefreshCw } from "lucide-react"

interface Pattern {
  id: string
  type: "limiting" | "empowering"
  phrase: string
  frequency: number
  firstDetected: string
  lastDetected: string
  spiralStage?: string
  suggestion?: string
}

interface LifeLoopTrackerProps {
  userId: string
  recordings: any[]
}

export function LifeLoopTracker({ userId, recordings }: LifeLoopTrackerProps) {
  const [patterns, setPatterns] = useState<Pattern[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // In a real implementation, this would call an API to analyze patterns
    // For now, we'll simulate with sample data
    const detectPatterns = async () => {
      setIsLoading(true)

      try {
        // This would be an API call in production
        // const response = await fetch(`/api/patterns/detect?userId=${userId}`);
        // const data = await response.json();

        // Simulate API response with sample data
        setTimeout(() => {
          const samplePatterns: Pattern[] = [
            {
              id: "1",
              type: "limiting",
              phrase: "I always mess this up",
              frequency: 5,
              firstDetected: "2023-05-10T14:48:00.000Z",
              lastDetected: "2023-05-15T09:23:00.000Z",
              spiralStage: "Blue",
              suggestion: "Try reframing: 'I'm learning and improving with each attempt.'",
            },
            {
              id: "2",
              type: "limiting",
              phrase: "They never listen to me",
              frequency: 3,
              firstDetected: "2023-05-12T10:30:00.000Z",
              lastDetected: "2023-05-14T16:45:00.000Z",
              spiralStage: "Red",
              suggestion: "Consider: 'How can I communicate more effectively?'",
            },
            {
              id: "3",
              type: "empowering",
              phrase: "I can figure this out",
              frequency: 4,
              firstDetected: "2023-05-11T08:20:00.000Z",
              lastDetected: "2023-05-15T11:10:00.000Z",
              spiralStage: "Orange",
              suggestion: "Great mindset! Keep building on this confidence.",
            },
            {
              id: "4",
              type: "empowering",
              phrase: "We're all learning together",
              frequency: 2,
              firstDetected: "2023-05-13T13:15:00.000Z",
              lastDetected: "2023-05-15T14:30:00.000Z",
              spiralStage: "Green",
              suggestion: "This collaborative mindset serves you well!",
            },
          ]

          setPatterns(samplePatterns)
          setIsLoading(false)
        }, 1500)
      } catch (error) {
        console.error("Error detecting patterns:", error)
        setIsLoading(false)
      }
    }

    if (recordings.length > 0) {
      detectPatterns()
    } else {
      setIsLoading(false)
    }
  }, [userId, recordings])

  if (recordings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Life Loop Tracker</CardTitle>
          <CardDescription>Detect recurring patterns in your speech and thoughts</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
          <RefreshCw className="h-12 w-12 text-slate-300 mb-4" />
          <p className="text-slate-500">
            No recordings available yet. Start by recording your voice to detect patterns.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Life Loop Tracker</CardTitle>
        <CardDescription>Detect recurring patterns in your speech and thoughts</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Tabs defaultValue="limiting">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="limiting" className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-500" />
                <span>Limiting Patterns</span>
              </TabsTrigger>
              <TabsTrigger value="empowering" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span>Empowering Patterns</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="limiting" className="pt-4 space-y-4">
              {patterns.filter((p) => p.type === "limiting").length > 0 ? (
                patterns
                  .filter((p) => p.type === "limiting")
                  .map((pattern) => (
                    <div key={pattern.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-5 w-5 text-amber-500" />
                          <span className="font-medium">"{pattern.phrase}"</span>
                        </div>
                        <Badge variant="outline">{pattern.spiralStage} Stage</Badge>
                      </div>
                      <div className="text-sm text-slate-500">Detected {pattern.frequency} times</div>
                      <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md text-sm">
                        <p className="text-amber-800 dark:text-amber-300">{pattern.suggestion}</p>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <p>No limiting patterns detected yet.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="empowering" className="pt-4 space-y-4">
              {patterns.filter((p) => p.type === "empowering").length > 0 ? (
                patterns
                  .filter((p) => p.type === "empowering")
                  .map((pattern) => (
                    <div key={pattern.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-emerald-500" />
                          <span className="font-medium">"{pattern.phrase}"</span>
                        </div>
                        <Badge variant="outline">{pattern.spiralStage} Stage</Badge>
                      </div>
                      <div className="text-sm text-slate-500">Detected {pattern.frequency} times</div>
                      <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-md text-sm">
                        <p className="text-emerald-800 dark:text-emerald-300">{pattern.suggestion}</p>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <p>No empowering patterns detected yet.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}
