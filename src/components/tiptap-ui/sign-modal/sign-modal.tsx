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
import { FileSignature, Plus, Trash2, Send, ShieldCheck, UserPlus } from "lucide-react"

export function SignModal() {
  const { editor } = useTiptapEditor()
  const [signers, setSigners] = useState([{ name: "", email: "" }])
  const [isSending, setIsSending] = useState(false)
  const [open, setOpen] = useState(false)

  const addSigner = () => setSigners([...signers, { name: "", email: "" }])
  
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
    setIsSending(true);

    try {
      const response = await fetch("/api/sign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Contrato de Guerra - ExtraJus",
          content: editor.getHTML(),
          signers: signers.filter((s) => s.email && s.name),
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`Sucesso! Documento enviado para assinatura. ID: ${data.documentId}`);
        setOpen(false);
      } else {
        alert(`Erro ao selar pacto: ${data.error}`);
      }
    } catch (e) {
      alert("Falha crítica na comunicação com o servidor de rituais.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="small" className="h-7 rounded-full bg-orange-600 hover:bg-orange-700 text-white font-black text-[9px] uppercase tracking-widest px-4 shadow-lg shadow-orange-600/20 gap-2 transition-all group">
            <FileSignature size={12} className="transition-transform group-hover:scale-110" />
            <span>Selar Pacto</span>
          </Button>
        }
      />
      
      <DialogContent className="sm:max-w-[450px] bg-black/90 backdrop-blur-2xl border-white/5 text-white rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] p-0 overflow-hidden">
        <div className="relative p-8">
          {/* Subtle Ambient Glow inside modal */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/10 blur-[60px] rounded-full pointer-events-none" />
          
          <DialogHeader className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-orange-600/10 flex items-center justify-center border border-orange-600/20 shadow-lg shadow-orange-600/5">
                <ShieldCheck className="text-orange-500" size={20} />
              </div>
              <div>
                <DialogTitle className="text-xs font-black uppercase tracking-[0.3em] text-orange-500">Ritual de Selamento</DialogTitle>
                <DialogDescription className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest mt-0.5">
                  Consagração de validade jurídica via Assinafy
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {signers.map((signer, index) => (
              <div key={index} className="relative group space-y-4 p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-orange-500/20 transition-all duration-500">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[8px] font-black text-zinc-500 border border-white/5">
                      {index + 1}
                    </div>
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Signatário</span>
                  </div>
                  {signers.length > 1 && (
                    <Button 
                      variant="ghost" 
                      onClick={() => removeSigner(index)} 
                      className="h-6 w-6 p-0 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg"
                    >
                      <Trash2 size={12} />
                    </Button>
                  )}
                </div>

                <div className="grid gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor={`name-${index}`} className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">Nome de Batismo</Label>
                    <Input
                      id={`name-${index}`}
                      placeholder="Nome completo..."
                      value={signer.name}
                      onChange={(e) => updateSigner(index, "name", e.target.value)}
                      className="h-10 bg-black/40 border-white/5 focus:border-orange-500/50 focus:ring-orange-500/20 rounded-xl text-xs font-bold tracking-wide placeholder:text-zinc-700 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`email-${index}`} className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">Portal de Contato (E-mail)</Label>
                    <Input
                      id={`email-${index}`}
                      type="email"
                      placeholder="email@imperio.com"
                      value={signer.email}
                      onChange={(e) => updateSigner(index, "email", e.target.value)}
                      className="h-10 bg-black/40 border-white/5 focus:border-orange-500/50 focus:ring-orange-500/20 rounded-xl text-xs font-bold tracking-wide placeholder:text-zinc-700 transition-all"
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <Button 
              variant="ghost" 
              onClick={addSigner} 
              className="w-full h-12 border-2 border-dashed border-white/5 hover:border-orange-500/30 hover:bg-orange-500/5 rounded-2xl gap-3 transition-all group"
            >
              <UserPlus size={16} className="text-zinc-500 group-hover:text-orange-500 transition-colors" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 group-hover:text-orange-500">Adicionar Signatário</span>
            </Button>
          </div>

          <DialogFooter className="mt-8 pt-6 border-t border-white/5">
            <Button 
              onClick={handleSign} 
              disabled={isSending}
              className="w-full h-14 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-2xl gap-3 shadow-xl shadow-orange-600/20 transition-all active:scale-[0.98] relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:animate-shimmer" />
              {isSending ? (
                <span className="text-[10px] uppercase tracking-[0.3em] animate-pulse">Selando Pacto...</span>
              ) : (
                <>
                  <Send size={18} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  <span className="text-[11px] uppercase tracking-[0.3em]">Disparar Selamento</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
