
"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "@teispace/next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center justify-center w-8 h-8 max-sm:w-7 max-sm:h-7 rounded-md max-sm:rounded-lg bg-transparent hover:bg-zinc-100 dark:hover:bg-white/5 transition-all group overflow-hidden"
    >
      <div className="relative w-4 h-4 overflow-hidden">
        <Sun className="h-4 w-4 absolute inset-0 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-zinc-500 group-hover:text-primary" />
        <Moon className="h-4 w-4 absolute inset-0 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-zinc-400 group-hover:text-primary" />
      </div>
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}
