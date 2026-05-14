"use client"

import { useState } from "react"
import { useTiptapEditor } from "../../../hooks/use-tiptap-editor"
import { Button } from "@/components/ui/button"
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
import { FileSignature, Plus, Trash2, Send } from "lucide-react"

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
    if (!editor) return
    setIsSending(true)

    try {
      const response = await fetch("/api/sign", {
        method: "POST",
        body: JSON.stringify({
          title: "Contrato de Guerra - ExtraJus",
          content: editor.getHTML(),
          signers: signers.filter(s => s.email && s.name)
        }),
      })

      const data = await response.json()
      if (data.success) {
        alert("Contrato disparado com sucesso para Assinafy!")
        setOpen(false)
      } else {
        alert(`Erro: ${data.error}`)
      }
    } catch (e) {
      alert("Falha na conexão com o servidor")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 font-black h-12 rounded-none gap-2">
            <FileSignature className="w-5 h-5" />
            EXPORTAR E ASSINAR
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-zinc-800 text-white rounded-none">
        <DialogHeader>
          <DialogTitle className="text-xl font-black tracking-tighter">DISPARO ASSINAFY</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Configure os signatários que receberão o envelope digital.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {signers.map((signer, index) => (
            <div key={index} className="space-y-3 p-3 border border-zinc-800 bg-zinc-900/50">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-500 uppercase">Signatário {index + 1}</span>
                {signers.length > 1 && (
                  <Button variant="ghost" size="icon" onClick={() => removeSigner(index)} className="h-6 w-6 text-red-500 hover:bg-red-500/10">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`name-${index}`} className="text-xs">Nome Completo</Label>
                <Input
                  id={`name-${index}`}
                  value={signer.name}
                  onChange={(e) => updateSigner(index, "name", e.target.value)}
                  className="rounded-none bg-zinc-950 border-zinc-800"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`email-${index}`} className="text-xs">E-mail</Label>
                <Input
                  id={`email-${index}`}
                  type="email"
                  value={signer.email}
                  onChange={(e) => updateSigner(index, "email", e.target.value)}
                  className="rounded-none bg-zinc-950 border-zinc-800"
                />
              </div>
            </div>
          ))}
          
          <Button variant="outline" onClick={addSigner} className="border-dashed border-zinc-700 rounded-none hover:bg-zinc-900 gap-2">
            <Plus className="w-4 h-4" /> ADICIONAR SIGNATÁRIO
          </Button>
        </div>

        <DialogFooter>
          <Button 
            onClick={handleSign} 
            disabled={isSending}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black h-12 rounded-none gap-2"
          >
            {isSending ? "ENVIANDO..." : <><Send className="w-5 h-5" /> DISPARAR PARA ASSINATURA</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
