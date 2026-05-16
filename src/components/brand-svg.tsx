"use client"

import React from "react"

export function BrandSVG({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      <defs>
        <linearGradient id="glow-orange" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
      </defs>

      <g className="transition-all duration-700 group-hover:scale-110 origin-center">
        
        {/* Sheet 1: The Foundation (Back) - Rotated Left */}
        <rect 
          x="20" y="25" width="40" height="55" 
          rx="3" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeOpacity="0.2"
          transform="rotate(-12 50 50)"
          className="dark:stroke-white/30"
        />
        
        {/* Sheet 2: The Strategy (Middle) - Rotated Right */}
        <rect 
          x="40" y="25" width="40" height="55" 
          rx="3" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeOpacity="0.3"
          transform="rotate(12 50 50)"
          className="dark:stroke-white/50"
        />

        {/* Sheet 3: The Execution (Front) - Centered & Bold */}
        <rect 
          x="30" y="22" width="40" height="56" 
          rx="3" 
          fill="black"
          fillOpacity="0.1"
          stroke="currentColor" 
          strokeWidth="3" 
          className="dark:stroke-white/100"
        />

        {/* The Occult Axis - The point where they meet */}
        <g filter="url(#glow)" className="group-hover:translate-y-1 transition-transform">
           {/* The Core Pillar */}
           <path 
             d="M50 35 V75" 
             stroke="url(#glow-orange)" 
             strokeWidth="4" 
             strokeLinecap="round"
             className="drop-shadow-[0_0_10px_rgba(234,88,12,0.5)]"
           />
           
           {/* Digital Seal (Central) */}
           <rect 
             x="46" y="52" width="8" height="8" 
             rx="1.5"
             fill="#f97316"
             transform="rotate(45 50 56)"
             className="animate-pulse"
           />
        </g>

        {/* Signature Sparks */}
        <circle cx="35" cy="70" r="1.5" fill="currentColor" opacity="0.4" />
        <circle cx="65" cy="70" r="1.5" fill="currentColor" opacity="0.4" />
      </g>
    </svg>
  )
}
