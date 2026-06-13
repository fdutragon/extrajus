"use client"

import { useEffect, useState } from "react"

// --- UI Primitives ---
import { Button } from "../../../components/tiptap-ui-primitive/button"

// --- Icons ---
import { SunIcon } from "../../../components/tiptap-icons/sun-icon"
import { MoonStarIcon } from "../../../components/tiptap-icons/moon-star-icon"

export function ThemeToggle() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = () => setIsDarkMode(mediaQuery.matches)
    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  useEffect(() => {
    const initialDarkMode =
      !!document.querySelector('meta[name="color-scheme"][content="dark"]') ||
      window.matchMedia("(prefers-color-scheme: dark)").matches
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDarkMode(initialDarkMode)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode)
  }, [isDarkMode])

  const toggleDarkMode = () => setIsDarkMode((isDark) => !isDark)

  return (
    <Button
      onClick={toggleDarkMode}
      aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
      variant="ghost"
      size="small"
      className="h-9 w-9 max-sm:w-7 max-sm:h-7 text-muted-foreground hover:text-foreground dark:hover:bg-primary/5 rounded-full transition-all group border border-transparent hover:border-border/40 flex items-center justify-center shrink-0 p-0"
    >
      {isDarkMode ? (
        <MoonStarIcon className="w-[18px] h-[18px] transition-transform" />
      ) : (
        <SunIcon className="w-[18px] h-[18px] transition-transform" />
      )}
    </Button>
  )
}
