"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, Square, Loader2, Save, Trash2, Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { VoiceVisualization } from "@/components/voice-visualization"
import { cn } from "@/lib/utils"

interface EnhancedVoiceRecorderProps {
  onSave?: (audioBlob: Blob) => void
  className?: string
}

export function EnhancedVoiceRecorder({ onSave, className }: EnhancedVoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
      if (audioStream) {
        audioStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [audioUrl, audioStream])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setAudioStream(stream)

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        const audioUrl = URL.createObjectURL(audioBlob)
        setAudioBlob(audioBlob)
        setAudioUrl(audioUrl)

        if (audioRef.current) {
          audioRef.current.src = audioUrl
        }

        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setIsPaused(false)
      setAudioBlob(null)
      setAudioUrl(null)

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error("Error accessing microphone:", error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const togglePause = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        timerRef.current = setInterval(() => {
          setRecordingTime((prev) => prev + 1)
        }, 1000)
      } else {
        mediaRecorderRef.current.pause()
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }
      }
      setIsPaused(!isPaused)
    }
  }

  const handleSave = async () => {
    if (!audioBlob) return

    setIsProcessing(true)

    try {
      if (onSave) {
        await onSave(audioBlob)
      }

      // Reset after saving
      setAudioBlob(null)
      setAudioUrl(null)
      setRecordingTime(0)
    } catch (error) {
      console.error("Error saving recording:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReset = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }

    setAudioBlob(null)
    setAudioUrl(null)
    setRecordingTime(0)
    setIsPlaying(false)

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }

  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }

    setIsPlaying(!isPlaying)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  useEffect(() => {
    const audioElement = audioRef.current

    if (audioElement) {
      const handleEnded = () => setIsPlaying(false)
      audioElement.addEventListener("ended", handleEnded)

      return () => {
        audioElement.removeEventListener("ended", handleEnded)
      }
    }
  }, [])

  return (
    <Card className={cn("shadow-lg border-border/50 overflow-hidden", className)}>
      <CardHeader className="bg-gradient-to-r from-primary/20 to-primary/5 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5 text-primary" />
          Voice Recorder
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <VoiceVisualization isRecording={isRecording} audioStream={audioStream} className="animate-fade-in" />

        <div className="flex justify-center items-center h-10">
          {isRecording ? (
            <div className="text-xl font-mono font-semibold animate-pulse-subtle">{formatTime(recordingTime)}</div>
          ) : audioUrl ? (
            <audio ref={audioRef} src={audioUrl} className="hidden" />
          ) : (
            <div className="text-muted-foreground text-sm">Ready to record</div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t border-border/50 p-4 bg-secondary/20">
        {isRecording ? (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={togglePause}
              className={cn(
                "rounded-full transition-all duration-300",
                isPaused ? "bg-primary/20 text-primary" : "bg-secondary",
              )}
            >
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </Button>
            <Button variant="destructive" size="icon" onClick={stopRecording} className="rounded-full">
              <Square className="h-4 w-4" />
            </Button>
          </>
        ) : audioBlob ? (
          <>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={togglePlayback} className="rounded-full">
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="icon" onClick={handleReset} className="rounded-full text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Button
              onClick={handleSave}
              className="rounded-full bg-primary hover:bg-primary/90"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Recording
                </>
              )}
            </Button>
          </>
        ) : (
          <Button onClick={startRecording} className="mx-auto rounded-full bg-primary hover:bg-primary/90 px-6">
            <Mic className="mr-2 h-4 w-4" />
            Start Recording
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
