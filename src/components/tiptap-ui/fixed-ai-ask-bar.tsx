"use client"

import { useCallback, useRef, useState, useContext } from "react"
import { EditorContext } from "@tiptap/react"
import { AiSparklesIcon } from "../tiptap-icons/ai-sparkles-icon"
import { ArrowUpIcon } from "../tiptap-icons/arrow-up-icon"
import { StopCircle2Icon } from "../tiptap-icons/stop-circle-2-icon"
import { Button } from "../ui/button"
import { useUiEditorState } from "../../hooks/use-ui-editor-state"
import { TextareaAutosize } from "../tiptap-ui-primitive/textarea-autosize"
import { getContextAndInsertAt } from "./ai-menu/ai-menu-utils"

export function FixedAiAskBar() {
  const { editor } = useContext(EditorContext)!
  const [prompt, setPrompt] = useState("")
  const { aiGenerationIsLoading } = useUiEditorState(editor)

  const handleSubmit = useCallback(() => {
    if (!editor || !prompt.trim() || aiGenerationIsLoading) return

    const { context } = getContextAndInsertAt(editor)
    const promptWithContext = context ? `${context}\n\n${prompt}` : prompt

    ;(editor.chain() as any)
      .aiTextPrompt({
        text: promptWithContext,
        insert: true,
        stream: true,
        tone: "professional",
        format: "rich-text",
      })
      .run()
    
    setPrompt("")
  }, [editor, prompt, aiGenerationIsLoading])

  const handleStop = useCallback(() => {
    if (!editor) return
    ;(editor.chain() as any).aiReject({ type: "reset" }).run()
    ;(editor.commands as any).resetUiState()
  }, [editor])

  if (!editor) return null

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4">
      <div className="relative group">
        {/* Glow Effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-amber-600 rounded-full blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
        
        <div className="relative flex items-center bg-zinc-950 border border-zinc-800 rounded-full pl-6 pr-2 py-2 shadow-2xl backdrop-blur-xl">
          <AiSparklesIcon className="w-5 h-5 text-orange-500 shrink-0 mr-3 animate-pulse" />
          
          <TextareaAutosize
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit()
              }
            }}
            placeholder="Invoque o poder da IA Lilith..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-zinc-200 placeholder:text-zinc-600 resize-none max-h-32 py-1 outline-none"
          />

          {aiGenerationIsLoading ? (
            <Button 
              onClick={handleStop}
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 rounded-full text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <StopCircle2Icon className="w-5 h-5" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              disabled={!prompt.trim()}
              className="h-9 w-9 rounded-full bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-900/20 disabled:opacity-50 disabled:bg-zinc-800"
            >
              <ArrowUpIcon className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
