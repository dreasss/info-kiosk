"use client"

import * as React from "react"
import { Button, type ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TouchButtonProps extends ButtonProps {
  touchSize?: "sm" | "md" | "lg" | "xl"
}

const touchSizes = {
  sm: "min-h-[44px] min-w-[44px] text-sm",
  md: "min-h-[48px] min-w-[48px] text-base",
  lg: "min-h-[56px] min-w-[56px] text-lg",
  xl: "min-h-[64px] min-w-[64px] text-xl",
}

export const TouchButton = React.forwardRef<HTMLButtonElement, TouchButtonProps>(
  ({ className, touchSize = "md", ...props }, ref) => {
    return (
      <Button className={cn(touchSizes[touchSize], "touch-manipulation select-none", className)} ref={ref} {...props} />
    )
  },
)
TouchButton.displayName = "TouchButton"
