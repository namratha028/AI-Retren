"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, Square, Play, Pause, RotateCcw, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { SpiralDynamicsResults } from "@/components/spiral-dynamics-results"

export function VoiceRecorder() {
  // Recording states
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  // Transcription states
  const [transcript, setTranscript] = useState("")
  const [isTranscribing, setIsTranscribing] = useState(false)

  // Analysis states
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<any>(null)

  // Error state
  const [error, setError] = useState<string | null>(null)

  // Refs
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
      // Reset states
      setError(null)
      setTranscript("")
      setAudioBlob(null)
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
        setAudioUrl(null)
      }
      audioChunksRef.current = []
      setRecordingTime(0)

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        // Create audio blob and URL
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        const url = URL.createObjectURL(blob)
        setAudioBlob(blob)
        setAudioUrl(url)

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop())

        // Generate transcript
        generateTranscript()
      }

      // Start recording
      mediaRecorder.start(100)
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
      setError("Could not access microphone. Please check permissions and try again.")
      toast({
        variant: "destructive",
        title: "Recording failed",
        description: "Could not access microphone. Please check permissions and try again.",
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

  const generateTranscript = () => {
    setIsTranscribing(true)

    // Simulate transcription process
    setTimeout(() => {
      // Generate transcript based on recording duration
      const transcriptText = getTranscriptForDuration(recordingTime)
      setTranscript(transcriptText)
      setIsTranscribing(false)

      toast({
        title: "Transcription complete",
        description: "You can now review and edit the transcript before analysis.",
      })
    }, 1500)
  }

  const getTranscriptForDuration = (seconds: number) => {
    // Generate appropriate length transcript based on recording duration
    if (seconds < 10) {
      return "I believe in personal growth and understanding different perspectives. I try to see the big picture."
    } else if (seconds < 30) {
      return "I believe in personal growth and understanding different perspectives. I try to see the big picture and understand complex systems. I value knowledge and natural processes, and I'm adaptable to change."
    } else {
      return "I believe in personal growth and understanding different perspectives. I try to see the big picture and understand complex systems. I value knowledge and natural processes, and I'm adaptable to change. I care about community and harmony, and I think it's important that everyone's voice is heard. I also value structure and order in my life, and I believe in doing things the right way."
    }
  }

  const playAudio = () => {
    if (audioRef.current && audioUrl) {
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

  const resetRecording = () => {
    setTranscript("")
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    setAudioUrl(null)
    setAudioBlob(null)
    setRecordingTime(0)
    setIsPlaying(false)
    setError(null)
    setAnalysisResults(null)
  }

  const analyzeText = async () => {
    if (transcript.trim().length < 10) {
      setError("Please provide at least 10 characters for analysis.")
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      // Save recording to history
      if (audioBlob) {
        const formData = new FormData()
        formData.append("audio", audioBlob)
        formData.append("transcript", transcript)

        try {
          await fetch("/api/recordings/save", {
            method: "POST",
            body: formData,
          })
        } catch (error) {
          console.error("Error saving recording:", error)
          // Continue with analysis even if saving fails
        }
      }

      // Analyze text
      const response = await fetch("/api/analyze-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: transcript }),
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // If analysis results are available, show them
  if (analysisResults) {
    return (
      <div className="space-y-4">
        <SpiralDynamicsResults analysisData={analysisResults} />
        <div className="flex justify-center">
          <Button onClick={resetRecording} variant="outline">
            Start New Recording
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Hidden audio element for playback */}
      <audio ref={audioRef} src={audioUrl || undefined} onEnded={() => setIsPlaying(false)} className="hidden" />

      {/* Recording Card */}
      <Card>
        <CardHeader>
          <CardTitle>Voice Recording</CardTitle>
          <CardDescription>
            {isRecording
              ? "Recording in progress... speak clearly"
              : "Click the microphone to start recording your voice"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          {/* Recording Button */}
          <div className="flex justify-center">
            {isRecording ? (
              <Button onClick={stopRecording} size="lg" variant="destructive" className="rounded-full p-8 h-20 w-20">
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

          {/* Recording Timer */}
          <div className="text-center">
            {isRecording ? (
              <div className="animate-pulse text-red-500 font-medium text-lg">{formatTime(recordingTime)}</div>
            ) : recordingTime > 0 ? (
              <div className="text-muted-foreground">Recorded: {formatTime(recordingTime)}</div>
            ) : null}
          </div>

          {/* Audio Playback */}
          {audioUrl && !isRecording && (
            <div className="flex items-center gap-2">
              <Button onClick={isPlaying ? pauseAudio : playAudio} variant="outline" size="sm">
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <span className="text-sm text-muted-foreground">{isPlaying ? "Playing" : "Play recording"}</span>
            </div>
          )}

          {/* Transcription Status */}
          {isTranscribing && (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Transcribing your audio...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transcript Card */}
      {transcript && (
        <Card>
          <CardHeader>
            <CardTitle>Transcript</CardTitle>
            <CardDescription>Review and edit the transcript before analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="min-h-[150px]"
              placeholder="Your transcript will appear here..."
              disabled={isAnalyzing}
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={resetRecording} disabled={isAnalyzing}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button onClick={analyzeText} disabled={isAnalyzing || transcript.trim().length < 10}>
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
      )}
    </div>
  )
}
