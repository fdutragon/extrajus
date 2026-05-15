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
      {/* Neural Totem - High Contrast Power */}
      <g strokeLinecap="round" strokeLinejoin="round">
        {/* Diamond Frame - WHITE */}
        <path 
          d="M50 15 L80 50 L50 85 L20 50 Z" 
          stroke="white" 
          strokeWidth="3" 
          strokeOpacity="0.8"
          className="transition-all duration-500 group-hover:stroke-orange-500 group-hover:stroke-opacity-100"
        />
        
        {/* Main Vertical Blade - ORANGE */}
        <path 
          d="M50 15 V85" 
          stroke="#f97316" 
          strokeWidth="6" 
          className="transition-all duration-500 group-hover:stroke-orange-400 group-hover:stroke-width-[8px]"
        />

        {/* Horizontal Balance Shards - WHITE */}
        <path d="M35 50 H65" stroke="white" strokeWidth="2" strokeOpacity="0.5" />
        
        {/* Vertex Nodes - ORANGE */}
        <circle cx="50" cy="15" r="3" fill="#f97316" />
        <circle cx="50" cy="85" r="3" fill="#f97316" />
        <circle cx="20" cy="50" r="3" fill="white" fillOpacity="0.8" className="group-hover:fill-orange-500" />
        <circle cx="80" cy="50" r="3" fill="white" fillOpacity="0.8" className="group-hover:fill-orange-500" />

        {/* Central Pulse */}
        <circle 
          cx="50" cy="50" 
          r="5" 
          fill="#f97316" 
          className="animate-ping opacity-40"
        />
        <circle cx="50" cy="50" r="3" fill="#f97316" />
      </g>
    </svg>
  )
}
