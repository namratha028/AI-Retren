"use client"

import { useState } from "react"
import { SimpleAudioExtractor } from "@/components/simple-audio-extractor"
import { SpiralDynamicsResults } from "@/components/spiral-dynamics-results"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { Mic, FileText, Loader2, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function VoiceAnalyzer() {
  const [activeTab, setActiveTab] = useState<string>("voice")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const [directText, setDirectText] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const { toast } = useToast()

  const handleTextExtracted = async (text: string, blob?: Blob) => {
    if (blob) {
      setAudioBlob(blob)
    }
    await analyzeText(text)
  }

  const handleDirectTextAnalysis = async () => {
    if (directText.trim().length < 10) {
      setError("Please enter at least 10 characters for analysis")
      return
    }
    await analyzeText(directText)
  }

  const analyzeText = async (text: string) => {
    setIsAnalyzing(true)
    setError(null)

    try {
      // First, save the audio if available
      if (audioBlob) {
        const audioFormData = new FormData()
        audioFormData.append("audio", audioBlob)
        audioFormData.append("transcript", text)

        try {
          await fetch("/api/store-transcript", {
            method: "POST",
            body: audioFormData,
          })
        } catch (audioError) {
          console.error("Error saving audio:", audioError)
          // Continue with analysis even if audio saving fails
        }
      }

      // Now analyze the text
      const response = await fetch("/api/analyze-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Analysis failed")
      }

      const data = await response.json()
      setAnalysisResults(data)

      // Save the analysis results
      try {
        await fetch("/api/analysis/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })
      } catch (saveError) {
        console.error("Error saving analysis:", saveError)
        // Continue even if saving fails
      }

      toast({
        title: "Analysis complete",
        description: "Your Spiral Dynamics profile is ready!",
      })
    } catch (error) {
      console.error("Analysis error:", error)
      const errorMessage = error instanceof Error ? error.message : "Analysis failed"
      setError(errorMessage)
      toast({
        variant: "destructive",
        title: "Analysis failed",
        description: errorMessage,
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const resetAnalysis = () => {
    setAnalysisResults(null)
    setDirectText("")
    setError(null)
    setAudioBlob(null)
  }

  // Show results if analysis is complete
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
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="voice" disabled={isAnalyzing}>
            <Mic className="h-4 w-4 mr-2" />
            Voice Recording
          </TabsTrigger>
          <TabsTrigger value="text" disabled={isAnalyzing}>
            <FileText className="h-4 w-4 mr-2" />
            Text Input
          </TabsTrigger>
        </TabsList>

        <TabsContent value="voice" className="mt-6">
          <SimpleAudioExtractor onTextExtracted={handleTextExtracted} isProcessing={isAnalyzing} />
        </TabsContent>

        <TabsContent value="text" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Text Input</CardTitle>
              <CardDescription>
                Enter text about your thoughts, feelings, or perspective for Spiral Dynamics analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={directText}
                onChange={(e) => setDirectText(e.target.value)}
                placeholder="Enter your thoughts here... (minimum 10 characters)"
                className="min-h-[200px]"
                disabled={isAnalyzing}
              />

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button onClick={handleDirectTextAnalysis} disabled={isAnalyzing || directText.trim().length < 10}>
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
