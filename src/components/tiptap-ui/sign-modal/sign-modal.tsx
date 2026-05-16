"use client"

import { useState } from "react"
import { useTiptapEditor } from "../../../hooks/use-tiptap-editor"
import { Button } from "../../../components/tiptap-ui-primitive/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileSignature, Trash2, Send, ShieldCheck, UserPlus, Fingerprint, Zap, Plus } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function SignModal() {
  const { editor } = useTiptapEditor()
  const searchParams = useSearchParams()
  const contractId = searchParams.get("room")
  
  const [signers, setSigners] = useState([{ name: "", email: "" }])
  const [isSending, setIsSending] = useState(false)
  const [open, setOpen] = useState(false)

  const addSigner = () => {
    setSigners([...signers, { name: "", email: "" }])
    toast("Novo elo adicionado ao pacto.", {
      icon: <UserPlus size={14} className="text-primary" />,
    });
  }
  
  const removeSigner = (index: number) => {
    if (signers.length > 1) {
      setSigners(signers.filter((_, i) => i !== index))
    }
  }

  const updateSigner = (index: number, field: "name" | "email", value: string) => {
    const newSigners = [...signers]
    newSigners[index][field] = value
    setSigners(newSigners)
  }

  const handleSign = async () => {
    if (!editor) return;
    const validSigners = signers.filter((s) => s.email && s.name);
    if (validSigners.length === 0) {
      toast.error("Ritual incompleto. Adicione signatários válidos.");
      return;
    }

    setIsSending(true);
    const ritualToast = toast.loading("Consagrando documento...");

    try {
      const response = await fetch("/api/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractId,
          title: "Contrato de Guerra - ExtraJus",
          content: editor.getHTML(),
          signers: validSigners,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Pacto Selado. Os signatários foram convocados.", { id: ritualToast });
        setOpen(false);
      } else {
        toast.error(`Falha no Ritual: ${data.error}`, { id: ritualToast });
      }
    } catch (e) {
      toast.error("Erro na rede neural de selamento.", { id: ritualToast });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="h-8 rounded-full bg-primary text-primary-foreground hover:opacity-90 font-black text-[8px] uppercase tracking-wider px-4 transition-all active:scale-95 flex items-center gap-2 border-none">
            <Fingerprint size={12} />
            Selar Pacto
          </Button>
        }
      />
      
      <DialogContent className="sm:max-w-[480px] bg-background border-border text-foreground rounded-3xl shadow-2xl p-0 overflow-hidden ring-1 ring-border animate-in zoom-in-95 duration-300">
        <div className="relative p-0 flex flex-col h-full max-h-[90vh]">
          {/* Top Decorative bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
          
          <div className="p-8 pb-4 flex flex-col gap-8">
            <DialogHeader className="text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <DialogTitle className="text-xl font-black tracking-tighter italic flex items-center gap-2">
                    <span className="text-primary">Pacto</span> ExtraJus
                  </DialogTitle>
                  <DialogDescription className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
                    Defina os guardiões que selarão este ritual.
                  </DialogDescription>
                </div>
                <div className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 flex items-center gap-2 self-start sm:self-center shrink-0">
                   <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                   <span className="text-[8px] font-black uppercase tracking-wider text-primary whitespace-nowrap">Criptografia Ativa</span>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar max-h-[350px]">
              {signers.map((signer, index) => (
                <div key={index} className="group relative">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <div className="w-4 h-px bg-border" /> Membro {index + 1}
                    </span>
                    {signers.length > 1 && (
                      <button 
                        onClick={() => removeSigner(index)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-3">Guardião Legal</Label>
                      <Input
                        placeholder="Nome completo..."
                        value={signer.name}
                        onChange={(e) => updateSigner(index, "name", e.target.value)}
                        className="bg-muted/30 border-border focus:border-primary/40 focus:bg-muted/50 rounded-xl px-4 h-11 text-xs font-bold tracking-tight placeholder:text-muted-foreground/50 transition-all focus:ring-4 focus:ring-primary/5"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-3">E-mail Seguro</Label>
                      <Input
                        type="email"
                        placeholder="email@vault.com"
                        value={signer.email}
                        onChange={(e) => updateSigner(index, "email", e.target.value)}
                        className="bg-muted/30 border-border focus:border-primary/40 focus:bg-muted/50 rounded-xl px-4 h-11 text-xs font-bold tracking-tight placeholder:text-muted-foreground/50 transition-all focus:ring-4 focus:ring-primary/5"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <button 
                onClick={addSigner}
                className="w-full py-4 rounded-xl border border-dashed border-border hover:border-primary/40 hover:bg-muted/20 transition-all flex items-center justify-center gap-3 group"
              >
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center border border-border group-hover:border-primary/30 transition-all">
                  <Plus size={12} className="text-muted-foreground group-hover:text-primary" />
                </div>
                <span className="text-[10px] font-bold text-muted-foreground group-hover:text-foreground uppercase tracking-widest">Expandir Protocolo</span>
              </button>
            </div>
          </div>

          <DialogFooter className="p-8 pt-2 mt-auto">
            <div className="w-full flex flex-col gap-6">
              <div className="flex items-center justify-between text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1 mt-6">
                 <span className="flex items-center gap-2"><ShieldCheck size={12} className="text-primary" /> Validado AES-256</span>
                 <span className="flex items-center gap-2"><Zap size={12} className="text-blue-500" /> Despacho Instantâneo</span>
              </div>

              <Button 
                onClick={handleSign}
                disabled={isSending}
                className={cn(
                  "w-full h-16 rounded-[1.25rem] font-black text-xs uppercase tracking-[0.4em] transition-all relative overflow-hidden group",
                  isSending 
                    ? "bg-muted text-muted-foreground cursor-not-allowed" 
                    : "bg-primary text-primary-foreground hover:opacity-90"
                )}
              >
                {isSending ? (
                  <span className="flex items-center gap-3 animate-pulse">
                    Consagrando...
                  </span>
                ) : (
                  <span className="flex items-center gap-3">
                    Selar Pacto <Send size={16} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </span>
                )}
                {/* Glow effect on hover */}
                {!isSending && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 -translate-x-full group-hover:animate-shimmer" />
                )}
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
