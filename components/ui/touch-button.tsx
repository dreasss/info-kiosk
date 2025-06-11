"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string
  icon?: LucideIcon
  title?: string
  description?: string
  touchSize?: "sm" | "md" | "lg" | "xl"
  variant?: "default" | "secondary" | "ghost"
  asChild?: boolean
}

const TouchButton = React.forwardRef<HTMLButtonElement, TouchButtonProps>(
  (
    {
      className,
      href,
      icon: Icon,
      title,
      description,
      touchSize = "md",
      variant = "default",
      asChild = false,
      children,
      ...props
    },
    ref,
  ) => {
    const sizeClasses = {
      sm: "min-h-[44px] min-w-[44px] p-2",
      md: "min-h-[48px] min-w-[48px] p-3",
      lg: "min-h-[56px] min-w-[56px] p-4",
      xl: "min-h-[64px] min-w-[64px] p-6",
    }

    const variantClasses = {
      default: "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl",
      secondary: "bg-gray-200 hover:bg-gray-300 text-gray-900",
      ghost: "hover:bg-gray-100 text-gray-700",
    }

    const baseClasses = cn(
      "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200",
      "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
      "active:scale-95 select-none touch-manipulation",
      sizeClasses[touchSize],
      variantClasses[variant],
      className,
    )

    if (asChild && children) {
      return React.cloneElement(children as React.ReactElement, {
        className: cn(baseClasses, (children as React.ReactElement).props?.className),
      })
    }

    const content =
      Icon && title ? (
        <div className="flex flex-col items-center justify-center text-center space-y-2 w-full h-full">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-2">
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg mb-1">{title}</h3>
            {description && <p className="text-sm opacity-90 leading-tight">{description}</p>}
          </div>
        </div>
      ) : (
        children
      )

    if (href) {
      return (
        <Link href={href} className={baseClasses}>
          {content}
        </Link>
      )
    }

    return (
      <button ref={ref} className={baseClasses} {...props}>
        {content}
      </button>
    )
  },
)

TouchButton.displayName = "TouchButton"

export { TouchButton }
