"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Calendar, TrendingUp } from "lucide-react"

interface EvolutionTrackerProps {
  compact?: boolean
}

interface DataPoint {
  date: string
  beige: number
  purple: number
  red: number
  blue: number
  orange: number
  green: number
  yellow: number
  turquoise: number
  [key: string]: string | number
}

export function EvolutionTracker({ compact = false }: EvolutionTrackerProps) {
  const [data, setData] = useState<DataPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("chart")
  const [timeRange, setTimeRange] = useState("month")

  useEffect(() => {
    fetchData()
  }, [timeRange])

  const fetchData = async () => {
    setIsLoading(true)

    try {
      // In a real app, this would fetch data from an API
      // For now, we'll generate some sample data
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const sampleData = generateSampleData(timeRange)
      setData(sampleData)
    } catch (error) {
      console.error("Error fetching evolution data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateSampleData = (range: string): DataPoint[] => {
    const data: DataPoint[] = []
    let days = 30

    if (range === "week") {
      days = 7
    } else if (range === "year") {
      days = 12 // We'll use months instead of days for year view
    }

    for (let i = 0; i < days; i++) {
      const date = new Date()

      if (range === "year") {
        date.setMonth(date.getMonth() - (days - i - 1))
        data.push({
          date: date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
          beige: Math.round(Math.random() * 10),
          purple: Math.round(Math.random() * 15),
          red: Math.round(Math.random() * 20),
          blue: 30 + Math.round(Math.random() * 15), // Make blue dominant
          orange: 15 + Math.round(Math.random() * 15),
          green: 10 + Math.round(Math.random() * 15),
          yellow: 5 + Math.round(Math.random() * 10),
          turquoise: Math.round(Math.random() * 10),
        })
      } else {
        date.setDate(date.getDate() - (days - i - 1))
        data.push({
          date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          beige: Math.round(Math.random() * 10),
          purple: Math.round(Math.random() * 15),
          red: Math.round(Math.random() * 20),
          blue: 30 + Math.round(Math.random() * 15), // Make blue dominant
          orange: 15 + Math.round(Math.random() * 15),
          green: 10 + Math.round(Math.random() * 15),
          yellow: 5 + Math.round(Math.random() * 10),
          turquoise: Math.round(Math.random() * 10),
        })
      }
    }

    return data
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "beige":
        return "#E8D0AA"
      case "purple":
        return "#9B59B6"
      case "red":
        return "#E74C3C"
      case "blue":
        return "#3498DB"
      case "orange":
        return "#F39C12"
      case "green":
        return "#2ECC71"
      case "yellow":
        return "#F1C40F"
      case "turquoise":
        return "#1ABC9C"
      default:
        return "#95A5A6"
    }
  }

  const getStageLabel = (stage: string) => {
    return stage.charAt(0).toUpperCase() + stage.slice(1)
  }

  const getLatestTrend = () => {
    if (data.length < 2) return null

    const stages = ["beige", "purple", "red", "blue", "orange", "green", "yellow", "turquoise"]
    const trends: { stage: string; change: number }[] = []

    stages.forEach((stage) => {
      const latest = data[data.length - 1][stage] as number
      const previous = data[data.length - 2][stage] as number
      const change = latest - previous

      trends.push({ stage, change })
    })

    // Sort by absolute change to find the most significant trend
    trends.sort((a, b) => Math.abs(b.change) - Math.abs(a.change))

    return trends[0]
  }

  const latestTrend = getLatestTrend()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[300px] w-full" />
      </div>
    )
  }

  return (
    <div className={compact ? "" : "space-y-4"}>
      {!compact && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">Evolution Tracker</h2>
            <p className="text-muted-foreground">Track your development through Spiral Dynamics stages over time</p>
          </div>

          <Tabs defaultValue="month" value={timeRange} onValueChange={setTimeRange}>
            <TabsList>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}

      <Tabs defaultValue="chart" value={activeTab} onValueChange={setActiveTab} className="w-full">
        {!compact && (
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="chart">Chart View</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>
        )}

        <TabsContent value="chart" className="mt-0">
          <Card>
            <CardHeader className={compact ? "pb-2" : ""}>
              {compact ? (
                <div className="flex justify-between items-center">
                  <CardTitle>Evolution Tracker</CardTitle>
                  <Tabs defaultValue="month" value={timeRange} onValueChange={setTimeRange}>
                    <TabsList className="h-8">
                      <TabsTrigger value="week" className="text-xs px-2">
                        Week
                      </TabsTrigger>
                      <TabsTrigger value="month" className="text-xs px-2">
                        Month
                      </TabsTrigger>
                      <TabsTrigger value="year" className="text-xs px-2">
                        Year
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              ) : (
                <>
                  <CardTitle>Stage Evolution Over Time</CardTitle>
                  <CardDescription>Track how your Spiral Dynamics profile changes over time</CardDescription>
                </>
              )}
            </CardHeader>
            <CardContent>
              <div className={compact ? "h-[200px]" : "h-[300px]"}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data}
                    margin={{
                      top: 5,
                      right: 10,
                      left: -20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: compact ? 10 : 12 }}
                      axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: compact ? 10 : 12 }}
                      axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                      tickLine={false}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(30,30,45,0.9)",
                        borderColor: "rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                      }}
                    />
                    {!compact && <Legend />}

                    {["blue", "orange", "green", "yellow"].map((stage) => (
                      <Line
                        key={stage}
                        type="monotone"
                        dataKey={stage}
                        stroke={getStageColor(stage)}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                        name={getStageLabel(stage)}
                      />
                    ))}

                    {compact &&
                      ["beige", "purple", "red", "turquoise"].map((stage) => (
                        <Line
                          key={stage}
                          type="monotone"
                          dataKey={stage}
                          stroke={getStageColor(stage)}
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                          name={getStageLabel(stage)}
                        />
                      ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Evolution Insights</CardTitle>
              <CardDescription>Key trends and patterns in your development</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {latestTrend && (
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">Latest Trend</h3>
                  </div>
                  <p className="text-sm">
                    Your{" "}
                    <span style={{ color: getStageColor(latestTrend.stage) }}>{getStageLabel(latestTrend.stage)}</span>{" "}
                    stage has
                    {latestTrend.change > 0 ? " increased" : " decreased"} by {Math.abs(latestTrend.change)} points in
                    your most recent analysis.
                  </p>
                </div>
              )}

              <div className="p-4 bg-secondary/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">Development Timeline</h3>
                </div>
                <div className="space-y-3">
                  {data
                    .slice(-3)
                    .reverse()
                    .map((point, index) => {
                      // Find the dominant stage for this data point
                      const stages = ["beige", "purple", "red", "blue", "orange", "green", "yellow", "turquoise"]
                      let dominantStage = stages[0]
                      let maxValue = point[dominantStage] as number

                      stages.forEach((stage) => {
                        const value = point[stage] as number
                        if (value > maxValue) {
                          maxValue = value
                          dominantStage = stage
                        }
                      })

                      return (
                        <div key={index} className="flex items-start gap-3">
                          <Badge variant="outline" className="mt-1">
                            {point.date}
                          </Badge>
                          <div>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: getStageColor(dominantStage) }}
                              />
                              <span className="font-medium">{getStageLabel(dominantStage)} dominant</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {dominantStage === "blue"
                                ? "Focus on order, purpose, and meaning in your thinking."
                                : dominantStage === "orange"
                                  ? "Achievement and strategic thinking are prominent."
                                  : dominantStage === "green"
                                    ? "Community values and egalitarian thinking are strong."
                                    : "Adaptive and flexible thinking patterns detected."}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
