"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, BookOpen, Clock, Filter, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"

interface Practice {
  id: string
  title: string
  description: string
  duration: string
  type: string
  stage: string
  completed: boolean
}

interface PracticeLibraryProps {
  currentStage?: string
}

export function PracticeLibrary({ currentStage = "blue" }: PracticeLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [completedPractices, setCompletedPractices] = useState<string[]>([])

  // Sample practice data - in a real app, this would come from an API
  const practices: Practice[] = [
    {
      id: "p1",
      title: "Mindful Reflection",
      description: "A guided practice to reflect on your values and beliefs with mindfulness.",
      duration: "15 min",
      type: "meditation",
      stage: "blue",
      completed: false,
    },
    {
      id: "p2",
      title: "Perspective Taking",
      description: "Exercise to help you see situations from multiple value systems.",
      duration: "20 min",
      type: "exercise",
      stage: "green",
      completed: false,
    },
    {
      id: "p3",
      title: "Systems Thinking",
      description: "Learn to identify patterns and interconnections in complex situations.",
      duration: "30 min",
      type: "lesson",
      stage: "yellow",
      completed: false,
    },
    {
      id: "p4",
      title: "Value Integration",
      description: "Practice integrating different value systems in your decision making.",
      duration: "25 min",
      type: "exercise",
      stage: "turquoise",
      completed: false,
    },
    {
      id: "p5",
      title: "Order and Structure",
      description: "Exercises to help you create meaningful order and structure in your life.",
      duration: "15 min",
      type: "exercise",
      stage: "blue",
      completed: false,
    },
    {
      id: "p6",
      title: "Purpose Reflection",
      description: "Guided reflection on your sense of purpose and meaning.",
      duration: "10 min",
      type: "meditation",
      stage: "blue",
      completed: false,
    },
  ]

  const handleCompletePractice = (practiceId: string) => {
    if (completedPractices.includes(practiceId)) {
      setCompletedPractices(completedPractices.filter((id) => id !== practiceId))
      toast({
        title: "Practice marked as incomplete",
        description: "You can always come back and complete it later.",
      })
    } else {
      setCompletedPractices([...completedPractices, practiceId])
      toast({
        title: "Practice completed",
        description: "Great job! Keep up the good work.",
      })
    }

    // In a real app, you would save this to the database here
    console.log("Practice completion toggled:", practiceId)
  }

  const filteredPractices = practices.filter((practice) => {
    // Filter by search query
    const matchesSearch =
      practice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      practice.description.toLowerCase().includes(searchQuery.toLowerCase())

    // Filter by tab
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "recommended" && practice.stage === currentStage) ||
      (activeTab === "completed" && completedPractices.includes(practice.id))

    return matchesSearch && matchesTab
  })

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "beige":
        return "bg-amber-700"
      case "purple":
        return "bg-purple-700"
      case "red":
        return "bg-red-600"
      case "blue":
        return "bg-blue-600"
      case "orange":
        return "bg-orange-500"
      case "green":
        return "bg-green-600"
      case "yellow":
        return "bg-yellow-500"
      case "turquoise":
        return "bg-teal-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search practices..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">Filter:</span>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="recommended">Recommended</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {filteredPractices.length === 0 ? (
        <div className="text-center py-8">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
          <h3 className="mt-4 text-lg font-medium">No practices found</h3>
          <p className="mt-2 text-sm text-muted-foreground">Try adjusting your search or filter to find practices.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPractices.map((practice) => (
            <Card key={practice.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{practice.title}</CardTitle>
                    <CardDescription className="mt-1">{practice.description}</CardDescription>
                  </div>
                  <div
                    className={cn("w-3 h-3 rounded-full flex-shrink-0", getStageColor(practice.stage))}
                    title={`${practice.stage.charAt(0).toUpperCase() + practice.stage.slice(1)} stage practice`}
                  />
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{practice.duration}</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Badge variant="outline">{practice.type}</Badge>
                <Button
                  variant={completedPractices.includes(practice.id) ? "default" : "outline"}
                  size="sm"
                  className={completedPractices.includes(practice.id) ? "bg-green-600 hover:bg-green-700" : ""}
                  onClick={() => handleCompletePractice(practice.id)}
                >
                  {completedPractices.includes(practice.id) ? (
                    <>
                      <CheckCircle className="mr-1 h-4 w-4" />
                      Completed
                    </>
                  ) : (
                    "Mark Complete"
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
