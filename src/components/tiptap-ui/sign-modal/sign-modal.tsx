"use client"

import { useState } from "react"
import { useTiptapEditor } from "../../../hooks/use-tiptap-editor"
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

export function SignModal({ title = "Documento Digital" }: { title?: string }) {
  const { editor } = useTiptapEditor()
  const searchParams = useSearchParams()
  const contractId = searchParams.get("room")
  
  const [signers, setSigners] = useState([{ name: "", email: "" }])
  const [isSending, setIsSending] = useState(false)
  const [open, setOpen] = useState(false)

  const addSigner = () => {
    setSigners([...signers, { name: "", email: "" }])
    toast("Novo signatário adicionado.", {
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
      toast.error("Formulário incompleto. Informe os signatários.");
      return;
    }

    setIsSending(true);
    const signToast = toast.loading("Processando protocolo digital...");

    try {
      const response = await fetch("/api/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractId,
          title,
          content: editor.getHTML(),
          signers: validSigners,
        }),
      });

      if (response.status === 403) {
        window.dispatchEvent(new Event("open-plans-modal"));
      }

      const data = await response.json();
      if (data.success) {
        toast.success("Documento enviado. Os signatários foram notificados.", { id: signToast });
        setOpen(false);
      } else {
        toast.error(`Falha no processamento: ${data.error}`, { id: signToast });
      }
    } catch (e) {
      toast.error("Erro no protocolo de assinatura.", { id: signToast });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button className="h-7 max-sm:h-10 rounded-lg border border-primary/20 hover:bg-primary/10 text-primary font-bold text-[9px] uppercase tracking-widest px-3 max-sm:px-4 transition-all active:scale-95 flex items-center gap-2 cursor-pointer">
            <Fingerprint size={12} className="max-sm:scale-[1.5]" />
            <span className="max-sm:hidden">Assinar</span>
            <span className="hidden max-sm:inline ml-1">Assinar</span>
          </button>
        }
      />
      
      <DialogContent className="w-full max-w-[36rem] bg-background border-border text-foreground rounded-3xl shadow-2xl p-0 overflow-hidden ring-1 ring-border animate-in zoom-in-95 duration-300">
        <div className="relative p-0 flex flex-col h-full max-h-[90vh]">
          {/* Top Decorative bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
          
          <div className="p-8 pb-4 flex flex-col gap-8">
            <DialogHeader className="text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <DialogTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
                    <span className="text-primary">Protocolo</span> ExtraJus
                  </DialogTitle>
                </div>
                <div className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 flex items-center gap-2 self-start sm:self-center shrink-0">
                   <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                   <span className="text-[8px] font-black uppercase tracking-wider text-primary whitespace-nowrap">Segurança Ativa</span>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar max-h-[350px]">
              {signers.map((signer, index) => (
                <div key={index} className="group relative">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <div className="w-4 h-px bg-border" /> Signatário {index + 1}
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
                      <Label className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-3">Nome Completo</Label>
                      <Input
                        placeholder="Nome do signatário..."
                        value={signer.name}
                        onChange={(e) => updateSigner(index, "name", e.target.value)}
                        className="bg-muted/30 border-border rounded-xl px-4 h-11 text-xs font-bold tracking-tight placeholder:text-muted-foreground/50 transition-all text-left"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-3">E-mail</Label>
                      <Input
                        type="email"
                        placeholder="E-mail do signatário..."
                        value={signer.email}
                        onChange={(e) => updateSigner(index, "email", e.target.value)}
                        className="bg-muted/30 border-border rounded-xl px-4 h-11 text-xs font-bold tracking-tight placeholder:text-muted-foreground/50 transition-all text-left"
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
                <span className="text-[10px] font-bold text-muted-foreground group-hover:text-foreground uppercase tracking-widest">Adicionar Signatário</span>
              </button>
            </div>
          </div>

          <DialogFooter className="p-8 pt-4 mt-auto bg-muted/30 border-t border-border/50">
            <div className="w-full space-y-6">
              <div className="flex items-center justify-between px-1">
                 <div className="flex items-center gap-2 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                    <ShieldCheck size={12} className="text-primary" />
                    <span>Protocolo Criptografado</span>
                 </div>
                 <div className="flex items-center gap-2 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                    <Zap size={12} className="text-blue-500" />
                    <span>Registro Instantâneo</span>
                 </div>
              </div>

              <div className="flex justify-center">
                <button 
                  onClick={handleSign}
                  disabled={isSending}
                  className={cn(
                    "w-full h-14 rounded-xl font-bold text-sm tracking-tight transition-all duration-300 relative overflow-hidden group flex items-center justify-center border border-primary/20",
                    isSending 
                      ? "bg-muted text-muted-foreground cursor-not-allowed opacity-70" 
                      : "bg-primary text-primary-foreground hover:shadow-[0_0_25px_rgba(var(--primary-rgb),0.3)] hover:border-primary/50 active:scale-[0.98]"
                  )}
                >
                  {isSending ? (
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      <span className="uppercase text-xs tracking-widest font-black">Processando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 relative z-10">
                      <span className="uppercase text-xs tracking-widest font-black">Enviar para Assinatura</span>
                      <Send size={16} className="transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </div>
                  )}
                  
                  {!isSending && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  )}
                </button>
              </div>
              
              <p className="text-[8px] text-center text-muted-foreground/60 uppercase tracking-[0.2em] font-medium">
                Ao prosseguir, você valida o documento sob as normas da ExtraJus S/A
              </p>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
