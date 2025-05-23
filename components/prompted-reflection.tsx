"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Lightbulb, RefreshCw, Save, Sparkles } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface PromptedReflectionProps {
  currentStage?: string
  onSaveReflection?: (reflection: string, prompt: string) => void
}

export function PromptedReflection({ currentStage = "blue", onSaveReflection }: PromptedReflectionProps) {
  const [activeTab, setActiveTab] = useState("prompt")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [currentPrompt, setCurrentPrompt] = useState("")
  const [reflection, setReflection] = useState("")

  // Sample prompts for different stages - in a real app, these would be more extensive and possibly come from an API
  const stagePrompts: Record<string, string[]> = {
    beige: ["How do you respond to immediate physical needs and threats?", "When do you feel most secure and safe?"],
    purple: [
      "What traditions or rituals are important to you?",
      "How do you connect with your sense of belonging to a group?",
    ],
    red: ["When do you feel most powerful and in control?", "How do you assert yourself in challenging situations?"],
    blue: [
      "What principles or rules guide your decision making?",
      "How do you determine what is right and wrong?",
      "What gives your life meaning and purpose?",
    ],
    orange: ["What goals are you currently working towards?", "How do you measure success in your life?"],
    green: [
      "How do you consider others' perspectives and feelings?",
      "What communities or causes are you connected to?",
    ],
    yellow: [
      "How do you integrate different perspectives or systems?",
      "When have you adapted your approach based on the specific context?",
    ],
    turquoise: [
      "How do you see yourself connected to the larger whole?",
      "How do you balance individual needs with collective wellbeing?",
    ],
  }

  const generatePrompt = async () => {
    setIsGenerating(true)

    try {
      // In a real app, this would call an API to generate a personalized prompt
      // For now, we'll simulate a delay and pick a random prompt for the current stage
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const stagePromptsArray = stagePrompts[currentStage] || stagePrompts.blue
      const randomPrompt = stagePromptsArray[Math.floor(Math.random() * stagePromptsArray.length)]
      setCurrentPrompt(randomPrompt)
      setActiveTab("reflect")
    } catch (error) {
      console.error("Error generating prompt:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const saveReflection = async () => {
    if (!reflection || !currentPrompt) return

    setIsSaving(true)

    try {
      // In a real app, this would call an API to save the reflection
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (onSaveReflection) {
        onSaveReflection(reflection, currentPrompt)
      }

      // Clear the form after saving
      setReflection("")
      setCurrentPrompt("")
      setActiveTab("prompt")
    } catch (error) {
      console.error("Error saving reflection:", error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prompted Reflection</CardTitle>
        <CardDescription>
          Reflect on prompts tailored to your current Spiral Dynamics stage to deepen your understanding.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="prompt" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="prompt">Get Prompt</TabsTrigger>
            <TabsTrigger value="reflect" disabled={!currentPrompt}>
              Reflect
            </TabsTrigger>
          </TabsList>

          <TabsContent value="prompt" className="space-y-4 pt-4">
            <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg">
              <Lightbulb className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-medium">Personalized Reflection Prompts</h3>
                <p className="text-sm text-muted-foreground">
                  Generate prompts tailored to your current stage to deepen your understanding and growth.
                </p>
              </div>
            </div>

            <Button onClick={generatePrompt} disabled={isGenerating} className="w-full">
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating Prompt...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Reflection Prompt
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="reflect" className="space-y-4 pt-4">
            {currentPrompt ? (
              <>
                <div className="p-4 bg-primary/10 rounded-lg">
                  <h3 className="font-medium text-primary mb-1">Reflection Prompt:</h3>
                  <p>{currentPrompt}</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="reflection" className="text-sm font-medium">
                    Your Reflection
                  </label>
                  <Textarea
                    id="reflection"
                    placeholder="Write your thoughts here..."
                    className="min-h-[150px]"
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setActiveTab("prompt")}>
                    New Prompt
                  </Button>
                  <Button onClick={saveReflection} disabled={!reflection || isSaving}>
                    {isSaving ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Reflection
                      </>
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <Skeleton className="h-[100px] w-full" />
                <Skeleton className="h-[200px] w-full" />
                <div className="flex justify-end gap-2">
                  <Skeleton className="h-10 w-[100px]" />
                  <Skeleton className="h-10 w-[150px]" />
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
