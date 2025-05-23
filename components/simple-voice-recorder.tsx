"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, Square, Loader2, FileText, RotateCcw, Play, Pause } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { SpiralDynamicsResults } from "@/components/spiral-dynamics-results"
import { Textarea } from "@/components/ui/textarea"

export function SimpleVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const [showResults, setShowResults] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { toast } = useToast()

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop()
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  const startRecording = async () => {
    try {
      setError(null)
      setTranscript("")
      setAudioBlob(null)
      setAudioUrl(null)
      setAnalysisResults(null)
      setShowResults(false)
      audioChunksRef.current = []
      setRecordingTime(0)

      // Check browser support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          "Your browser doesn't support audio recording. Please use a modern browser like Chrome, Firefox, or Safari.",
        )
      }

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      })

      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        const url = URL.createObjectURL(audioBlob)
        setAudioBlob(audioBlob)
        setAudioUrl(url)

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop())

        // Start transcription automatically
        await transcribeAudio(audioBlob)
      }

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event)
        setError("Recording failed. Please try again.")
        stream.getTracks().forEach((track) => track.stop())
      }

      // Start recording
      mediaRecorder.start(1000)
      setIsRecording(true)

      // Start timer
      let seconds = 0
      timerRef.current = setInterval(() => {
        seconds++
        setRecordingTime(seconds)
      }, 1000)

      toast({
        title: "Recording started",
        description: "Speak clearly about your thoughts or feelings",
      })
    } catch (error) {
      console.error("Error starting recording:", error)
      const errorMessage = error instanceof Error ? error.message : "Could not access microphone"
      setError(errorMessage)
      toast({
        variant: "destructive",
        title: "Recording failed",
        description: errorMessage,
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()

      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }

      setIsRecording(false)
      toast({
        title: "Recording stopped",
        description: "Processing your audio...",
      })
    }
  }

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true)
    try {
      const formData = new FormData()
      formData.append("audio", audioBlob)

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      // Handle both success and fallback responses
      if (data.success || data.fallback) {
        setTranscript(data.text)

        if (data.fallback) {
          toast({
            title: "Using fallback transcription",
            description: "Please review and edit the text below before analysis",
            variant: "default",
          })
        } else {
          toast({
            title: "Transcription complete",
            description: "Review the text and click 'Analyze' to continue",
          })
        }
      } else {
        throw new Error(data.error || "Transcription failed")
      }
    } catch (error) {
      console.error("Transcription error:", error)
      // Provide a safe fallback
      setTranscript("Please edit this text with what you said and click 'Analyze Text' below.")
      setError("Transcription failed. You can edit the text below and analyze it manually.")
      toast({
        variant: "destructive",
        title: "Transcription failed",
        description: "You can edit the text below and analyze it manually.",
      })
    } finally {
      setIsTranscribing(false)
    }
  }

  const analyzeTranscript = async () => {
    if (!transcript || transcript.trim().length < 10) {
      setError("Please provide at least 10 characters for analysis.")
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      const response = await fetch("/api/analyze-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: transcript }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed")
      }

      if (data.success) {
        setAnalysisResults(data)
        setShowResults(true)
        toast({
          title: "Analysis complete",
          description: "Your Spiral Dynamics profile is ready!",
        })
      } else {
        throw new Error("Analysis was not successful")
      }
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

  const playAudio = () => {
    if (audioRef.current && audioUrl) {
      audioRef.current.src = audioUrl
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const resetRecording = () => {
    setTranscript("")
    setAudioBlob(null)
    setAudioUrl(null)
    setAnalysisResults(null)
    setShowResults(false)
    setError(null)
    setRecordingTime(0)
    setIsPlaying(false)
  }

  // Show results if analysis is complete
  if (showResults && analysisResults) {
    return <SpiralDynamicsResults analysisData={analysisResults} onNewAnalysis={resetRecording} />
  }

  return (
    <div className="space-y-6">
      {/* Hidden audio element */}
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} className="hidden" />

      {/* Recording Card */}
      <Card>
        <CardHeader>
          <CardTitle>Voice Recording</CardTitle>
          <CardDescription>
            {isRecording
              ? "Recording in progress... speak clearly about your thoughts or feelings"
              : isTranscribing
                ? "Converting your speech to text..."
                : "Click the microphone to start recording your voice"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-6">
            {/* Recording Timer */}
            <div className="text-center">
              {isRecording ? (
                <div className="animate-pulse text-red-500 font-medium text-lg">
                  Recording: {formatTime(recordingTime)}
                </div>
              ) : recordingTime > 0 ? (
                <div className="text-muted-foreground">Recorded: {formatTime(recordingTime)}</div>
              ) : (
                <div className="h-7"></div>
              )}
            </div>

            {/* Recording Button */}
            <div className="flex justify-center">
              {isRecording ? (
                <Button
                  onClick={stopRecording}
                  size="lg"
                  variant="destructive"
                  className="rounded-full p-8 h-20 w-20"
                  disabled={isTranscribing || isAnalyzing}
                >
                  <Square className="h-8 w-8" />
                </Button>
              ) : (
                <Button
                  onClick={startRecording}
                  size="lg"
                  className="rounded-full p-8 h-20 w-20"
                  disabled={isTranscribing || isAnalyzing}
                >
                  <Mic className="h-8 w-8" />
                </Button>
              )}
            </div>

            {/* Audio Playback Controls */}
            {audioUrl && !isRecording && (
              <div className="flex items-center gap-2">
                <Button onClick={isPlaying ? pauseAudio : playAudio} variant="outline" size="sm">
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <span className="text-sm text-muted-foreground">{isPlaying ? "Playing" : "Play recording"}</span>
              </div>
            )}

            {/* Status Messages */}
            {isTranscribing && (
              <div className="flex items-center justify-center space-x-2 text-blue-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Converting speech to text...</span>
              </div>
            )}

            {isAnalyzing && (
              <div className="flex items-center justify-center space-x-2 text-purple-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Analyzing your speech patterns...</span>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="w-full p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Instructions */}
            <div className="text-center text-sm text-muted-foreground max-w-md">
              <p>
                {isRecording
                  ? "Speak for at least 15 seconds about your thoughts, feelings, or current situation for the best analysis."
                  : "For best results, speak for at least 15 seconds about your current thoughts, challenges, or perspective on life."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transcript Editing */}
      {transcript && !showResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Transcript
            </CardTitle>
            <CardDescription>Review and edit the transcript before analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Your speech will appear here..."
                className="min-h-[100px]"
                disabled={isAnalyzing}
              />
              <div className="flex gap-2">
                <Button
                  onClick={analyzeTranscript}
                  disabled={isAnalyzing || transcript.trim().length < 10}
                  className="flex-1"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Analyze Text"
                  )}
                </Button>
                <Button onClick={resetRecording} variant="outline" disabled={isAnalyzing}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
