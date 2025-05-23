import { Shell } from "@/components/shell"
import { TransformationMap } from "@/components/transformation-map"
import { EvolutionTracker } from "@/components/evolution-tracker"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function TransformationPage() {
  const currentStage = "blue" // This would typically come from the user's profile

  return (
    <Shell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Transformation Journey</h1>
          <p className="text-muted-foreground">
            Track your progress through Spiral Dynamics stages and set goals for your development.
          </p>
        </div>

        <Tabs defaultValue="map" className="space-y-4">
          <TabsList>
            <TabsTrigger value="map">Transformation Map</TabsTrigger>
            <TabsTrigger value="tracker">Evolution Tracker</TabsTrigger>
          </TabsList>

          <TabsContent value="map">
            <Card>
              <CardHeader>
                <CardTitle>Your Transformation Journey</CardTitle>
                <CardDescription>Set and track your development goals</CardDescription>
              </CardHeader>
              <CardContent>
                <TransformationMap currentStage={currentStage} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tracker">
            <EvolutionTracker />
          </TabsContent>
        </Tabs>
      </div>
    </Shell>
  )
}
