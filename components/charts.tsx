"use client"

import { useEffect, useRef } from "react"

// Simple placeholder charts for the MVP
// In a real application, you would use a charting library like Chart.js, Recharts, or D3.js

export function LineChart({ data }: { data: any[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set dimensions
    const width = canvas.width
    const height = canvas.height
    const padding = 40

    // Draw axes
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, height - padding)
    ctx.lineTo(width - padding, height - padding)
    ctx.strokeStyle = "#94a3b8"
    ctx.stroke()

    // Draw title
    ctx.font = "14px sans-serif"
    ctx.fillStyle = "#64748b"
    ctx.textAlign = "center"
    ctx.fillText("Color Evolution Over Time", width / 2, 20)

    // If we have data, plot it
    if (data.length > 0) {
      // Get unique colors
      const colors = [...new Set(data.map((entry) => entry.dominantColor))]

      // Create a map of color to y-position
      const colorMap = Object.fromEntries(
        colors.map((color, index) => [color, padding + index * ((height - 2 * padding) / (colors.length - 1 || 1))]),
      )

      // Plot points
      const pointWidth = (width - 2 * padding) / (data.length - 1 || 1)

      ctx.beginPath()
      data.forEach((entry, index) => {
        const x = padding + index * pointWidth
        const y = colorMap[entry.dominantColor] || height - padding

        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }

        // Draw point
        ctx.fillStyle = entry.colorHex
        ctx.beginPath()
        ctx.arc(x, y, 5, 0, Math.PI * 2)
        ctx.fill()
      })

      ctx.strokeStyle = "#94a3b8"
      ctx.stroke()

      // Draw color labels
      ctx.textAlign = "left"
      Object.entries(colorMap).forEach(([color, y]) => {
        const colorData = data.find((entry) => entry.dominantColor === color)
        if (colorData) {
          ctx.fillStyle = colorData.colorHex
          ctx.fillText(colorData.colorName, width - padding + 10, y + 4)
        }
      })
    }
  }, [data])

  return (
    <div className="w-full aspect-[16/9] bg-white dark:bg-slate-900 rounded-md p-4">
      <canvas ref={canvasRef} width={800} height={450} className="w-full h-full" />
    </div>
  )
}

export function BarChart({ data }: { data: any[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set dimensions
    const width = canvas.width
    const height = canvas.height
    const padding = 40

    // Draw axes
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, height - padding)
    ctx.lineTo(width - padding, height - padding)
    ctx.strokeStyle = "#94a3b8"
    ctx.stroke()

    // Draw title
    ctx.font = "14px sans-serif"
    ctx.fillStyle = "#64748b"
    ctx.textAlign = "center"
    ctx.fillText("Color Distribution", width / 2, 20)

    // If we have data, create a bar chart
    if (data.length > 0) {
      // Count occurrences of each color
      const colorCounts: Record<string, { count: number; name: string; hex: string }> = {}

      data.forEach((entry) => {
        if (!colorCounts[entry.dominantColor]) {
          colorCounts[entry.dominantColor] = {
            count: 0,
            name: entry.colorName,
            hex: entry.colorHex,
          }
        }
        colorCounts[entry.dominantColor].count++
      })

      // Draw bars
      const barWidth = (width - 2 * padding) / Object.keys(colorCounts).length
      const maxCount = Math.max(...Object.values(colorCounts).map((c) => c.count))

      Object.entries(colorCounts).forEach(([color, { count, name, hex }], index) => {
        const x = padding + index * barWidth
        const barHeight = ((height - 2 * padding) * count) / maxCount
        const y = height - padding - barHeight

        // Draw bar
        ctx.fillStyle = hex
        ctx.fillRect(x, y, barWidth - 10, barHeight)

        // Draw label
        ctx.fillStyle = "#64748b"
        ctx.textAlign = "center"
        ctx.fillText(name, x + barWidth / 2, height - padding + 20)

        // Draw count
        ctx.fillText(count.toString(), x + barWidth / 2, y - 10)
      })
    }
  }, [data])

  return (
    <div className="w-full aspect-[16/9] bg-white dark:bg-slate-900 rounded-md p-4">
      <canvas ref={canvasRef} width={800} height={450} className="w-full h-full" />
    </div>
  )
}

export function PieChart({ data }: { data: any[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set dimensions
    const width = canvas.width
    const height = canvas.height
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(centerX, centerY) - 60

    // Draw title
    ctx.font = "14px sans-serif"
    ctx.fillStyle = "#64748b"
    ctx.textAlign = "center"
    ctx.fillText("Overall Color Distribution", centerX, 20)

    // If we have data, create a pie chart
    if (data.length > 0) {
      // Count occurrences of each color
      const colorCounts: Record<string, { count: number; name: string; hex: string }> = {}

      data.forEach((entry) => {
        if (!colorCounts[entry.dominantColor]) {
          colorCounts[entry.dominantColor] = {
            count: 0,
            name: entry.colorName,
            hex: entry.colorHex,
          }
        }
        colorCounts[entry.dominantColor].count++
      })

      // Calculate total
      const total = Object.values(colorCounts).reduce((sum, { count }) => sum + count, 0)

      // Draw pie slices
      let startAngle = 0

      Object.entries(colorCounts).forEach(([color, { count, name, hex }], index) => {
        const sliceAngle = (count / total) * 2 * Math.PI
        const endAngle = startAngle + sliceAngle

        // Draw slice
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.arc(centerX, centerY, radius, startAngle, endAngle)
        ctx.closePath()
        ctx.fillStyle = hex
        ctx.fill()

        // Calculate position for label
        const labelAngle = startAngle + sliceAngle / 2
        const labelRadius = radius * 0.7
        const labelX = centerX + Math.cos(labelAngle) * labelRadius
        const labelY = centerY + Math.sin(labelAngle) * labelRadius

        // Draw label
        ctx.fillStyle = "#ffffff"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(name, labelX, labelY)

        // Update start angle for next slice
        startAngle = endAngle
      })

      // Draw legend
      const legendX = width - 150
      const legendY = 60

      Object.entries(colorCounts).forEach(([color, { count, name, hex }], index) => {
        const y = legendY + index * 25

        // Draw color box
        ctx.fillStyle = hex
        ctx.fillRect(legendX, y, 15, 15)

        // Draw label
        ctx.fillStyle = "#64748b"
        ctx.textAlign = "left"
        ctx.textBaseline = "middle"
        ctx.fillText(`${name} (${Math.round((count / total) * 100)}%)`, legendX + 25, y + 7)
      })
    }
  }, [data])

  return (
    <div className="w-full aspect-[16/9] bg-white dark:bg-slate-900 rounded-md p-4">
      <canvas ref={canvasRef} width={800} height={450} className="w-full h-full" />
    </div>
  )
}
