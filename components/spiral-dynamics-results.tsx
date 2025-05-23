"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Lightbulb, BookOpen, Target, Share2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface SpiralDynamicsResultsProps {
  analysisData?: any
  onNewAnalysis?: () => void
}

export function SpiralDynamicsResults({ analysisData, onNewAnalysis }: SpiralDynamicsResultsProps) {
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(!analysisData)
  const { toast } = useToast()

  useEffect(() => {
    if (analysisData) {
      setResults(analysisData)
      setLoading(false)
    } else {
      // Fetch latest analysis if no data provided
      fetchLatestAnalysis()
    }
  }, [analysisData])

  const fetchLatestAnalysis = async () => {
    try {
      const response = await fetch("/api/analysis/get")
      if (response.ok) {
        const data = await response.json()
        setResults(data)
      }
    } catch (error) {
      console.error("Failed to fetch analysis:", error)
    } finally {
      setLoading(false)
    }
  }

  const shareResults = async () => {
    if (!results) return

    try {
      await navigator.share({
        title: "My Spiral Dynamics Analysis",
        text: `I just discovered I'm primarily ${results.colorName}! ${results.description}`,
        url: window.location.href,
      })
    } catch (error) {
      // Fallback to clipboard
      navigator.clipboard.writeText(`My Spiral Dynamics Analysis: ${results.colorName} - ${results.description}`)
      toast({
        title: "Copied to clipboard",
        description: "Your results have been copied to clipboard",
      })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  if (!results) {
    return (
      <Card>
        <CardContent className="text-center p-8">
          <p className="text-muted-foreground mb-4">No analysis results available</p>
          {onNewAnalysis && <Button onClick={onNewAnalysis}>Start New Analysis</Button>}
        </CardContent>
      </Card>
    )
  }

  const { dominantColor, colorName, colorHex, description, scores, summary, feedback } = results

  return (
    <div className="space-y-6">
      {/* Main Result Card */}
      <Card>
        <CardHeader className="text-center">
          <div
            className="mx-auto w-16 h-16 rounded-full mb-4 flex items-center justify-center text-white font-bold text-xl"
            style={{ backgroundColor: colorHex }}
          >
            {dominantColor.charAt(0).toUpperCase()}
          </div>
          <CardTitle className="text-2xl">{colorName}</CardTitle>
          <CardDescription className="text-base">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center gap-2 mb-4">
            <Button onClick={shareResults} variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            {onNewAnalysis && (
              <Button onClick={onNewAnalysis} variant="outline" size="sm">
                New Analysis
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results */}
      <Tabs defaultValue="scores" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scores">
            <BarChart3 className="h-4 w-4 mr-2" />
            Scores
          </TabsTrigger>
          <TabsTrigger value="insights">
            <Lightbulb className="h-4 w-4 mr-2" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="resources">
            <BookOpen className="h-4 w-4 mr-2" />
            Resources
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scores" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stage Distribution</CardTitle>
              <CardDescription>Your alignment with each Spiral Dynamics stage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(scores).map(([color, score]: [string, any]) => {
                const colorInfo = results.colorDescriptions?.[color]
                if (!colorInfo) return null

                return (
                  <div key={color} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: colorInfo.hex }} />
                        <span className="font-medium">{colorInfo.name}</span>
                        {color === dominantColor && <Badge variant="secondary">Dominant</Badge>}
                      </div>
                      <span className="text-sm text-muted-foreground">{Math.round(score * 100)}%</span>
                    </div>
                    <Progress value={score * 100} className="h-2" />
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Insights</CardTitle>
              <CardDescription>Understanding your current perspective</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {feedback?.insights?.map((insight: string, index: number) => (
                <div key={index} className="p-4 bg-muted rounded-lg">
                  <p>{insight}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
              <CardDescription>Suggestions for your growth journey</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {feedback?.recommendations?.map((recommendation: string, index: number) => (
                <div key={index} className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p>{recommendation}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recommended Resources</CardTitle>
              <CardDescription>Books, practices, and tools for your development</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {feedback?.resources?.map((resource: any, index: number) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{resource.title}</p>
                    <p className="text-sm text-muted-foreground capitalize">{resource.type}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{summary}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
