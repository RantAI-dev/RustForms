"use client"

import { ReactNode } from "react"
import { Badge } from "@/components/ui/badge"
import { Lock, Zap } from "lucide-react"
import { FEATURE_FLAGS, type FeatureFlag } from "@/lib/feature-flags"

interface BlurOverlayProps {
  children: ReactNode
  featureFlag?: FeatureFlag
  isBlurred?: boolean
  label?: string
  variant?: "pro" | "coming-soon"
  className?: string
}

export function BlurOverlay({ 
  children, 
  featureFlag,
  isBlurred = true, 
  label = "Coming Soon", 
  variant = "coming-soon",
  className = "" 
}: BlurOverlayProps) {
  // If a feature flag is provided, use that to determine if content should be blurred
  const shouldBlur = featureFlag ? FEATURE_FLAGS[featureFlag] : isBlurred

  if (!shouldBlur) {
    return <>{children}</>
  }

  const icon = variant === "pro" ? <Zap className="w-4 h-4" /> : <Lock className="w-4 h-4" />
  const badgeText = variant === "pro" ? "Pro Feature" : label

  return (
    <div className={`relative ${className}`}>
      {/* Blurred content */}
      <div className="filter blur-sm pointer-events-none select-none">
        {children}
      </div>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
        <Badge 
          variant="secondary" 
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium ${
            variant === "pro" 
              ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" 
              : "bg-gray-500/20 text-gray-300 border-gray-500/30"
          }`}
        >
          {icon}
          {badgeText}
        </Badge>
      </div>
    </div>
  )
}
