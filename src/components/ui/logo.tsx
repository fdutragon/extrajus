import React from "react"
import { cn } from "@/lib/utils"

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string
  showText?: boolean
  iconSize?: number
  variant?: "chrome" | "quartz"
}

export function Logo({ className, showText = true, iconSize = 32, variant = "chrome", ...props }: LogoProps) {
  const isLarge = iconSize >= 48
  const isMedium = iconSize >= 36
  const isQuartz = variant === "quartz"

  // Seletores dinâmicos de cor para suportar variantes do design
  const strokeColor = isQuartz ? "url(#quartzGradient)" : "url(#chromeGradient)"
  const fillColor = isQuartz ? "url(#frostedGradient)" : "url(#darkGradient)"
  const diamondFill = isQuartz ? "rgba(255, 255, 255, 0.05)" : "#050507"
  const jusColor = isQuartz ? "#ffffff" : "#facc15"
  const jusShadow = isQuartz 
    ? "drop-shadow(0 0 8px rgba(255,255,255,0.35))" 
    : "drop-shadow(0 0 4px rgba(209,213,223,0.15))"

  return (
    <div className={cn("flex items-center gap-1.5 select-none", className)}>
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-all duration-500 hover:scale-105"
        style={{ maxWidth: iconSize, maxHeight: iconSize }}
        {...props}
      >
        <defs>
          {/* Variante Gold: Ouro Imperial e Obsidiana */}
          <linearGradient id="chromeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fefce8" />
            <stop offset="40%" stopColor="#fde047" />
            <stop offset="80%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>
          <linearGradient id="darkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#141419" />
            <stop offset="100%" stopColor="#050507" />
          </linearGradient>

          {/* Variante Quartz: Platina Ultra Clara e Cristal de Quartzo */}
          <linearGradient id="quartzGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#f3f4f6" />
            <stop offset="100%" stopColor="#e5e7eb" />
          </linearGradient>
          <linearGradient id="frostedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.08)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.02)" /> 
          </linearGradient>
        </defs>

        {/* Fundo Escuro para Tema Claro */}
        <rect width="100" height="100" rx="22" className="fill-[#09090b] dark:fill-transparent" />

        {/* Outer Hexagon Brackets (The Shields of Law) */}
        <path 
          d="M 42,14 L 16,30 L 16,70 L 42,86" 
          fill="none" 
          stroke={strokeColor} 
          strokeWidth="4" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        <path 
          d="M 58,14 L 84,30 L 84,70 L 58,86" 
          fill="none" 
          stroke={strokeColor} 
          strokeWidth="4" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />

        {/* Inner Data Brackets (The Code/Variables) */}
        <path 
          d="M 46,32 L 33,40 L 33,60 L 46,68" 
          fill="none" 
          stroke={strokeColor} 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          opacity="0.4"
        />
        <path 
          d="M 54,32 L 67,40 L 67,60 L 54,68" 
          fill="none" 
          stroke={strokeColor} 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          opacity="0.4"
        />

        {/* The Core (Intelligence / AI) */}
        <circle 
          cx="50" 
          cy="50" 
          r="4.5" 
          fill={jusColor} 
          className="animate-pulse"
          style={{
            filter: jusShadow,
          }}
        />
      </svg>

      {showText && (
        <span className={cn(
          "font-sans font-black uppercase tracking-[0.35em] text-black dark:text-white leading-none flex items-center",
          isLarge ? "text-[10px] md:text-[12px]" : isMedium ? "text-[9px] md:text-[10px]" : "text-[8px] sm:text-[8.5px]"
        )}>
          EXTRA<span style={{ filter: jusShadow }} className={cn("transition-all duration-500", isQuartz ? "text-white" : "text-yellow-600 dark:text-yellow-400")}>JUS</span>
        </span>
      )}
    </div>
  )
}
