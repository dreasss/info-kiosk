"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface TouchButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  icon?: LucideIcon;
  title?: string;
  description?: string;
  touchSize?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "secondary" | "ghost" | "outline";
  asChild?: boolean;
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
    };

    const variantClasses = {
      default:
        "bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-2xl",
      secondary:
        "bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-900 shadow-md hover:shadow-lg",
      ghost:
        "hover:bg-white/10 backdrop-blur-sm text-current border border-white/20 hover:border-white/40",
    };

    const baseClasses = cn(
      "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 ease-out",
      "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
      "active:scale-95 hover:scale-105 hover:-translate-y-1 select-none touch-manipulation",
      "backdrop-blur-sm border border-white/10 glow-on-hover",
      "relative overflow-hidden",
      sizeClasses[touchSize],
      variantClasses[variant],
      className,
    );

    if (asChild && children) {
      return React.cloneElement(children as React.ReactElement, {
        className: cn(
          baseClasses,
          (children as React.ReactElement).props?.className,
        ),
      });
    }

    const content =
      Icon && title ? (
        <div className="flex flex-col items-center justify-center text-center space-y-2 w-full h-full">
          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3 shadow-lg border border-white/30 group-hover:scale-110 group-hover:bg-white/30 transition-all duration-300">
            <Icon className="h-7 w-7 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <div>
            <h3 className="font-bold text-lg mb-1 group-hover:scale-105 transition-transform duration-300">
              {title}
            </h3>
            {description && (
              <p className="text-sm opacity-90 leading-tight group-hover:opacity-100 transition-opacity duration-300">
                {description}
              </p>
            )}
          </div>
        </div>
      ) : (
        children
      );

    if (href) {
      return (
        <Link href={href} className={baseClasses}>
          {content}
        </Link>
      );
    }

    return (
      <button ref={ref} className={baseClasses} {...props}>
        {content}
      </button>
    );
  },
);

TouchButton.displayName = "TouchButton";

export { TouchButton };
