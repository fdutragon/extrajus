import { VoiceButton } from "@/components/voice-interaction/voice-button"
import { ShieldCheck, BrainCircuit, FileText } from "lucide-react"
import { Logo } from "@/components/ui/logo"

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050507] text-muted-foreground flex flex-col items-center justify-center relative overflow-hidden font-sans selection:bg-yellow-500/20">
      {/* Background aesthetics */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(250,204,21,0.06),transparent_65%)] z-0 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] opacity-[0.3] pointer-events-none z-0" />

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center px-4 w-full max-w-4xl mx-auto space-y-12">
        
        {/* Header Section */}
        <div className="space-y-6 flex flex-col items-center">
          <Logo iconSize={48} showText={true} variant="chrome" className="mb-2" />
          
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground leading-none">
            Notificação Extrajudicial <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-yellow-400 to-amber-500 filter drop-shadow-[0_0_15px_rgba(234,179,8,0.1)]">
              Imediata
            </span>
          </h1>
          
          <p className="text-xs md:text-[13px] text-muted-foreground/80 max-w-xl mx-auto leading-relaxed">
            Acione nossa inteligência jurídica por voz. Explique a situação e obtenha uma notificação extrajudicial com poder legal absoluto, formatada e pronta em segundos.
          </p>
        </div>

        {/* Voice Interaction Section */}
        <div className="py-2">
          <VoiceButton />
        </div>

        {/* Features / Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-2xl pt-10 border-t border-border/40">
          <div className="flex flex-col items-center space-y-2 text-center">
            <div className="p-2.5 bg-yellow-500/5 rounded-xl border border-yellow-500/15 text-yellow-600 dark:text-yellow-400">
              <BrainCircuit className="w-5 h-5 stroke-[2]" />
            </div>
            <h3 className="font-bold text-[11.5px] uppercase tracking-wider text-foreground">Inteligência Brutal</h3>
            <p className="text-[11px] text-muted-foreground/80 leading-relaxed max-w-[200px]">Minuta jurídica agressiva e precisa gerada por IA.</p>
          </div>
          <div className="flex flex-col items-center space-y-2 text-center">
            <div className="p-2.5 bg-yellow-500/5 rounded-xl border border-yellow-500/15 text-yellow-600 dark:text-yellow-400">
              <FileText className="w-5 h-5 stroke-[2]" />
            </div>
            <h3 className="font-bold text-[11.5px] uppercase tracking-wider text-foreground">Formato Estrito</h3>
            <p className="text-[11px] text-muted-foreground/80 leading-relaxed max-w-[200px]">Diagramação profissional idêntica à do editor.</p>
          </div>
          <div className="flex flex-col items-center space-y-2 text-center">
            <div className="p-2.5 bg-yellow-500/5 rounded-xl border border-yellow-500/15 text-yellow-600 dark:text-yellow-400">
              <ShieldCheck className="w-5 h-5 stroke-[2]" />
            </div>
            <h3 className="font-bold text-[11.5px] uppercase tracking-wider text-foreground">Execução Imediata</h3>
            <p className="text-[11px] text-muted-foreground/80 leading-relaxed max-w-[200px]">Sem intermediários. Documento liberado na hora.</p>
          </div>
        </div>

      </main>
    </div>
  )
}
