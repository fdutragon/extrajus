"use client"

import { Button } from "@/components/ui/button"
import { useVoiceAgent } from "@/hooks/use-voice-agent"
import { Mic, MicOff, Loader2, Volume2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function VoiceButton() {
  const { state, startConversation, stopConversation, error } = useVoiceAgent()

  const isIdle = state === 'idle'
  const isListening = state === 'listening'
  const isSpeaking = state === 'speaking'
  const isProcessing = state === 'processing'

  return (
    <div className="flex flex-col items-center gap-4">
      <Button
        onClick={isIdle ? startConversation : stopConversation}
        disabled={isProcessing}
        size="lg"
        className={cn(
          "relative h-24 w-24 rounded-full transition-all duration-500 hover:scale-105 border border-white/10 shadow-[0_0_40px_-10px_rgba(255,255,255,0.1)]",
          isIdle && "bg-black/80 hover:bg-black hover:shadow-[0_0_60px_-10px_rgba(255,255,255,0.2)] text-white",
          isListening && "bg-red-950/80 border-red-500/50 shadow-[0_0_80px_-15px_rgba(220,38,38,0.4)] animate-pulse text-red-500",
          isSpeaking && "bg-white text-black shadow-[0_0_100px_-10px_rgba(255,255,255,0.6)] animate-pulse",
          isProcessing && "bg-black/50 text-white/50"
        )}
      >
        {isIdle && <Mic className="w-8 h-8" />}
        {isListening && <Mic className="w-8 h-8" />}
        {isSpeaking && <Volume2 className="w-8 h-8" />}
        {isProcessing && <Loader2 className="w-8 h-8 animate-spin" />}
        
        {/* Ring animations */}
        {(isListening || isSpeaking) && (
          <div className="absolute inset-0 rounded-full border border-current opacity-30 animate-ping" />
        )}
      </Button>

      <div className="h-6 text-sm font-medium tracking-widest uppercase opacity-70">
        {isIdle && "Iniciar Atendimento por Voz"}
        {isProcessing && "Conectando ao Motor..."}
        {isListening && "Escutando..."}
        {isSpeaking && "Lilith Falando..."}
      </div>

      {error && (
        <div className="text-red-500 text-xs mt-2 max-w-xs text-center">
          {error}
        </div>
      )}
    </div>
  )
}
