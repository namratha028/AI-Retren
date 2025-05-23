"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, Square, Loader2, FileText, RotateCcw, Play, Pause } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"

interface VoiceToTextExtractorProps {
  onTextExtracted: (text: string) => void
  isProcessing?: boolean
}

export function VoiceToTextExtractor({ onTextExtracted, isProcessing = false }: VoiceToTextExtractorProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [visualizerValues, setVisualizerValues] = useState<number[]>(Array(20).fill(5))

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)
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
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [audioUrl])

  const startRecording = async () => {
    try {
      setError(null)
      setTranscript("")
      setAudioBlob(null)
      setAudioUrl(null)
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

      // Set up audio context for visualizer
      const audioContext = new AudioContext()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 64
      source.connect(analyser)
      analyserRef.current = analyser

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

        // Stop visualizer
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }

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

      // Start visualizer
      updateVisualizer()

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

  const updateVisualizer = () => {
    if (!analyserRef.current) return

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(dataArray)

    // Convert the frequency data to visualizer values
    const values = Array.from({ length: 20 }, (_, i) => {
      const index = Math.floor((i * dataArray.length) / 20)
      // Scale the value between 5 and 50
      return 5 + (dataArray[index] / 255) * 45
    })

    setVisualizerValues(values)
    animationFrameRef.current = requestAnimationFrame(updateVisualizer)
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
    setError(null)
    setRecordingTime(0)
    setIsPlaying(false)
  }

  const handleSubmitText = () => {
    if (transcript.trim().length < 10) {
      setError("Please provide at least 10 characters for analysis.")
      return
    }
    onTextExtracted(transcript)
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
            {/* Visualizer */}
            <div className="flex items-end justify-center h-16 gap-1 mb-2 w-full">
              {isRecording ? (
                visualizerValues.map((value, index) => (
                  <div
                    key={index}
                    className="w-1.5 bg-primary rounded-full transition-all duration-50 ease-in-out"
                    style={{
                      height: `${value}%`,
                      opacity: value / 100 + 0.3,
                    }}
                  />
                ))
              ) : audioUrl ? (
                <div className="text-center">
                  <span className="text-sm font-medium text-muted-foreground">
                    Recording complete - {formatTime(recordingTime)}
                  </span>
                </div>
              ) : (
                <div className="text-center">
                  <span className="text-sm font-medium text-muted-foreground">
                    Tap the microphone to start recording
                  </span>
                </div>
              )}
            </div>

            {/* Recording Timer */}
            <div className="text-center">
              {isRecording && (
                <div className="animate-pulse text-red-500 font-medium text-lg">
                  Recording: {formatTime(recordingTime)}
                </div>
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
                  disabled={isTranscribing}
                >
                  <Square className="h-8 w-8" />
                </Button>
              ) : (
                <Button
                  onClick={startRecording}
                  size="lg"
                  className="rounded-full p-8 h-20 w-20"
                  disabled={isTranscribing || isProcessing}
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
              <div className="w-full">
                <div className="flex items-center justify-center space-x-2 text-blue-600 mb-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Converting speech to text...</span>
                </div>
                <Progress value={45} className="h-1" />
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="w-full p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transcript Editing */}
      {transcript && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Transcript
            </CardTitle>
            <CardDescription>Review and edit the transcript before analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Your speech will appear here..."
              className="min-h-[100px]"
              disabled={isProcessing}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={resetRecording} disabled={isProcessing}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button onClick={handleSubmitText} disabled={isProcessing || transcript.trim().length < 10}>
              {isProcessing ? (
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
