"use client"

import React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return <NextThemesProvider attribute="class" enableSystem>{children}</NextThemesProvider>
}