"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, FileText, BarChart3 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { SpiralDynamicsResults } from "@/components/spiral-dynamics-results"

interface TextInputFallbackProps {
  onSubmit?: (text: string) => void
  onCancel?: () => void
  isProcessing?: boolean
}

export function TextInputFallback({ onSubmit, onCancel, isProcessing: externalProcessing }: TextInputFallbackProps) {
  const [text, setText] = useState("")
  const [error, setError] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const [showResults, setShowResults] = useState(false)
  const { toast } = useToast()

  const isProcessing = externalProcessing || isAnalyzing

  const handleSubmit = async () => {
    if (!text.trim()) {
      setError("Please enter some text to analyze")
      return
    }

    if (text.trim().length < 20) {
      setError("Please enter at least 20 characters for accurate analysis")
      return
    }

    setError("")

    if (onSubmit) {
      onSubmit(text)
      return
    }

    // Handle analysis internally
    setIsAnalyzing(true)
    try {
      const response = await fetch("/api/analyze-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`)
      }

      const results = await response.json()
      setAnalysisResults(results)
      setShowResults(true)

      toast({
        title: "Analysis complete",
        description: "Your text has been analyzed successfully.",
      })
    } catch (error) {
      console.error("Analysis error:", error)
      setError("Analysis failed. Please try again.")
      toast({
        variant: "destructive",
        title: "Analysis failed",
        description: "Could not analyze your text. Please try again.",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const resetAnalysis = () => {
    setText("")
    setAnalysisResults(null)
    setShowResults(false)
    setError("")
  }

  if (showResults && analysisResults) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SpiralDynamicsResults />
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button onClick={resetAnalysis} variant="outline">
              Analyze New Text
            </Button>
            {onCancel && (
              <Button onClick={onCancel} variant="outline">
                Back to Voice
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Text Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Textarea
            placeholder="Enter your thoughts, feelings, or challenges here... (minimum 20 characters)"
            className="min-h-[150px]"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isProcessing}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <p className="text-xs text-muted-foreground">
            For best results, write at least a few sentences about your current thoughts, challenges, or perspective.
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
            Back to Voice
          </Button>
        )}
        <Button onClick={handleSubmit} disabled={isProcessing} className={onCancel ? "" : "w-full"}>
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Analyze Text"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
