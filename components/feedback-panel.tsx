"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lightbulb, BookOpen, ArrowRight, ExternalLink } from "lucide-react"
import { motion } from "framer-motion"

interface FeedbackPanelProps {
  analysis: {
    dominantColor: string
    colorName: string
    colorHex: string
    feedback: {
      insights: string[]
      recommendations: string[]
      resources: {
        title: string
        type: string
      }[]
    }
  }
}

export function FeedbackPanel({ analysis }: FeedbackPanelProps) {
  const { dominantColor, colorName, colorHex, feedback } = analysis
  const { insights, recommendations, resources } = feedback

  return (
    <Card className="border-none shadow-lg overflow-hidden">
      <CardHeader className="pb-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardTitle>Personalized Feedback</CardTitle>
        <CardDescription className="text-blue-100">Based on your {colorName} stage analysis</CardDescription>
      </CardHeader>

      <CardContent className="pt-6 space-y-6 bg-white dark:bg-slate-800">
        {/* Insights */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            <span className="bg-gradient-to-r from-yellow-500 to-amber-500 bg-clip-text text-transparent">
              Insights
            </span>
          </h3>

          <ul className="space-y-2 pl-6">
            {insights.map((insight, index) => (
              <motion.li
                key={index}
                className="text-slate-700 dark:text-slate-300"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                {insight}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Recommendations */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="text-lg font-medium flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-emerald-500" />
            <span className="bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">
              Growth Recommendations
            </span>
          </h3>

          <ul className="space-y-2 pl-6">
            {recommendations.map((recommendation, index) => (
              <motion.li
                key={index}
                className="text-slate-700 dark:text-slate-300"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
              >
                {recommendation}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Resources */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="text-lg font-medium flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-500" />
            <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
              Recommended Resources
            </span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {resources.map((resource, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
              >
                <Button
                  variant="outline"
                  className="justify-start h-auto py-3 px-4 w-full bg-slate-50 dark:bg-slate-900 hover:bg-white dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm"
                >
                  <div className="text-left flex items-start gap-3">
                    <ExternalLink className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">{resource.title}</div>
                      <div className="text-xs text-slate-500">{resource.type}</div>
                    </div>
                  </div>
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </CardContent>
    </Card>
  )
}
