"use client"

import { getAvatar } from "../lib/tiptap-collab-utils"
import { createContext, useContext, useEffect, useState } from "react"

export type User = {
  id: string
  name: string
  color: string
  avatar: string
  email?: string
}

export type UserContextValue = {
  user: User
}

export const UserContext = createContext<UserContextValue>({
  user: { color: "", id: "", name: "", avatar: "", email: "" },
})

import { createClient } from "@/utils/supabase/client"

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>({
    color: getColorFromLocalStorage(),
    name: getUsernameFromLocalStorage(),
    id: getUserIdFromLocalStorage(),
    avatar: getAvatar(getUsernameFromLocalStorage()),
    email: undefined,
  })

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const { data: { user: supabaseUser } } = await supabase.auth.getUser()

      if (supabaseUser) {
        const fullName = `${supabaseUser.user_metadata?.first_name || 'Cadelo'} ${supabaseUser.user_metadata?.last_name || 'Imperial'}`
        
        const authenticatedUser = {
          color: getColorFromLocalStorage(), // Keep color random per session or fetch from profile table later
          name: fullName,
          id: supabaseUser.id,
          avatar: getAvatar(fullName),
          email: supabaseUser.email,
        }
        
        setUser(authenticatedUser)
        window.localStorage.setItem("_tiptap_username", authenticatedUser.name)
        window.localStorage.setItem("_tiptap_user_id", authenticatedUser.id)
      } else {
        window.localStorage.setItem("_tiptap_username", user.name)
        window.localStorage.setItem("_tiptap_color", user.color)
        window.localStorage.setItem("_tiptap_user_id", user.id)
      }
    }

    fetchUser()
  }, [])

  return (
    <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)

export const FIRST_NAMES = [
  "John",
  "Jane",
  "Alice",
  "Bob",
  "Eve",
  "Charlie",
  "David",
  "Frank",
  "Grace",
  "Helen",
  "Rob Lowe",
  "Rob",
]

export const LAST_NAMES = [
  "Smith",
  "Johnson",
  "Williams",
  "Jones",
  "Brown",
  "Davis",
  "Miller",
  "Wilson",
  "Moore",
  "Taylor",
  "Anderson",
  "Thomas",
  "Lowe",
]

export const USER_COLORS = [
  "#fb7185",
  "#fdba74",
  "#d9f99d",
  "#a7f3d0",
  "#a5f3fc",
  "#a5b4fc",
  "#f0abfc",
  "#fda58d",
  "#f2cc8f",
  "#9ae6b4",
]

const uuid = (): string => {
  const template = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
  return template.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

const getRandomArrayItem = (array: string[]) => {
  if (array.length === 0) {
    throw new Error("Cannot get random item from empty array")
  }
  return array[Math.floor(Math.random() * array.length)]!
}

const generateRandomUsername = (): string => {
  const names = [getRandomArrayItem(FIRST_NAMES)]

  if (Math.random() > 0.85) {
    names.push(getRandomArrayItem(FIRST_NAMES))
  }
  names.push(getRandomArrayItem(LAST_NAMES))

  return names.join(" ")
}

const generateRandomColor = (): string => {
  return getRandomArrayItem(USER_COLORS) ?? "#9ae6b4"
}

const getFromLocalStorage = (
  key: string,
  fallback: () => string,
  isServer: boolean = typeof window === "undefined"
): string => {
  if (isServer) {
    return fallback()
  }
  const value = window.localStorage.getItem(key)
  return value !== null ? value : fallback()
}

const getUsernameFromLocalStorage = (): string => {
  return getFromLocalStorage("_tiptap_username", generateRandomUsername)
}

const getColorFromLocalStorage = (): string => {
  return getFromLocalStorage("_tiptap_color", generateRandomColor)
}

const getUserIdFromLocalStorage = (): string => {
  return getFromLocalStorage("_tiptap_user_id", () => uuid())
}
