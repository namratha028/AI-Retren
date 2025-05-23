"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, Trash2, Play, Pause, BarChart2, FileText, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Recording {
  _id: string
  title: string
  transcript: string
  createdAt: string
  duration: number
  analysis?: {
    beige: number
    purple: number
    red: number
    blue: number
    orange: number
    green: number
    yellow: number
    turquoise: number
  }
}

interface RecordingHistoryProps {
  limit?: number
}

export function RecordingHistory({ limit }: RecordingHistoryProps) {
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentAudio, setCurrentAudio] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)

  useEffect(() => {
    fetchRecordings()
  }, [])

  useEffect(() => {
    // Clean up audio element on unmount
    return () => {
      if (audioElement) {
        audioElement.pause()
        audioElement.src = ""
      }
    }
  }, [audioElement])

  const fetchRecordings = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/recordings/get")
      if (response.ok) {
        const data = await response.json()
        setRecordings(limit ? data.slice(0, limit) : data)
      }
    } catch (error) {
      console.error("Error fetching recordings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const playAudio = async (id: string) => {
    try {
      if (currentAudio === id && audioElement) {
        if (isPlaying) {
          audioElement.pause()
          setIsPlaying(false)
        } else {
          audioElement.play()
          setIsPlaying(true)
        }
        return
      }

      if (audioElement) {
        audioElement.pause()
        audioElement.src = ""
      }

      const response = await fetch(`/api/recordings/audio/${id}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const audio = new Audio(url)

        audio.onended = () => {
          setIsPlaying(false)
        }

        audio.onpause = () => {
          setIsPlaying(false)
        }

        audio.play()
        setAudioElement(audio)
        setCurrentAudio(id)
        setIsPlaying(true)
      }
    } catch (error) {
      console.error("Error playing audio:", error)
    }
  }

  const deleteRecording = async (id: string) => {
    if (!confirm("Are you sure you want to delete this recording?")) return

    try {
      const response = await fetch(`/api/recordings/delete/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setRecordings(recordings.filter((rec) => rec._id !== id))
        if (currentAudio === id && audioElement) {
          audioElement.pause()
          audioElement.src = ""
          setCurrentAudio(null)
          setIsPlaying(false)
        }
      }
    } catch (error) {
      console.error("Error deleting recording:", error)
    }
  }

  // Function to get the dominant value color
  const getDominantValueColor = (analysis: any) => {
    if (!analysis) return "spiral-purple"

    const values = [
      { name: "beige", value: analysis.beige },
      { name: "purple", value: analysis.purple },
      { name: "red", value: analysis.red },
      { name: "blue", value: analysis.blue },
      { name: "orange", value: analysis.orange },
      { name: "green", value: analysis.green },
      { name: "yellow", value: analysis.yellow },
      { name: "turquoise", value: analysis.turquoise },
    ]

    const dominant = values.reduce((max, obj) => (obj.value > max.value ? obj : max), values[0])
    return `spiral-${dominant.name}`
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(limit || 3)].map((_, i) => (
          <Card key={i} className="bg-card-premium overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[150px]" />
                </div>
                <div className="flex space-x-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (recordings.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No recordings found. Start by recording your voice.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Accordion type="multiple" className="space-y-4">
        {recordings.map((recording) => (
          <AccordionItem key={recording._id} value={recording._id} className="border-0 overflow-hidden">
            <Card
              className={cn(
                "bg-card-premium transition-all duration-300 hover:shadow-md",
                currentAudio === recording._id && "border-primary/50",
              )}
            >
              <div className="flex items-center p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        `bg-spiral-${getDominantValueColor(recording.analysis).split("-")[1]}`,
                      )}
                    />
                    <h3 className="font-medium truncate">{recording.title || "Untitled Recording"}</h3>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span className="mr-3">{formatDate(recording.createdAt)}</span>
                    <Clock className="h-3 w-3 mr-1" />
                    <span className="mr-3">{formatTime(recording.createdAt)}</span>
                    <span>{formatDuration(recording.duration)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation()
                      playAudio(recording._id)
                    }}
                  >
                    {currentAudio === recording._id && isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-8 w-8 text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteRecording(recording._id)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <AccordionTrigger className="p-0 hover:no-underline">
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </AccordionTrigger>
                </div>
              </div>
              <AccordionContent>
                <div className="px-4 pb-4 pt-0">
                  <div className="bg-secondary/50 rounded-lg p-3 mb-3">
                    <div className="flex items-center mb-2">
                      <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm font-medium">Transcript</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{recording.transcript || "No transcript available"}</p>
                  </div>

                  {recording.analysis && (
                    <div className="bg-secondary/50 rounded-lg p-3">
                      <div className="flex items-center mb-2">
                        <BarChart2 className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm font-medium">Analysis</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(recording.analysis).map(([key, value]) => (
                          <Badge
                            key={key}
                            variant="outline"
                            className={cn(
                              "bg-secondary/80 text-xs",
                              value > 20 && `border-spiral-${key} text-spiral-${key}`,
                            )}
                          >
                            {key}: {Math.round(value)}%
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </Card>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
