"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Mic, BarChart2, BookOpen, Map, History, Settings, User, Menu, X, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { UserNav } from "@/components/user-nav"
import { ModeToggle } from "@/components/mode-toggle"
import { useMobile } from "@/hooks/use-mobile"

interface ShellProps {
  children: React.ReactNode
}

export function Shell({ children }: ShellProps) {
  const pathname = usePathname()
  const isMobile = useMobile()
  const [isOpen, setIsOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const routes = [
    {
      name: "Dashboard",
      path: "/",
      icon: <Home className="h-5 w-5" />,
    },
    {
      name: "Voice Analysis",
      path: "/voice",
      icon: <Mic className="h-5 w-5" />,
    },
    {
      name: "Insights",
      path: "/insights",
      icon: <BarChart2 className="h-5 w-5" />,
    },
    {
      name: "Practices",
      path: "/practices",
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      name: "Transformation",
      path: "/transformation",
      icon: <Map className="h-5 w-5" />,
    },
    {
      name: "History",
      path: "/history",
      icon: <History className="h-5 w-5" />,
    },
    {
      name: "Settings",
      path: "/settings",
      icon: <Settings className="h-5 w-5" />,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: <User className="h-5 w-5" />,
    },
  ]

  if (!isMounted) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-dashboard">
      {/* Sidebar for desktop */}
      {!isMobile && (
        <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 z-10">
          <div className="flex flex-col h-full glass-card border-r">
            <div className="p-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-white font-bold">R</span>
                </div>
                <span className="font-bold text-xl">RETVR</span>
              </Link>
            </div>

            <ScrollArea className="flex-1 py-4">
              <nav className="space-y-1 px-2">
                {routes.map((route) => (
                  <Link
                    key={route.path}
                    href={route.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                      pathname === route.path
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    {route.icon}
                    <span>{route.name}</span>
                  </Link>
                ))}
              </nav>
            </ScrollArea>

            <div className="p-4 border-t">
              <ModeToggle />
            </div>
          </div>
        </aside>
      )}

      {/* Mobile sidebar */}
      {isMobile && (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden fixed top-4 left-4 z-50">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <div className="flex flex-col h-full">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-white font-bold">R</span>
                    </div>
                    <span className="font-bold text-xl">RETVR</span>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1 py-4">
                <nav className="space-y-1 px-2">
                  {routes.map((route) => (
                    <Link
                      key={route.path}
                      href={route.path}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                        pathname === route.path
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {route.icon}
                      <span>{route.name}</span>
                    </Link>
                  ))}
                </nav>
              </ScrollArea>

              <div className="p-4 border-t">
                <ModeToggle />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Main content */}
      <main className={`flex-1 ${!isMobile ? "md:pl-64" : ""}`}>
        <div className="flex flex-col min-h-screen">
          {/* Header for mobile */}
          {isMobile && (
            <header className="sticky top-0 z-10 glass-card border-b h-16 flex items-center justify-end px-4">
              <div className="flex items-center gap-2">
                <UserNav />
              </div>
            </header>
          )}

          {/* Content */}
          <div className="flex-1 p-4 md:p-8">{children}</div>
        </div>
      </main>
    </div>
  )
}
