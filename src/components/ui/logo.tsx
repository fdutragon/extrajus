import React from "react"
import { cn } from "@/lib/utils"

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string
  showText?: boolean
  iconSize?: number
}

export function Logo({ className, showText = true, iconSize = 32, ...props }: LogoProps) {
  const isLarge = iconSize >= 48
  const isMedium = iconSize >= 36

  return (
    <div className={cn("flex items-center gap-1.5 select-none", className)}>
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-all duration-500 hover:scale-105"
        {...props}
      >
        {/* Metal Gradientes de Luxo */}
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff8e7" /> {/* Ouro Branco */}
            <stop offset="30%" stopColor="#e2c9a3" /> {/* Ouro Líquido */}
            <stop offset="70%" stopColor="#c5a880" /> {/* Bronze Imperial */}
            <stop offset="100%" stopColor="#785e3a" /> {/* Deep Gold */}
          </linearGradient>
          <linearGradient id="darkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1c1c21" /> {/* Obsidian Light */}
            <stop offset="100%" stopColor="#08080a" /> {/* Vácuo Negro */}
          </linearGradient>
        </defs>

        {/* Hexágono Brutalista Selo de Força */}
        <polygon 
          points="50,6 88,28 88,72 50,94 12,72 12,28" 
          fill="url(#darkGradient)" 
          stroke="url(#goldGradient)" 
          strokeWidth="2.5" 
          strokeLinejoin="round"
        />
        
        {/* Portal de Conectividade Interno */}
        <polygon 
          points="50,12 82,31 82,69 50,88 18,69 18,31" 
          stroke="url(#goldGradient)" 
          strokeWidth="1.2" 
          strokeDasharray="4 6" 
          opacity="0.3"
        />

        {/* Lâminas Sétricas de Equilíbrio / Asas Geométricas */}
        {/* Lado Esquerdo */}
        <path 
          d="M47 25 L23 46 L31 54 L47 46 Z" 
          fill="url(#goldGradient)" 
          opacity="0.9" 
        />
        <path 
          d="M47 49 L27 66 L35 72 L47 61 Z" 
          fill="url(#goldGradient)" 
          opacity="0.75" 
        />

        {/* Lado Direito */}
        <path 
          d="M53 25 L77 46 L69 54 L53 46 Z" 
          fill="url(#goldGradient)" 
          opacity="0.9" 
        />
        <path 
          d="M53 49 L73 66 L65 72 L53 61 Z" 
          fill="url(#goldGradient)" 
          opacity="0.75" 
        />
        
        {/* Espada Central Vertical (Eixo da Verdade) */}
        <line 
          x1="50" 
          y1="16" 
          x2="50" 
          y2="84" 
          stroke="url(#goldGradient)" 
          strokeWidth="2.2" 
          strokeLinecap="round" 
        />

        {/* Diamante Central (Core de Inteligência) */}
        <path 
          d="M50,44 L56,50 L50,56 L44,50 Z" 
          fill="#08080a" 
          stroke="url(#goldGradient)" 
          strokeWidth="1.5" 
        />
      </svg>

      {showText && (
        <span className={cn(
          "font-sans font-black tracking-[0.28em] text-foreground leading-none flex items-center",
          isLarge ? "text-[13px]" : isMedium ? "text-[11.5px]" : "text-[10px]"
        )}>
          Extra<span className="text-[#e2c9a3]">Jus</span>
        </span>
      )}
    </div>
  )
}
