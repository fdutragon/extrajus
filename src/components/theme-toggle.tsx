"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="rounded-full w-12 h-12 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-all duration-500 hover:scale-110 active:scale-95 group flex items-center justify-center cursor-pointer outline-none"
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-orange-500 group-hover:rotate-45" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-orange-400 group-hover:-rotate-12" />
        <span className="sr-only">Toggle theme</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 backdrop-blur-xl">
        <DropdownMenuItem onClick={() => setTheme("light")} className="gap-2 cursor-pointer focus:bg-zinc-100 dark:focus:bg-zinc-900 transition-colors">
          <Sun className="h-4 w-4 text-orange-500" />
          <span className="font-medium text-zinc-700 dark:text-zinc-300">Light Mode</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className="gap-2 cursor-pointer focus:bg-zinc-100 dark:focus:bg-zinc-900 transition-colors">
          <Moon className="h-4 w-4 text-orange-400" />
          <span className="font-medium text-zinc-700 dark:text-zinc-300">Dark Mode</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} className="gap-2 cursor-pointer focus:bg-zinc-100 dark:focus:bg-zinc-900 transition-colors">
          <Monitor className="h-4 w-4 text-zinc-500" />
          <span className="font-medium text-zinc-700 dark:text-zinc-300">System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
