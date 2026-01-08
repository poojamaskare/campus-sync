"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { primaryNavItems } from "@/components/mobile-nav"

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 bg-red-500 md:hidden">
      <nav className="border-t border-border bg-background shadow-lg">
        <div className="flex h-16 w-full items-center justify-around">
          {primaryNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-0 flex-1",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-6 w-6 shrink-0" />
                <span className="text-[10px] font-medium truncate max-w-full">
                  {item.title}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
