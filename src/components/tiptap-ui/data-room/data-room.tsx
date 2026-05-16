"use client"

import { useEffect, useState } from "react"
import { useEditor, EditorContent, Editor } from "@tiptap/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Database, Zap, Plus, Check } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface DataRoomProps {
  editor: Editor | null
}

export function DataRoom({ editor }: DataRoomProps) {
  const [variables, setVariables] = useState<string[]>([])
  const [values, setValues] = useState<Record<string, string>>({})
  const [isAdding, setIsAdding] = useState(false)
  const [newVarName, setNewVarName] = useState("")

  // Scan document for variable nodes
  useEffect(() => {
    if (!editor) return

    const scanVariables = () => {
      const vars: Set<string> = new Set()
      editor.state.doc.descendants((node) => {
        if (node.type.name === 'variable') {
          vars.add(node.attrs.name)
        }
      })
      setVariables(Array.from(vars))
    }

    scanVariables()
    editor.on('update', scanVariables)
    return () => { editor.off('update', scanVariables) }
  }, [editor])

  const handleUpdateVariable = (name: string, value: string) => {
    setValues(prev => ({ ...prev, [name]: value }))
  }

  const applyToAll = (name: string) => {
    if (!editor) return
    const value = values[name]
    if (!value) {
      toast.error("Defina um valor para injetar.")
      return
    }

    const ranges: { from: number; to: number }[] = []
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'variable' && node.attrs.name === name) {
        ranges.push({ from: pos, to: pos + node.nodeSize })
      }
    })

    if (ranges.length === 0) {
      toast.error("Nenhuma instância desta variável encontrada.")
      return
    }

    const chain = editor.chain().focus()
    // Apply in reverse to maintain position integrity
    ranges.reverse().forEach(range => {
      chain.insertContentAt(range, value)
    })
    chain.run()

    toast.success(`Protocolo executado: ${ranges.length} campo(s) preenchido(s).`, {
      icon: <Zap size={14} className="text-blue-500" />
    })
  }

  const insertNewVariable = () => {
    if (newVarName && editor) {
      ;(editor.chain().focus() as any).insertVariable(newVarName).run()
      setNewVarName("")
      setIsAdding(false)
      toast.success(`Variável {{${newVarName}}} inserida no ritual.`)
    }
  }

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600/10 flex items-center justify-center border border-blue-600/20 shadow-xl shadow-blue-600/5">
            <Database size={18} className="text-blue-500" />
          </div>
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-800 dark:text-zinc-200">Data Room</h3>
            <div className="flex items-center gap-1.5 mt-0.5 opacity-60">
               <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
               <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">Ritual Ativo</span>
            </div>
          </div>
        </div>
        <Button 
          size="icon" 
          variant="ghost" 
          className={cn(
            "h-8 w-8 rounded-xl transition-all",
            isAdding ? "bg-red-500/10 text-red-500 rotate-45" : "hover:bg-blue-600/10 text-blue-500"
          )} 
          onClick={() => setIsAdding(!isAdding)}
        >
          <Plus size={16} />
        </Button>
      </div>

      {isAdding && (
        <div className="p-4 rounded-2xl bg-blue-600/5 border border-blue-500/20 animate-in slide-in-from-top-2 duration-300">
          <p className="text-[8px] font-black uppercase tracking-widest text-blue-500 mb-2 ml-1">Novo Elo</p>
          <div className="flex gap-2">
            <input
              autoFocus
              placeholder="ex: cliente_nome"
              value={newVarName}
              onChange={(e) => setNewVarName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && insertNewVariable()}
              className="flex-1 bg-black/20 border-white/5 rounded-lg px-3 h-8 text-[10px] font-bold outline-none placeholder:text-zinc-700"
            />
            <Button size="icon" className="h-8 w-8 rounded-lg bg-blue-600 hover:bg-blue-700" onClick={insertNewVariable}>
              <Check size={14} />
            </Button>
          </div>
        </div>
      )}

      <ScrollArea className="flex-1 -mx-2 px-2">
        <div className="space-y-4">
          {variables.length === 0 ? (
            <div className="py-16 text-center opacity-30">
              <div className="w-12 h-12 rounded-full border border-dashed border-zinc-500/30 flex items-center justify-center mx-auto mb-4">
                 <Database size={16} className="text-zinc-500" />
              </div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em]">Célula Vazia</p>
            </div>
          ) : (
            variables.map((v) => (
              <div key={v} className="relative group space-y-3 p-4 rounded-2xl bg-white/[0.01] border border-white/5 hover:border-blue-500/30 transition-all duration-500">
                <div className="flex items-center justify-between gap-2 overflow-hidden">
                  <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest italic truncate flex-1">
                    {"{{"}{v}{"}}"}
                  </span>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-6 px-2 rounded-md text-[8px] font-black uppercase tracking-widest bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white transition-all opacity-0 group-hover:opacity-100 shrink-0" 
                    onClick={() => applyToAll(v)}
                  >
                    <Zap size={10} className="mr-1" /> Injetar
                  </Button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={`Valor...`}
                    value={values[v] || ""}
                    onChange={(e) => handleUpdateVariable(v, e.target.value)}
                    className="w-full bg-transparent border-0 border-b border-white/5 focus:border-blue-500/50 text-[11px] font-bold tracking-tight focus:ring-0 p-0 placeholder:text-zinc-800 transition-all"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <div className="pt-6 border-t border-white/[0.05]">
        <div className="p-4 bg-blue-600/[0.02] border border-blue-500/10 rounded-xl italic text-[9px] text-zinc-500 leading-relaxed group">
          <Zap size={12} className="text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
          &quot;Dados injetados com precisão cirúrgica.&quot;
        </div>
      </div>
    </div>
  )
}
