import { Shell } from "@/components/shell"
import { PracticeLibrary } from "@/components/practice-library"
import { RecordingHistory } from "@/components/recording-history"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, History } from "lucide-react"

export default function PracticesPage() {
  const currentStage = "blue" // This would typically come from the user's profile

  return (
    <Shell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Practices & History</h1>
          <p className="text-muted-foreground">
            Explore practices tailored to your current Spiral Dynamics stage and review your past recordings.
          </p>
        </div>

        <Tabs defaultValue="practices">
          <TabsList>
            <TabsTrigger value="practices">
              <BookOpen className="h-4 w-4 mr-2" />
              Practices
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-2" />
              Recording History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="practices" className="mt-6">
            <PracticeLibrary currentStage={currentStage} />
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <RecordingHistory />
          </TabsContent>
        </Tabs>
      </div>
    </Shell>
  )
}
