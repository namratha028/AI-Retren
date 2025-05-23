"use client"

import { Shell } from "@/components/shell"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VoiceRecorder } from "@/components/voice-recorder"
import { RecordingHistory } from "@/components/recording-history"
import { Mic, FileText, History, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { SpiralDynamicsResults } from "@/components/spiral-dynamics-results"

export default function VoicePage() {
  return (
    <Shell>
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold">Voice Analysis</h1>
          <p className="text-muted-foreground">
            Record your voice or enter text to analyze your Spiral Dynamics profile
          </p>
        </div>

        <Tabs defaultValue="voice" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="voice">
              <Mic className="h-4 w-4 mr-2" />
              Voice
            </TabsTrigger>
            <TabsTrigger value="text">
              <FileText className="h-4 w-4 mr-2" />
              Text
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="voice" className="space-y-4">
            <VoiceRecorder />
          </TabsContent>

          <TabsContent value="text" className="space-y-4">
            <TextInput />
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <RecordingHistory />
          </TabsContent>
        </Tabs>
      </div>
    </Shell>
  )
}

// Simple text input component
function TextInput() {
  const [text, setText] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const analyzeText = async () => {
    if (text.trim().length < 10) {
      setError("Please enter at least 10 characters for analysis")
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      // Analyze text
      const response = await fetch("/api/analyze-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        throw new Error("Analysis failed. Please try again.")
      }

      const data = await response.json()
      setAnalysisResults(data)

      toast({
        title: "Analysis complete",
        description: "Your Spiral Dynamics profile is ready!",
      })
    } catch (error) {
      console.error("Analysis error:", error)
      setError("Analysis failed. Please try again.")
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
    setText("")
    setAnalysisResults(null)
    setError(null)
  }

  // If analysis results are available, show them
  if (analysisResults) {
    return (
      <div className="space-y-4">
        <SpiralDynamicsResults analysisData={analysisResults} />
        <div className="flex justify-center">
          <Button onClick={resetAnalysis} variant="outline">
            Start New Analysis
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Text Input</CardTitle>
        <CardDescription>
          Enter text about your thoughts, feelings, or perspective for Spiral Dynamics analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter your thoughts here... (minimum 10 characters)"
          className="min-h-[200px]"
          disabled={isAnalyzing}
        />
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </CardContent>
      <CardFooter>
        <Button onClick={analyzeText} disabled={isAnalyzing || text.trim().length < 10} className="w-full">
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            "Analyze Text"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
