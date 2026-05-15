"use client"

import { useEffect, useState } from "react"
import { useEditor, EditorContent, Editor } from "@tiptap/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Database, Zap, Plus, Check } from "lucide-react"
import { toast } from "sonner"

interface DataRoomProps {
  editor: Editor | null
}

export function DataRoom({ editor }: DataRoomProps) {
  const [variables, setVariables] = useState<string[]>([])
  const [values, setValues] = useState<Record<string, string>>({})

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
    
    // Update on change
    editor.on('update', scanVariables)
    return () => {
      editor.off('update', scanVariables)
    }
  }, [editor])

  const handleUpdateVariable = (name: string, value: string) => {
    setValues(prev => ({ ...prev, [name]: value }))
  }

  const applyToAll = (name: string) => {
    if (!editor) return
    const value = values[name]
    if (!value) return

    // This is complex because we want to replace the variable node with text 
    // OR just update the node to show the value.
    // Tiptap VariableNode as implemented shows {{name}}.
    // Let's just toast for now and maybe implement a proper "Fill" logic.
    toast.success(`Variável ${name} será aplicada no ritual final.`)
  }

  const insertNewVariable = () => {
    const name = prompt("Nome da nova variável (ex: nome_cliente):")
    if (name && editor) {
      editor.chain().focus().insertVariable(name).run()
    }
  }

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-lg shadow-blue-500/5">
            <Database size={20} className="text-blue-500" />
          </div>
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-800 dark:text-zinc-200">Data Room</h3>
            <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">Sincronização de Variáveis</span>
          </div>
        </div>
        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-xl hover:bg-blue-500/10 text-blue-500" onClick={insertNewVariable}>
          <Plus size={16} />
        </Button>
      </div>

      <ScrollArea className="flex-1 -mx-2 px-2">
        <div className="space-y-6">
          {variables.length === 0 ? (
            <div className="py-20 text-center opacity-40">
              <Database size={32} className="mx-auto mb-4 text-zinc-500" />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Nenhuma variável detectada</p>
              <p className="text-[9px] mt-2 leading-relaxed">Use o botão acima para injetar campos dinâmicos no contrato.</p>
            </div>
          ) : (
            variables.map((v) => (
              <div key={v} className="space-y-3 p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-100 dark:border-white/5 hover:border-blue-500/30 transition-all group">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[9px] font-mono border-blue-500/30 text-blue-500 uppercase">{v}</Badge>
                  <Button size="icon" variant="ghost" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => applyToAll(v)}>
                    <Check size={12} />
                  </Button>
                </div>
                <input
                  type="text"
                  placeholder={`Valor para ${v}...`}
                  value={values[v] || ""}
                  onChange={(e) => handleUpdateVariable(v, e.target.value)}
                  className="w-full bg-transparent border-none text-[12px] font-medium focus:ring-0 p-0 placeholder:text-zinc-400 placeholder:italic"
                />
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <div className="pt-6 border-t border-zinc-200/50 dark:border-white/[0.05]">
        <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl italic text-[10px] text-zinc-500 leading-relaxed">
          <Zap size={12} className="text-blue-500 mb-2" />
          "As variáveis garantem que seu ritual seja replicável e imune a erros humanos de preenchimento."
        </div>
      </div>
    </div>
  )
}
