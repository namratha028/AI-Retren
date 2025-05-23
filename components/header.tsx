"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { UserNav } from "@/components/user-nav"
import { ModeToggle } from "@/components/mode-toggle"
import { Brain } from "lucide-react"

export function Header() {
  const pathname = usePathname()

  const routes = [
    { name: "Dashboard", path: "/" },
    { name: "Voice", path: "/voice" },
    { name: "Insights", path: "/insights" },
    { name: "Practices", path: "/practices" },
    { name: "Transformation", path: "/transformation" },
    { name: "History", path: "/history" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="flex items-center gap-2 mr-6">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-xl hidden md:inline-block">RETVR</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 flex-1">
          {routes.map((route) => (
            <Button key={route.path} variant={pathname === route.path ? "secondary" : "ghost"} size="sm" asChild>
              <Link href={route.path}>{route.name}</Link>
            </Button>
          ))}
        </nav>

        <div className="flex items-center gap-2 ml-auto">
          <ModeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  )
}
