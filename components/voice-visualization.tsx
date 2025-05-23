"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface VoiceVisualizationProps {
  isRecording: boolean
  audioStream?: MediaStream | null
  className?: string
}

export function VoiceVisualization({ isRecording, audioStream, className }: VoiceVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)
  const [dataArray, setDataArray] = useState<Uint8Array | null>(null)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    if (!audioStream || !isRecording) return

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const analyserNode = audioContext.createAnalyser()
    analyserNode.fftSize = 256
    const bufferLength = analyserNode.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const source = audioContext.createMediaStreamSource(audioStream)
    source.connect(analyserNode)

    setAnalyser(analyserNode)
    setDataArray(dataArray)

    return () => {
      source.disconnect()
      audioContext.close()
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [audioStream, isRecording])

  useEffect(() => {
    if (!analyser || !dataArray || !canvasRef.current || !isRecording) return

    const canvas = canvasRef.current
    const canvasCtx = canvas.getContext("2d")
    if (!canvasCtx) return

    const draw = () => {
      if (!isRecording) return

      animationRef.current = requestAnimationFrame(draw)

      analyser.getByteFrequencyData(dataArray)

      canvasCtx.clearRect(0, 0, canvas.width, canvas.height)

      const barWidth = (canvas.width / dataArray.length) * 2.5
      let barHeight
      let x = 0

      for (let i = 0; i < dataArray.length; i++) {
        barHeight = dataArray[i] / 2

        const gradient = canvasCtx.createLinearGradient(0, canvas.height - barHeight / 2, 0, canvas.height)
        gradient.addColorStop(0, "rgba(124, 58, 237, 0.8)")
        gradient.addColorStop(1, "rgba(124, 58, 237, 0.2)")

        canvasCtx.fillStyle = gradient
        canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)

        x += barWidth + 1
      }
    }

    draw()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [analyser, dataArray, isRecording])

  return (
    <div className={cn("w-full h-24 rounded-lg overflow-hidden bg-secondary/50", className)}>
      {isRecording ? (
        <canvas ref={canvasRef} className="w-full h-full" width={1000} height={100} />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="flex space-x-1">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="w-1 bg-primary/30 rounded-full"
                style={{
                  height: `${Math.max(5, Math.random() * 40)}px`,
                  opacity: 0.3 + Math.random() * 0.7,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
