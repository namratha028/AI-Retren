"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mic, BarChart3, Target, BookOpen, TrendingUp, Calendar, AlertCircle, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

interface DashboardData {
  recentAnalysis?: {
    dominantColor: string
    colorName: string
    timestamp: string
  }
  stats?: {
    totalRecordings: number
    totalAnalyses: number
    currentStreak: number
  }
  progress?: {
    currentStage: string
    targetStage: string
    progressPercentage: number
  }
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Simulate loading dashboard data
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock data - in a real app, this would come from APIs
      const mockData: DashboardData = {
        recentAnalysis: {
          dominantColor: "blue",
          colorName: "Blue - Order",
          timestamp: new Date().toISOString(),
        },
        stats: {
          totalRecordings: 12,
          totalAnalyses: 8,
          currentStreak: 3,
        },
        progress: {
          currentStage: "Blue",
          targetStage: "Orange",
          progressPercentage: 65,
        },
      }

      setData(mockData)
    } catch (error) {
      console.error("Error loading dashboard data:", error)
      setError("Failed to load dashboard data")
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetry = () => {
    loadDashboardData()
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Dashboard Error</CardTitle>
            <CardDescription>Unable to load dashboard data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleRetry} className="w-full" variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                <div className="h-4 w-4 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
                <div className="h-3 w-24 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recordings</CardTitle>
            <Mic className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats?.totalRecordings || 0}</div>
            <p className="text-xs text-muted-foreground">Voice recordings captured</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analyses</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats?.totalAnalyses || 0}</div>
            <p className="text-xs text-muted-foreground">Spiral Dynamics profiles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats?.currentStreak || 0}</div>
            <p className="text-xs text-muted-foreground">Days of consistent practice</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.progress?.progressPercentage || 0}%</div>
            <p className="text-xs text-muted-foreground">Toward target stage</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Recent Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Latest Analysis</CardTitle>
                <CardDescription>Your most recent Spiral Dynamics profile</CardDescription>
              </CardHeader>
              <CardContent>
                {data.recentAnalysis ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: getSpiralColor(data.recentAnalysis.dominantColor) }}
                      />
                      <span className="font-medium">{data.recentAnalysis.colorName}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Analyzed {new Date(data.recentAnalysis.timestamp).toLocaleDateString()}
                    </p>
                    <Button variant="outline" size="sm" onClick={() => router.push("/insights")}>
                      View Details
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-4">No analyses yet</p>
                    <Button onClick={() => router.push("/voice")}>
                      <Mic className="mr-2 h-4 w-4" />
                      Start Recording
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={() => router.push("/voice")}>
                  <Mic className="mr-2 h-4 w-4" />
                  New Voice Recording
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => router.push("/practices")}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Browse Practices
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push("/transformation")}
                >
                  <Target className="mr-2 h-4 w-4" />
                  Set Goals
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => router.push("/history")}>
                  <Calendar className="mr-2 h-4 w-4" />
                  View History
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest recordings and analyses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No recent activity</p>
                <p className="text-sm">Start by recording your voice to see activity here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Development Progress</CardTitle>
              <CardDescription>Track your journey through the Spiral Dynamics stages</CardDescription>
            </CardHeader>
            <CardContent>
              {data.progress ? (
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Current: {data.progress.currentStage}</span>
                    <span>Target: {data.progress.targetStage}</span>
                  </div>
                  <Progress value={data.progress.progressPercentage} className="w-full" />
                  <p className="text-sm text-muted-foreground">
                    {data.progress.progressPercentage}% progress toward your target stage
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No progress data available</p>
                  <p className="text-sm">Complete an analysis to start tracking progress</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function getSpiralColor(colorName: string): string {
  const colors: Record<string, string> = {
    beige: "#E8D0AA",
    purple: "#9B59B6",
    red: "#E74C3C",
    blue: "#3498DB",
    orange: "#F39C12",
    green: "#2ECC71",
    yellow: "#F1C40F",
    turquoise: "#1ABC9C",
  }
  return colors[colorName.toLowerCase()] || "#6B7280"
}
