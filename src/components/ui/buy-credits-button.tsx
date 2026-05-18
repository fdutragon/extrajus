"use client"

import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

export function BuyCreditsButton() {
  const handleOpenPlans = () => {
    window.dispatchEvent(new Event("open-plans-modal"))
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleOpenPlans}
      className="mt-3 w-full h-8 gap-1.5 rounded-xl border-primary/20 hover:border-primary/50 bg-primary/5 hover:bg-primary/10 text-primary font-bold text-[9px] uppercase tracking-widest transition-all duration-300 active:scale-[0.98]"
    >
      <Sparkles size={10} className="text-primary animate-pulse" />
      Adquirir Sinapses
    </Button>
  )
}
