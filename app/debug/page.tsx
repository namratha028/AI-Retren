"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function DebugPage() {
  const [dbStatus, setDbStatus] = useState<"loading" | "success" | "error">("loading")
  const [dbMessage, setDbMessage] = useState("")
  const [collections, setCollections] = useState<string[]>([])
  const [selectedCollection, setSelectedCollection] = useState<string>("")
  const [documents, setDocuments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    checkDatabaseConnection()
  }, [])

  const checkDatabaseConnection = async () => {
    setDbStatus("loading")
    try {
      const response = await fetch("/api/debug/db-connection")
      const data = await response.json()

      if (response.ok) {
        setDbStatus("success")
        setDbMessage("Connected to database successfully")
        setCollections(data.collections || [])
      } else {
        setDbStatus("error")
        setDbMessage(data.message || "Failed to connect to database")
      }
    } catch (error) {
      setDbStatus("error")
      setDbMessage("Error checking database connection")
      console.error("Error checking database connection:", error)
    }
  }

  const fetchCollectionData = async (collection: string) => {
    setIsLoading(true)
    setSelectedCollection(collection)
    try {
      const response = await fetch(`/api/debug/collection-data?collection=${collection}`)
      const data = await response.json()

      if (response.ok) {
        setDocuments(data.documents || [])
      } else {
        setDocuments([])
        console.error(`Failed to fetch ${collection} data:`, data.message)
      }
    } catch (error) {
      setDocuments([])
      console.error(`Error fetching ${collection} data:`, error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Database Debug Page</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Database Connection</CardTitle>
          <CardDescription>Check if the application can connect to MongoDB</CardDescription>
        </CardHeader>
        <CardContent>
          {dbStatus === "loading" ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mr-3"></div>
              <span>Checking connection...</span>
            </div>
          ) : dbStatus === "success" ? (
            <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900">
              <AlertDescription className="text-green-600 dark:text-green-400">{dbMessage}</AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertDescription>{dbMessage}</AlertDescription>
            </Alert>
          )}

          <div className="mt-4">
            <Button onClick={checkDatabaseConnection}>Test Connection Again</Button>
          </div>
        </CardContent>
      </Card>

      {collections.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Collections</CardTitle>
            <CardDescription>View data in your MongoDB collections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-6">
              {collections.map((collection) => (
                <Button
                  key={collection}
                  variant={selectedCollection === collection ? "default" : "outline"}
                  onClick={() => fetchCollectionData(collection)}
                >
                  {collection}
                </Button>
              ))}
            </div>

            {selectedCollection && (
              <div>
                <h3 className="text-xl font-semibold mb-4">{selectedCollection} Data</h3>

                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : documents.length > 0 ? (
                  <div className="overflow-x-auto">
                    <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md overflow-auto max-h-96">
                      {JSON.stringify(documents, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <p className="text-slate-500 dark:text-slate-400">No documents found in this collection.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
