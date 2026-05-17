import { Extension } from "@tiptap/core"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { toast } from "sonner"
import { sanitiseAiHtml, sanitiseAiHtmlStream, isIncompleteHtmlFragment } from "@/lib/ai-html-sanitizer"

export type Language =
  | "en" | "ko" | "zh" | "ja" | "es" | "ru" | "fr" | "pt" | "de" | "it" | "nl" | "id" | "vi" | "tr" | "ar"

export type Tone =
  | "academic" | "business" | "casual" | "childfriendly" | "confident"
  | "conversational" | "creative" | "emotional" | "excited" | "formal"
  | "friendly" | "funny" | "humorous" | "informative" | "inspirational"
  | "memeify" | "narrative" | "objective" | "persuasive" | "poetic" | "professional" | "serious" | "technical"

export interface TextOptions {
  tone?: Tone
  language?: Language
  insertAt?: any
  stream?: boolean
  format?: "rich-text" | "text"
  text?: string
  regenerate?: boolean
}

export interface GeminiOptions {
  apiKey: string
  model: string
}

export interface AiTextPromptOptions extends TextOptions {
  text: string
  insert?: boolean
}

export interface AuditResult {
  originalText: string
  suggestion: string
  reason: string
  id: string
}

export interface GeminiStorage {
  lastPrompt: string
  generatedWith: any
  response: string
  state: "idle" | "loading" | "error"
  auditResults: AuditResult[]
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    aiTextPrompt: (options: string | AiTextPromptOptions) => ReturnType
    aiAccept: (options?: any) => ReturnType
    aiReject: (options?: any) => ReturnType
    aiExtend: (options?: TextOptions) => ReturnType
    aiShorten: (options?: TextOptions) => ReturnType
    aiSimplify: (options?: TextOptions) => ReturnType
    aiSummarize: (options?: TextOptions) => ReturnType
    aiFixSpellingAndGrammar: (options?: TextOptions) => ReturnType
    aiEmojify: (options?: TextOptions) => ReturnType
    aiComplete: (options?: TextOptions) => ReturnType
    aiTranslate: (language: Language, options?: TextOptions) => ReturnType
    aiAdjustTone: (tone: Tone, options?: TextOptions) => ReturnType
    aiRegenerate: (options?: TextOptions) => ReturnType
    aiRephrase: (options?: TextOptions) => ReturnType
    aiAuditRisk: () => ReturnType
  }

  interface Storage {
    ai: GeminiStorage
    aiAdvanced: GeminiStorage
  }
}

const SYSTEM_INSTRUCTION = `Você é LILITH, a Inteligência Artificial Soberana do ExtraJus. Sua função é redigir, analisar e blindar contratos jurídicos com precisão cirúrgica.

REGRAS DE FORMATAÇÃO (OBRIGATÓRIAS):
1. Use APENAS HTML. NUNCA use Markdown.
2. Título principal centralizado: <h1 style="text-align: center"><strong>[TÍTULO]</strong></h1>
3. Parágrafos: <p style="text-align: justify">...</p>
4. Hierarquia jurídica via LegalNodes (NUNCA use ul/ol/li):
   Cláusula: <div data-type="legal-node" data-level="1" style="text-align: justify">texto</div>
   Parágrafo: <div data-type="legal-node" data-level="2" style="text-align: justify">texto</div>
   Inciso: <div data-type="legal-node" data-level="3" style="text-align: justify">texto</div>
   Alínea: <div data-type="legal-node" data-level="4" style="text-align: justify">texto</div>
5. NUNCA insira prefixos numéricos manualmente.
6. Partes identificadas em preâmbulo com <p> e <table>. NUNCA crie cláusula "DAS PARTES".
7. Primeira cláusula SEMPRE é o Objeto do contrato.
8. Retorne APENAS o HTML. Sem explicações.`

export const Gemini = Extension.create<GeminiOptions, GeminiStorage>({
  name: "ai",

  addOptions() {
    return {
      apiKey: "",
      model: "gemini-3.1-flash-lite-preview",
    }
  },

  addStorage() {
    return {
      lastPrompt: "",
      generatedWith: null,
      response: "",
      state: "idle",
      auditResults: [],
    }
  },

  addCommands(): any {
    const runGemini = async (editor: any, userPrompt: string) => {
      const { apiKey, model: modelName } = this.options

      editor.commands.aiGenerationSetIsLoading(true)
      editor.commands.aiGenerationHasMessage(false)
      this.storage.lastPrompt = userPrompt
      this.storage.state = "loading"

      if (!apiKey) {
        console.error("Gemini API Key is missing")
        editor.commands.aiGenerationSetIsLoading(false)
        this.storage.state = "error"
        return
      }

      try {
        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel(
          { model: modelName, systemInstruction: SYSTEM_INSTRUCTION },
          { apiVersion: "v1beta" }
        )

        // --- Lê documento completo antes de agir ---
        const currentHtml = editor.getHTML()
        const currentText = (editor.state.doc.textContent || "").trim()
        const isDocEmpty = currentText.length < 5

        let finalPrompt: string

        if (isDocEmpty) {
          // Documento vazio: cria do zero
          finalPrompt = `O documento está vazio. Crie um contrato completo com base nesta solicitação:\n\n${userPrompt}`
        } else {
          // Documento com conteúdo: edição cirúrgica
          finalPrompt = `DOCUMENTO ATUAL (HTML completo):\n${currentHtml}\n\n---\nSOLICITAÇÃO: ${userPrompt}\n\n---\nINSTRUÇÕES CRÍTICAS:\n- Retorne SEMPRE o HTML COMPLETO do documento com a modificação aplicada.\n- Se pede adição: insira no lugar correto mantendo todo o resto intacto.\n- Se pede alteração/revisão: altere SOMENTE o trecho solicitado. O restante permanece idêntico.\n- NUNCA retorne apenas o fragmento isolado.`
        }

        // Snapshot para "Desfazer Ritual"
        const previousContent = currentHtml
        this.storage.generatedWith = { previousContent }

        const result = await model.generateContentStream(finalPrompt)

        let accumulatedText = ""
        let hasTriggeredMessage = false

        for await (const chunk of result.stream) {
          accumulatedText += chunk.text()
          const streamSafeContent = sanitiseAiHtmlStream(accumulatedText)
          this.storage.response = streamSafeContent

          if (streamSafeContent && !isIncompleteHtmlFragment(streamSafeContent)) {
            try {
              editor.commands.setContent(streamSafeContent, false, { preserveWhitespace: false })
              if (!hasTriggeredMessage) {
                editor.commands.aiGenerationHasMessage(true)
                hasTriggeredMessage = true
              }
            } catch (_) { /* ignore incomplete streaming fragments */ }
          }
        }

        // Final deep sanitisation
        const finalContent = sanitiseAiHtml(accumulatedText)
        if (finalContent) {
          editor.commands.setContent(finalContent, false, { preserveWhitespace: false })
        }

        this.storage.state = "idle"
      } catch (error) {
        console.error("Gemini generation failed:", error)
        this.storage.state = "error"
        toast.error("O Oráculo falhou em responder. Verifique sua conexão ou chave de API.")
      } finally {
        editor.commands.aiGenerationSetIsLoading(false)
      }
    }

    return {
      aiTextPrompt: (options: any) => ({ editor }: any) => {
        const promptText = typeof options === "string" ? options : options.text
        runGemini(editor, promptText)
        return true
      },

      // Aceitar: mantém conteúdo atual, limpa snapshot
      aiAccept: (_options: any) => ({ editor }: any) => {
        this.storage.generatedWith = null
        editor.commands.resetUiState()
        return true
      },

      // Desfazer Ritual: restaura snapshot anterior à geração
      aiReject: (_options: any) => ({ editor }: any) => {
        const prev = this.storage.generatedWith?.previousContent
        if (prev) {
          editor.commands.setContent(prev, false, { preserveWhitespace: false })
        }
        this.storage.generatedWith = null
        editor.commands.resetUiState()
        return true
      },

      aiExtend: (_options: any) => ({ editor }: any) => {
        const selected = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to)
        const ctx = selected || editor.state.doc.textContent
        runGemini(editor, `Expanda o seguinte trecho mantendo o tom jurídico profissional:\n\n"${ctx}"`)
        return true
      },

      aiShorten: (_options: any) => ({ editor }: any) => {
        const selected = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to)
        const ctx = selected || editor.state.doc.textContent
        runGemini(editor, `Resuma de forma concisa mantendo a estrutura HTML:\n\n"${ctx}"`)
        return true
      },

      aiSimplify: (_options: any) => ({ editor }: any) => {
        const selected = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to)
        runGemini(editor, `Simplifique para linguagem clara mantendo HTML:\n\n"${selected}"`)
        return true
      },

      aiSummarize: (_options: any) => ({ editor }: any) => {
        const text = editor.state.doc.textContent
        runGemini(editor, `Crie um resumo executivo deste contrato em HTML:\n\n"${text}"`)
        return true
      },

      aiFixSpellingAndGrammar: (_options: any) => ({ editor }: any) => {
        const selected = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to)
        runGemini(editor, `Corrija ortografia e gramática mantendo HTML e estrutura:\n\n"${selected}"`)
        return true
      },

      aiEmojify: (_options: any) => ({ editor }: any) => {
        const selected = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to)
        runGemini(editor, `Adicione emojis relevantes ao texto mantendo HTML:\n\n"${selected}"`)
        return true
      },

      aiComplete: (_options: any) => ({ editor }: any) => {
        const currentHtml = editor.getHTML()
        runGemini(editor, `Continue este contrato a partir do ponto onde parou, mantendo a estrutura:\n\n${currentHtml}`)
        return true
      },

      aiTranslate: (language: any, _options: any) => ({ editor }: any) => {
        const selected = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to)
        runGemini(editor, `Traduza para ${language} preservando todas as tags HTML:\n\n"${selected}"`)
        return true
      },

      aiAdjustTone: (tone: any, _options: any) => ({ editor }: any) => {
        const selected = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to)
        runGemini(editor, `Reescreva com tom ${tone} mantendo HTML estruturado:\n\n"${selected}"`)
        return true
      },

      aiRegenerate: (_options: any) => ({ editor }: any) => {
        if (this.storage.lastPrompt) {
          runGemini(editor, this.storage.lastPrompt)
        }
        return true
      },

      aiRephrase: (_options: any) => ({ editor }: any) => {
        const selected = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to)
        runGemini(editor, `Parafraseie melhorando clareza e fluidez mantendo HTML:\n\n"${selected}"`)
        return true
      },

      aiAuditRisk: () => ({ editor }: any) => {
        const text = editor.state.doc.textContent

        const runAudit = async () => {
          const { apiKey, model: modelName } = this.options
          if (!apiKey) {
            console.error("Gemini API Key is missing")
            return
          }

          this.storage.state = "loading"

          const genAI = new GoogleGenerativeAI(apiKey)
          const auditModel = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: `Você é Lilith, auditora implacável de contratos. Analise e retorne um JSON com riscos.\nFormato estrito: [{"originalText": "texto exato", "suggestion": "nova redação", "reason": "explicação do risco"}]`,
          }, { apiVersion: "v1beta" })

          try {
            const result = await auditModel.generateContent(`Analise este contrato e aponte os riscos:\n\n${text}`)
            const responseText = result.response.text()

            const jsonMatch = responseText.match(/\[[\s\S]*\]/)
            if (jsonMatch) {
              try {
                const auditData = JSON.parse(jsonMatch[0])
                this.storage.auditResults = Array.isArray(auditData)
                  ? auditData.map((item: any) => ({ ...item, id: Math.random().toString(36).substring(7) }))
                  : []
              } catch (e) {
                console.error("Audit JSON parse error:", e)
                this.storage.auditResults = []
              }
            } else {
              this.storage.auditResults = []
            }
            this.storage.state = "idle"
            editor.view.dispatch(editor.state.tr.setMeta("aiAuditCompleted", true))
          } catch (error) {
            console.error("Gemini audit failed:", error)
            this.storage.state = "error"
          }
        }

        runAudit()
        return true
      },
    }
  },
})
