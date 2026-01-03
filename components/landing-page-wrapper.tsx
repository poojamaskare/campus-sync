"use client"

import { useEffect } from "react"

export function LandingPageWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Force dark mode on the html element for landing page
    const html = document.documentElement
    
    // Ensure dark class is always present
    const forceDark = () => {
      html.classList.add("dark")
      html.classList.remove("light")
    }
    
    // Force immediately
    forceDark()
    
    // Use MutationObserver to watch for theme changes and force dark mode
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes" && mutation.attributeName === "class") {
          if (!html.classList.contains("dark")) {
            forceDark()
          }
        }
      })
    })
    
    // Observe the html element for class changes
    observer.observe(html, {
      attributes: true,
      attributeFilter: ["class"],
    })
    
    // Also set up an interval as a fallback
    const interval = setInterval(forceDark, 100)
    
    return () => {
      observer.disconnect()
      clearInterval(interval)
    }
  }, [])

  return <>{children}</>
}

