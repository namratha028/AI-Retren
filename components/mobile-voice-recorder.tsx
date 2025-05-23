"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Square } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface MobileVoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void
}

export function MobileVoiceRecorder({ onRecordingComplete }: MobileVoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  const startRecording = async () => {
    try {
      // Reset state
      audioChunksRef.current = []
      setRecordingTime(0)

      // Request microphone permission explicitly
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Create media recorder with basic options for maximum compatibility
      const options = { mimeType: "audio/webm" }
      const mediaRecorder = new MediaRecorder(stream, options)
      mediaRecorderRef.current = mediaRecorder

      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        // Create audio blob
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop())

        // Call the callback
        onRecordingComplete(audioBlob)
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="text-center">
        {isRecording && (
          <div className="animate-pulse text-red-500 font-medium">Recording: {formatTime(recordingTime)}</div>
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
            aria-label="Start recording"
          >
            <Mic className="h-6 w-6" />
          </Button>
        )}
      </div>
    </div>
  )
}
