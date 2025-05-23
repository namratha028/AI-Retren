"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, Square, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { analyzeText } from "@/lib/spiral-dynamics-analyzer"

export function VoiceCapture({ onAnalysisComplete }: { onAnalysisComplete: (results: any) => void }) {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
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
    }
  }, [])

  const startRecording = async () => {
    try {
      // Reset state
      setTranscript("")
      setAudioBlob(null)
      audioChunksRef.current = []
      setRecordingTime(0)

      // Request microphone permission explicitly
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

      mediaRecorder.onstop = async () => {
        // Create audio blob
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        setAudioBlob(audioBlob)

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop())

        // Transcribe audio using Whisper API
        await transcribeAudio(audioBlob)
      }

      // Start recording
      mediaRecorder.start(1000) // Get data every second
      setIsRecording(true)

      // Start timer
      let seconds = 0
      timerRef.current = setInterval(() => {
        seconds++
        setRecordingTime(seconds)
      }, 1000)

      toast({
        title: "Recording started",
        description: "Speak clearly into your microphone",
      })
    } catch (error) {
      console.error("Error starting recording:", error)
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

      // Clear timer
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
    try {
      toast({
        title: "Transcribing",
        description: "Converting your speech to text...",
      })

      // Create form data for API request
      const formData = new FormData()
      formData.append("audio", audioBlob)

      // Send to Whisper API endpoint
      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.statusText}`)
      }

      const data = await response.json()
      setTranscript(data.text)

      // Analyze the transcript
      analyzeTranscript(data.text)
    } catch (error) {
      console.error("Transcription error:", error)
      toast({
        variant: "destructive",
        title: "Transcription failed",
        description: "Could not transcribe your audio. Please try again.",
      })
    }
  }

  const analyzeTranscript = async (text: string) => {
    if (!text || text.trim() === "") {
      toast({
        variant: "destructive",
        title: "Empty transcript",
        description: "No speech was detected. Please try again and speak clearly.",
      })
      return
    }

    setIsAnalyzing(true)

    try {
      // Analyze the text
      const results = await analyzeText(text)

      // Save the recording and analysis
      await saveRecording(text, results)

      // Call the callback with results
      onAnalysisComplete(results)

      toast({
        title: "Analysis complete",
        description: "Your speech has been analyzed successfully.",
      })
    } catch (error) {
      console.error("Analysis error:", error)
      toast({
        variant: "destructive",
        title: "Analysis failed",
        description: "Could not analyze your speech. Please try again.",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const saveRecording = async (text: string, analysisResults: any) => {
    try {
      if (!audioBlob) {
        throw new Error("No audio recording available")
      }

      // Create form data
      const formData = new FormData()
      formData.append("transcript", text)
      formData.append("duration", recordingTime.toString())
      formData.append("timestamp", new Date().toISOString())
      formData.append("audio", audioBlob)

      // Send to API
      const response = await fetch("/api/recordings/save", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Failed to save recording: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Recording saved successfully:", data)

      toast({
        title: "Recording saved",
        description: "Your voice recording and analysis have been saved.",
      })
    } catch (error) {
      console.error("Error saving recording:", error)
      toast({
        variant: "destructive",
        title: "Error saving recording",
        description: "Your analysis is available but we couldn't save the recording.",
      })
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Voice Capture</CardTitle>
        <CardDescription>
          Speak freely about your thoughts, feelings, or a situation you're dealing with
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          <div className="text-center">
            {isRecording ? (
              <div className="animate-pulse text-red-500 font-medium">Recording: {formatTime(recordingTime)}</div>
            ) : (
              <div className="h-6"></div> // Placeholder to prevent layout shift
            )}
          </div>

          <div className="flex justify-center">
            {isRecording ? (
              <Button
                type="button"
                onClick={stopRecording}
                size="lg"
                variant="destructive"
                className="rounded-full p-6 cursor-pointer"
                aria-label="Stop recording"
              >
                <Square className="h-6 w-6" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={startRecording}
                size="lg"
                variant="default"
                className="rounded-full p-6 cursor-pointer"
                disabled={isAnalyzing}
                aria-label="Start recording"
              >
                <Mic className="h-6 w-6" />
              </Button>
            )}
          </div>

          {transcript && (
            <div className="w-full mt-4 p-4 bg-muted rounded-md">
              <h3 className="font-medium mb-2">Transcript:</h3>
              <p className="text-sm">{transcript}</p>
            </div>
          )}

          {isAnalyzing && (
            <div className="flex items-center justify-center space-x-2 mt-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Analyzing your speech...</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-xs text-muted-foreground">
          {isRecording ? "Click the square button to stop recording" : "Click the microphone button to start recording"}
        </p>
      </CardFooter>
    </Card>
  )
}
