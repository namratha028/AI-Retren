"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"

interface TransformationMapProps {
  currentStage?: string
  targetStage?: string
}

export function TransformationMap({ currentStage = "blue", targetStage }: TransformationMapProps) {
  const [selectedStage, setSelectedStage] = useState<string | null>(targetStage || null)

  const stages = [
    { id: "beige", name: "Beige", description: "Survival", color: "bg-amber-700" },
    { id: "purple", name: "Purple", description: "Tribal", color: "bg-purple-700" },
    { id: "red", name: "Red", description: "Power", color: "bg-red-600" },
    { id: "blue", name: "Blue", description: "Order", color: "bg-blue-600" },
    { id: "orange", name: "Orange", description: "Achievement", color: "bg-orange-500" },
    { id: "green", name: "Green", description: "Community", color: "bg-green-600" },
    { id: "yellow", name: "Yellow", description: "Systemic", color: "bg-yellow-500" },
    { id: "turquoise", name: "Turquoise", description: "Holistic", color: "bg-teal-500" },
  ]

  const handleSetTarget = (stage: string) => {
    setSelectedStage(stage)

    // In a real app, this would save to the database
    console.log("Setting target stage:", stage)

    // Show a toast notification
    toast({
      title: "Target stage set",
      description: `Your target stage has been set to ${stage}.`,
    })
  }

  const handleCreateEvolutionPath = () => {
    if (selectedStage) {
      // In a real app, this would create an evolution path in the database
      console.log("Creating evolution path from", currentStage, "to", selectedStage)

      toast({
        title: "Progress path created",
        description: `Your evolution path from ${currentStage} to ${selectedStage} has been created.`,
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Transformation Map</h2>
        <p className="text-muted-foreground">Click on a stage to set it as your target for personal evolution.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stages.map((stage) => (
          <Card
            key={stage.id}
            className={`cursor-pointer transition-all ${
              selectedStage === stage.id
                ? "border-2 border-primary"
                : currentStage === stage.id
                  ? "border-2 border-blue-500"
                  : "border-border"
            } hover:bg-accent`}
            onClick={() => handleSetTarget(stage.id)}
          >
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-full ${stage.color}`}></div>
                <CardTitle className="text-lg">{stage.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-sm text-muted-foreground">{stage.description}</p>
              {currentStage === stage.id && <div className="mt-2 text-xs text-blue-400">Current stage</div>}
              {selectedStage === stage.id && <div className="mt-2 text-xs text-green-400">Target stage</div>}
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedStage && (
        <div className="flex justify-end">
          <Button className="bg-primary hover:bg-primary/90" onClick={handleCreateEvolutionPath}>
            Create Evolution Path
          </Button>
        </div>
      )}
    </div>
  )
}
