"use client"

import { useState, useEffect } from "react"
import { Shell } from "@/components/shell"
import { SpiralDynamicsResults } from "@/components/spiral-dynamics-results"
import { PromptedReflection } from "@/components/prompted-reflection"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { RefreshCw, TrendingUp, Brain, BookOpen } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AnalysisData {
  id: string
  timestamp: string
  scores: Record<string, number>
  dominantStage: string
  insights: string[]
  recommendations: string[]
}

export default function InsightsPage() {
  const [analysisData, setAnalysisData] = useState<AnalysisData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalysisData()
  }, [])

  const fetchAnalysisData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/analysis/get")
      if (response.ok) {
        const data = await response.json()
        setAnalysisData(data.analyses || [])
      } else {
        throw new Error("Failed to fetch analysis data")
      }
    } catch (error) {
      console.error("Error fetching analysis data:", error)
      setError("Failed to load your insights. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const latestAnalysis = analysisData[0]

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Insights</h1>
            <p className="text-muted-foreground">
              Detailed analysis of your Spiral Dynamics profile based on your voice recordings.
            </p>
          </div>
          <Button onClick={fetchAnalysisData} disabled={isLoading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-muted rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Analyses</p>
                      <p className="text-2xl font-bold">{analysisData.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Dominant Stage</p>
                      <p className="text-2xl font-bold">{latestAnalysis?.dominantStage || "N/A"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Last Analysis</p>
                      <p className="text-2xl font-bold">
                        {latestAnalysis ? new Date(latestAnalysis.timestamp).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="profile" className="space-y-4">
              <TabsList>
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="reflection">Reflection</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Spiral Dynamics Profile</CardTitle>
                    <CardDescription>Comprehensive breakdown of your value systems</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {latestAnalysis ? (
                      <SpiralDynamicsResults />
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">No analysis data available yet.</p>
                        <Button onClick={() => (window.location.href = "/voice")}>Start Voice Analysis</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reflection">
                <PromptedReflection currentStage={latestAnalysis?.dominantStage || "blue"} />
              </TabsContent>

              <TabsContent value="recommendations">
                <Card>
                  <CardHeader>
                    <CardTitle>Personalized Recommendations</CardTitle>
                    <CardDescription>Suggestions based on your Spiral Dynamics profile</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {latestAnalysis?.recommendations ? (
                      <div className="space-y-4">
                        {latestAnalysis.recommendations.map((rec, index) => (
                          <div key={index} className="p-4 bg-secondary/50 rounded-lg">
                            <p>{rec}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-4 bg-secondary/50 rounded-lg">
                          <h3 className="font-medium mb-2">Reading Recommendations</h3>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Spiral Dynamics: Mastering Values, Leadership, and Change</li>
                            <li>Reinventing Organizations</li>
                            <li>The Righteous Mind: Why Good People Are Divided by Politics and Religion</li>
                          </ul>
                        </div>

                        <div className="p-4 bg-secondary/50 rounded-lg">
                          <h3 className="font-medium mb-2">Practice Recommendations</h3>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Daily mindfulness meditation</li>
                            <li>Perspective-taking exercises</li>
                            <li>Values clarification journaling</li>
                          </ul>
                        </div>

                        <div className="p-4 bg-secondary/50 rounded-lg">
                          <h3 className="font-medium mb-2">Development Focus Areas</h3>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Integrating multiple perspectives</li>
                            <li>Balancing structure with flexibility</li>
                            <li>Developing systems thinking</li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </Shell>
  )
}
