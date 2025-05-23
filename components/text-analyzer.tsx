"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function TextAnalyzer() {
  const [text, setText] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<any>(null)
  const { toast } = useToast()

  const handleAnalyze = async () => {
    if (text.trim().length < 10) {
      toast({
        variant: "destructive",
        title: "Text too short",
        description: "Please enter at least 10 characters for analysis",
      })
      return
    }

    setIsAnalyzing(true)

    try {
      // Simulate analysis with a delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Generate mock results
      const mockResults = {
        stages: {
          beige: Math.floor(Math.random() * 30),
          purple: Math.floor(Math.random() * 70) + 30,
          red: Math.floor(Math.random() * 50),
          blue: Math.floor(Math.random() * 60),
          orange: Math.floor(Math.random() * 50),
          green: Math.floor(Math.random() * 40),
          yellow: Math.floor(Math.random() * 30),
          turquoise: Math.floor(Math.random() * 20),
        },
        dominantStage: "purple",
        insights: [
          "You show strong tribal and community-oriented thinking patterns.",
          "Your language reveals a connection to traditions and rituals.",
          "There's evidence of magical thinking and symbolic understanding.",
        ],
        recommendations: [
          "Explore how your community values shape your decisions.",
          "Consider how traditions provide meaning in your life.",
          "Reflect on the symbols and rituals that are important to you.",
        ],
      }

      setResults(mockResults)
      toast({
        title: "Analysis complete",
        description: "Your Spiral Dynamics profile is ready!",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Analysis failed",
        description: "There was an error analyzing your text. Please try again.",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const resetAnalysis = () => {
    setResults(null)
    setText("")
  }

  if (results) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Spiral Dynamics Profile</CardTitle>
            <CardDescription>Based on your text input</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-4">
                {Object.entries(results.stages).map(([stage, value]) => (
                  <div key={stage} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium capitalize">{stage}</span>
                      <span>{value}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`bg-${stage === "beige" ? "amber" : stage}-${stage === "orange" || stage === "yellow" || stage === "green" ? "500" : "600"} h-2 rounded-full`}
                        style={{ width: `${value}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Insights</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {results.insights.map((insight, index) => (
                    <li key={index}>{insight}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Recommendations</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {results.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>

              <Button onClick={resetAnalysis} className="w-full">
                Start New Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Text Analysis</CardTitle>
        <CardDescription>Enter your thoughts, feelings, or perspective for Spiral Dynamics analysis</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter your thoughts here... (minimum 10 characters)"
          className="min-h-[200px]"
          disabled={isAnalyzing}
        />

        <Button onClick={handleAnalyze} disabled={isAnalyzing || text.trim().length < 10} className="w-full">
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            "Analyze Text"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
