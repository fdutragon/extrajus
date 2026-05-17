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
    <div className={cn("flex items-center gap-3 select-none", className)}>
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-500 hover:rotate-45"
        {...props}
      >
        {/* Metal Gradientes do Império */}
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c5a880" />
            <stop offset="50%" stopColor="#e2c9a3" />
            <stop offset="100%" stopColor="#8a7355" />
          </linearGradient>
          <linearGradient id="darkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#18181b" />
            <stop offset="100%" stopColor="#09090b" />
          </linearGradient>
        </defs>

        {/* Círculo Ritualístico de Fundo (Sempre com Escudo Escuro Fixo para Contraste Supremo Chiaroscuro) */}
        <circle 
          cx="50" 
          cy="50" 
          r="46" 
          fill="url(#darkGradient)" 
          stroke="url(#goldGradient)"
          strokeWidth="1.5" 
          opacity="0.95" 
        />
        
        {/* Círculo Externo com Orbitais Finas */}
        <circle cx="50" cy="50" r="42" stroke="url(#goldGradient)" strokeWidth="0.75" strokeDasharray="4 8" opacity="0.5" />
        
        {/* Triângulo Geométrico Superior (A Ordem) */}
        <path d="M50 15L80 67H20L50 15Z" stroke="url(#goldGradient)" strokeWidth="1" opacity="0.4" />
        
        {/* Triângulo Invertido Inferior (O Caos/A Blindagem) */}
        <path d="M50 85L20 33H80L50 85Z" stroke="url(#goldGradient)" strokeWidth="1.2" opacity="0.6" />

        {/* Espada Central da Justiça (Eixo Simétrico) */}
        <path d="M50 22L53 30L51.5 72L50 78L48.5 72L47 30L50 22Z" fill="url(#goldGradient)" />
        
        {/* Guarda-mão da Espada (Balança Estilizada) */}
        <path d="M32 46H68" stroke="url(#goldGradient)" strokeWidth="3" strokeLinecap="square" />
        
        {/* Detalhes Rúnicos Esotéricos na Balança */}
        <path d="M32 46V54M68 46V54" stroke="url(#goldGradient)" strokeWidth="1.5" />
        <circle cx="32" cy="56" r="2.5" fill="url(#goldGradient)" />
        <circle cx="68" cy="56" r="2.5" fill="url(#goldGradient)" />
        
        {/* Losango de Poder no Coração (Sempre Escuro Fixo) */}
        <path 
          d="M50 40L56 46L50 52L44 46L50 40Z" 
          fill="url(#darkGradient)"
          stroke="url(#goldGradient)"
          strokeWidth="1.5" 
        />
      </svg>

      {showText && (
        <span className={cn(
          "font-serif tracking-[0.2em] uppercase text-foreground leading-none",
          isLarge ? "text-base" : isMedium ? "text-sm" : "text-xs"
        )}>
          Extra<span className="text-gold font-medium">Jus</span>
        </span>
      )}
    </div>
  )
}
