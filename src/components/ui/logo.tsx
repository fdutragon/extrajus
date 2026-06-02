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
  const jusColor = isQuartz ? "#ffffff" : "#eab308"
  const jusShadow = isQuartz 
    ? "drop-shadow-[0_0_8px_rgba(255,255,255,0.35)]" 
    : "drop-shadow-[0_0_4px_rgba(209,213,223,0.15)]"

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
        <defs>
          {/* Variante Gold: Ouro Imperial e Obsidiana (Ideal para Sidebar/Header) */}
          <linearGradient id="chromeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" /> {/* Ouro Claro */}
            <stop offset="30%" stopColor="#eab308" /> {/* Ouro Brilhante */}
            <stop offset="70%" stopColor="#a16207" /> {/* Ouro Antigo */}
            <stop offset="100%" stopColor="#422006" /> {/* Ouro Negro */}
          </linearGradient>
          <linearGradient id="darkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#141419" /> {/* Obsidian Light */}
            <stop offset="100%" stopColor="#050507" /> {/* Vácuo Negro */}
          </linearGradient>

          {/* Variante Quartz: Platina Ultra Clara e Cristal de Quartzo (Ideal para Loading/Auth) */}
          <linearGradient id="quartzGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" /> {/* Branco Puro */}
            <stop offset="50%" stopColor="#f3f4f6" /> {/* Prata Ultra Claro */}
            <stop offset="100%" stopColor="#e5e7eb" /> {/* Platina Suave */}
          </linearGradient>
          <linearGradient id="frostedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.08)" /> {/* Quartzo Translúcido */}
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.02)" /> 
          </linearGradient>
        </defs>

        {/* Hexágono Brutalista Selo de Força */}
        <polygon 
          points="50,6 88,28 88,72 50,94 12,72 12,28" 
          fill={fillColor} 
          stroke={strokeColor} 
          strokeWidth="2.5" 
          strokeLinejoin="round"
        />
        
        {/* Portal de Conectividade Interno */}
        <polygon 
          points="50,12 82,31 82,69 50,88 18,69 18,31" 
          stroke={strokeColor} 
          strokeWidth="1.2" 
          strokeDasharray="4 6" 
          opacity="0.3"
        />

        {/* Lâminas Sétricas de Equilíbrio / Asas Geométricas */}
        {/* Lado Esquerdo */}
        <path 
          d="M47 25 L23 46 L31 54 L47 46 Z" 
          fill={strokeColor} 
          opacity="0.95" 
        />
        <path 
          d="M47 49 L27 66 L35 72 L47 61 Z" 
          fill={strokeColor} 
          opacity="0.75" 
        />

        {/* Lado Direito */}
        <path 
          d="M53 25 L77 46 L69 54 L53 46 Z" 
          fill={strokeColor} 
          opacity="0.95" 
        />
        <path 
          d="M53 49 L73 66 L65 72 L53 61 Z" 
          fill={strokeColor} 
          opacity="0.75" 
        />
        
        {/* Espada Central Vertical (Eixo da Verdade) */}
        <line 
          x1="50" 
          y1="16" 
          x2="50" 
          y2="84" 
          stroke={strokeColor} 
          strokeWidth="2.2" 
          strokeLinecap="round" 
        />

        {/* Diamante Central (Core de Inteligência) */}
        <path 
          d="M50,44 L56,50 L50,56 L44,50 Z" 
          fill={diamondFill} 
          stroke={strokeColor} 
          strokeWidth="1.5" 
        />

        {/* Luz de Sinapse Ativa Pulsante no centro do Diamante (Core da IA) */}
        <circle 
          cx="50" 
          cy="50" 
          r="2" 
          fill="#ffffff" 
          className="animate-pulse"
          style={{
            filter: "drop-shadow(0 0 4px rgba(255,255,255,0.85))",
          }}
        />
      </svg>

      {showText && (
        <span className={cn(
          "font-sans font-black tracking-[0.28em] text-foreground leading-none flex items-center max-sm:hidden",
          isLarge ? "text-[12px] md:text-[15px]" : isMedium ? "text-[10.5px] md:text-[13px]" : "text-[7.5px] sm:text-[7.5px]"
        )}>
          Extra<span style={{ color: jusColor, filter: jusShadow }} className="transition-all duration-500">Jus</span>
        </span>
      )}
    </div>
  )
}
