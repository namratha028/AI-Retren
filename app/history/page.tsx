import { Shell } from "@/components/shell"
import { RecordingHistory } from "@/components/recording-history"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HistoryPage() {
  return (
    <Shell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Recording History</h1>
          <p className="text-muted-foreground">View and manage your past voice recordings and analyses.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Recordings</CardTitle>
            <CardDescription>All your voice analyses in one place</CardDescription>
          </CardHeader>
          <CardContent>
            <RecordingHistory />
          </CardContent>
        </Card>
      </div>
    </Shell>
  )
}
