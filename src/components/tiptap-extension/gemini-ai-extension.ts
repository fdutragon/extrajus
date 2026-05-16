import { Extension, GlobalAttributes } from "@tiptap/core"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { toast } from "sonner"

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

export const Gemini = Extension.create<GeminiOptions, GeminiStorage>({
  name: "ai",

  addOptions() {
    return {
      apiKey: "",
      model: "gemini-2.5-flash",
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
    const runGemini = async (editor: any, prompt: string) => {
      const { apiKey, model: modelName } = this.options
      
      editor.commands.aiGenerationSetIsLoading(true)
      editor.commands.aiGenerationHasMessage(false)
      this.storage.lastPrompt = prompt
      this.storage.state = "loading"

      if (!apiKey) {
        console.error("Gemini API Key is missing")
        editor.commands.aiGenerationSetIsLoading(false)
        this.storage.state = "error"
        return
      }

      try {
        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: "You are Lilith, a powerful and sophisticated AI assistant for a professional legal contract editor. Your output MUST be strictly valid HTML fragments. RULES: 1. NEVER use Markdown (no **, no #, no ```). 2. NEVER use markdown code blocks. 3. Use ONLY: <p>, <strong>, <em>, <ul>, <li>, <br>. 4. ALWAYS wrap text in <p> tags. 5. NO redundant line breaks. Do not use more than one <br> in a row. 6. NO empty paragraphs (<p></p> or <p><br></p>). 7. Return ONLY the requested content, no conversational filler.",
        }, { apiVersion: "v1beta" })
        
        const result = await model.generateContentStream(prompt)

        let accumulatedText = ""
        const { from } = editor.state.selection
        let hasTriggeredMessage = false

        for await (const chunk of result.stream) {
          const chunkText = chunk.text()
          accumulatedText += chunkText

          const cleanedContent = accumulatedText
            .replace(/^```html\n?/, "")
            .replace(/\n?```$/, "")
            .replace(/\n{2,}/g, "\n")
            .replace(/(<br\s*\/?>\s*){2,}/gi, "<br>")
            .replace(/<p>\s*<\/p>/gi, "")
            .replace(/<p>\s*<br\s*\/?>\s*<\/p>/gi, "")
            .trim()

          this.storage.response = cleanedContent

          if (cleanedContent && !cleanedContent.endsWith('<') && !cleanedContent.endsWith('</')) {
            try {
              editor.chain()
                .insertContentAt({ from, to: editor.state.selection.to }, cleanedContent)
                .run()

              if (!hasTriggeredMessage) {
                editor.commands.aiGenerationHasMessage(true)
                hasTriggeredMessage = true
              }
            } catch (schemaError) {
              // Ignore incomplete HTML fragments during streaming
            }
          }
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

      aiExtend: (options: any) => ({ editor }: any) => {
        const text = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to)
        const prompt = `Extend the following text, maintaining the tone and professional formatting: "${text}"`
        runGemini(editor, prompt)
        return true
      },

      aiShorten: (options: any) => ({ editor }: any) => {
        const text = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to)
        const prompt = `Shorten the following text, making it concise but well-formatted: "${text}"`
        runGemini(editor, prompt)
        return true
      },

      aiSimplify: (options: any) => ({ editor }: any) => {
        const text = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to)
        const prompt = `Simplify the following text to make it easier to understand, using clear HTML structure: "${text}"`
        runGemini(editor, prompt)
        return true
      },

      aiSummarize: (options: any) => ({ editor }: any) => {
        const text = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to)
        const prompt = `Summarize the following text using bullet points (<ul>/<li>) if appropriate: "${text}"`
        runGemini(editor, prompt)
        return true
      },

      aiFixSpellingAndGrammar: (options: any) => ({ editor }: any) => {
        const text = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to)
        const prompt = `Fix spelling and grammar in the following text, preserving all HTML formatting. Return ONLY the corrected HTML fragment: "${text}"`
        runGemini(editor, prompt)
        return true
      },

      aiEmojify: (options: any) => ({ editor }: any) => {
        const text = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to)
        const prompt = `Add relevant emojis to the following text while keeping the HTML structure intact: "${text}"`
        runGemini(editor, prompt)
        return true
      },

      aiComplete: (options: any) => ({ editor }: any) => {
        const text = editor.state.doc.textBetween(0, editor.state.selection.to)
        const prompt = `Based on the preceding content, complete the next sentence or paragraph using proper HTML formatting: "${text}"`
        runGemini(editor, prompt)
        return true
      },

      aiTranslate: (language: any, options: any) => ({ editor }: any) => {
        const text = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to)
        const prompt = `Translate the following text to ${language}, preserving all HTML tags exactly as they are: "${text}"`
        runGemini(editor, prompt)
        return true
      },

      aiAdjustTone: (tone: any, options: any) => ({ editor }: any) => {
        const text = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to)
        const prompt = `Rewrite the following text using a ${tone} tone and structured HTML: "${text}"`
        runGemini(editor, prompt)
        return true
      },

      aiRegenerate: (options: any) => ({ editor }: any) => {
        if (this.storage.lastPrompt) {
          runGemini(editor, this.storage.lastPrompt)
        }
        return true
      },

      aiRephrase: (options: any) => ({ editor }: any) => {
        const text = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to)
        const prompt = `Rephrase the following text to improve clarity and flow, keeping the HTML structure: "${text}"`
        runGemini(editor, prompt)
        return true
      },

      aiAccept: (options: any) => ({ editor }: any) => {
        editor.commands.resetUiState()
        return true
      },

      aiReject: (options: any) => ({ editor }: any) => {
        editor.commands.resetUiState()
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
          const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: "Você é Lilith, uma IA auditora de contratos implacável. Analise o texto e retorne um JSON com uma lista de riscos. Regras:\n1. Identifique cláusulas leoninas, termos ambíguos ou perigosos.\n2. Retorne estritamente um array JSON de objetos.\n3. Formato: [{\"originalText\": \"texto exato encontrado\", \"suggestion\": \"nova redação proposta\", \"reason\": \"explicação do risco\"}]",
          }, { apiVersion: "v1" })

          try {
            const prompt = `Analise este contrato e aponte os riscos:\n\n${text}`
            const result = await model.generateContent(prompt)
            const responseText = result.response.text()
            
            const jsonMatch = responseText.match(/\[[\s\S]*\]/)
            if (jsonMatch) {
              try {
                const auditData = JSON.parse(jsonMatch[0])
                this.storage.auditResults = Array.isArray(auditData) ? auditData.map((item: any) => ({
                  ...item,
                  id: Math.random().toString(36).substring(7)
                })) : []
              } catch (e) {
                console.error("Audit JSON parse error:", e)
                this.storage.auditResults = []
              }
            } else {
              this.storage.auditResults = []
            }
            this.storage.state = "idle"
            editor.view.dispatch(editor.state.tr.setMeta('aiAuditCompleted', true))
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
