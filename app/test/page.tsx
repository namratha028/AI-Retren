"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

export default function TestPage() {
  const [dbStatus, setDbStatus] = useState<string>("Not tested")
  const [recordingStatus, setRecordingStatus] = useState<string>("Not tested")
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const { toast } = useToast()

  const testDbConnection = async () => {
    try {
      setDbStatus("Testing...")
      const response = await fetch("/api/test-db")
      const data = await response.json()

      if (response.ok) {
        setDbStatus(`Success! Found ${data.recordingsCount} recordings.`)
      } else {
        setDbStatus(`Error: ${data.message}`)
      }
    } catch (error) {
      setDbStatus(`Error: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const startRecording = async () => {
    try {
      setRecordingStatus("Starting recording...")

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream)
      const audioChunks: Blob[] = []

      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" })
        setAudioBlob(audioBlob)

        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)

        setRecordingStatus(`Recording stopped. Audio size: ${audioBlob.size} bytes`)
        setIsRecording(false)

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop())
      }

      // Start recording
      mediaRecorder.start()
      setIsRecording(true)
      setRecordingStatus("Recording in progress...")

      // Automatically stop after 5 seconds
      setTimeout(() => {
        if (mediaRecorder.state !== "inactive") {
          mediaRecorder.stop()
        }
      }, 5000)
    } catch (error) {
      setRecordingStatus(`Error: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const saveRecording = async () => {
    if (!audioBlob) {
      setRecordingStatus("No recording to save")
      return
    }

    try {
      setRecordingStatus("Saving recording...")

      // Create form data
      const formData = new FormData()
      formData.append("audio", audioBlob, "test-recording.webm")
      formData.append("transcript", "This is a test recording")
      formData.append("duration", "5")
      formData.append("timestamp", new Date().toISOString())

      // Send to API
      const response = await fetch("/api/recordings/save", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setRecordingStatus(`Recording saved successfully! ID: ${data.recordingId}`)
        toast({
          title: "Success",
          description: "Recording saved to database",
        })
      } else {
        setRecordingStatus(`Error saving: ${data.message}`)
      }
    } catch (error) {
      setRecordingStatus(`Error: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Recording Test Page</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Database Connection</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Status: {dbStatus}</p>
            <Button onClick={testDbConnection}>Test Database</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recording Test</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Status: {recordingStatus}</p>
            <div className="flex gap-2">
              <Button onClick={startRecording} disabled={isRecording} variant="default">
                Record 5 Seconds
              </Button>
              <Button onClick={saveRecording} disabled={!audioBlob || isRecording} variant="outline">
                Save Recording
              </Button>
            </div>

            {audioUrl && (
              <div className="mt-4">
                <p className="mb-2">Preview:</p>
                <audio src={audioUrl} controls className="w-full" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
