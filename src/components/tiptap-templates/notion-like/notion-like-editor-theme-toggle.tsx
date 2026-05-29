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
      className="h-7 w-7 p-0 rounded-lg flex items-center justify-center shrink-0"
    >
      {isDarkMode ? (
        <MoonStarIcon className="tiptap-button-icon w-3.5 h-3.5" />
      ) : (
        <SunIcon className="tiptap-button-icon w-3.5 h-3.5" />
      )}
    </Button>
  )
}
