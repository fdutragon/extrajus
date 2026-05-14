import { Extension, GlobalAttributes } from "@tiptap/core"
import { GoogleGenerativeAI } from "@google/generative-ai"

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
}

export interface GeminiOptions {
  apiKey: string
  model: string
}

export interface AiTextPromptOptions extends TextOptions {
  text: string
  insert?: boolean
  stream?: boolean
  format?: "rich-text" | "text"
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    aiTextPrompt: (options: string | AiTextPromptOptions) => ReturnType
    aiAccept: () => ReturnType
    aiReject: () => ReturnType
    aiExtend: (options?: TextOptions) => ReturnType
    aiShorten: (options?: TextOptions) => ReturnType
    aiSimplify: (options?: TextOptions) => ReturnType
    aiSummarize: (options?: TextOptions) => ReturnType
    aiFixSpellingAndGrammar: (options?: TextOptions) => ReturnType
    aiEmojify: (options?: TextOptions) => ReturnType
    aiComplete: (options?: TextOptions) => ReturnType
    aiTranslate: (language: Language, options?: TextOptions) => ReturnType
    aiAdjustTone: (tone: Tone, options?: TextOptions) => ReturnType
  }
}

export const Gemini = Extension.create<GeminiOptions>({
  name: "ai",

  addOptions() {
    return {
      apiKey: "",
      model: "gemini-3.1-flash-lite",
    }
  },

  addCommands() {
    const runGemini = async (editor: any, prompt: string) => {
      const { apiKey, model: modelName } = this.options
      if (!apiKey) {
        console.error("Gemini API Key is missing")
        return
      }

      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        systemInstruction: "You are Lilith, a powerful and sophisticated AI assistant for a legal contract editor. Your output MUST be strictly valid HTML fragments. DO NOT use Markdown. DO NOT use code blocks (like ```html). Use <p> for paragraphs, <strong> for bold, <em> for italics, <ul>/<li> for lists, and <br> for line breaks. Do not include <html>, <head>, or <body> tags. Do not explain anything, just return the formatted text.",
      })

      editor.commands.aiGenerationSetIsLoading(true)
      editor.commands.aiGenerationHasMessage(false)

      try {
        const result = await model.generateContentStream(prompt)
        
        let accumulatedText = ""
        let lastInsertedLength = 0

        // We'll track the start position to replace content as it streams
        const { from } = editor.state.selection
        let currentPos = from

        for await (const chunk of result.stream) {
          let chunkText = chunk.text()
          accumulatedText += chunkText

          // Clean up markdown code blocks if the model ignores instructions
          let cleanedContent = accumulatedText
            .replace(/^```html\n?/, "")
            .replace(/\n?```$/, "")
            .trim()

          if (cleanedContent) {
            // Use a command that replaces the content from the start point 
            // to avoid duplicating text and handle HTML properly
            editor.commands.insertContentAt({ from, to: editor.state.selection.to }, cleanedContent)
            editor.commands.aiGenerationHasMessage(true)
          }
        }
      } catch (error) {
        console.error("Gemini generation failed:", error)
      } finally {
        editor.commands.aiGenerationSetIsLoading(false)
      }
    }

    return {
      aiTextPrompt: (options) => ({ editor }) => {
        const promptText = typeof options === "string" ? options : options.text
        runGemini(editor, promptText)
        return true
      },

      aiExtend: (options) => ({ editor }) => {
        const text = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to)
        const prompt = `Extend the following text, maintaining the tone and professional formatting: "${text}"`
        runGemini(editor, prompt)
        return true
      },

      aiShorten: (options) => ({ editor }) => {
        const text = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to)
        const prompt = `Shorten the following text, making it concise but well-formatted: "${text}"`
        runGemini(editor, prompt)
        return true
      },

      aiSimplify: (options) => ({ editor }) => {
        const text = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to)
        const prompt = `Simplify the following text to make it easier to understand, using clear HTML structure: "${text}"`
        runGemini(editor, prompt)
        return true
      },

      aiSummarize: (options) => ({ editor }) => {
        const text = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to)
        const prompt = `Summarize the following text using bullet points (<ul>/<li>) if appropriate: "${text}"`
        runGemini(editor, prompt)
        return true
      },

      aiFixSpellingAndGrammar: (options) => ({ editor }) => {
        const text = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to)
        const prompt = `Fix spelling and grammar in the following text, preserving all HTML formatting. Return ONLY the corrected HTML fragment: "${text}"`
        runGemini(editor, prompt)
        return true
      },

      aiEmojify: (options) => ({ editor }) => {
        const text = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to)
        const prompt = `Add relevant emojis to the following text while keeping the HTML structure intact: "${text}"`
        runGemini(editor, prompt)
        return true
      },

      aiComplete: (options) => ({ editor }) => {
        const text = editor.state.doc.textBetween(0, editor.state.selection.to)
        const prompt = `Based on the preceding content, complete the next sentence or paragraph using proper HTML formatting: "${text}"`
        runGemini(editor, prompt)
        return true
      },

      aiTranslate: (language, options) => ({ editor }) => {
        const text = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to)
        const prompt = `Translate the following text to ${language}, preserving all HTML tags exactly as they are: "${text}"`
        runGemini(editor, prompt)
        return true
      },

      aiAdjustTone: (tone, options) => ({ editor }) => {
        const text = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to)
        const prompt = `Rewrite the following text using a ${tone} tone and structured HTML: "${text}"`
        runGemini(editor, prompt)
        return true
      },

      aiAccept:
        () =>
        ({ editor }) => {
          editor.commands.resetUiState()
          return true
        },

      aiReject:
        () =>
        ({ editor }) => {
          editor.commands.resetUiState()
          return true
        },
    }
  },
})
