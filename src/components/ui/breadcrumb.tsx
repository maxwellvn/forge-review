import * as React from "react"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("mb-4 overflow-hidden", className)}>
      <ol className="flex items-center gap-1 text-sm text-muted-foreground overflow-hidden">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1 min-w-0 shrink-0 last:shrink">
            {index > 0 && <ChevronRight className="h-4 w-4 shrink-0" />}
            {item.href ? (
              <Link
                href={item.href}
                className="hover:text-foreground transition-colors whitespace-nowrap"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium truncate max-w-[120px] sm:max-w-[200px]">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
