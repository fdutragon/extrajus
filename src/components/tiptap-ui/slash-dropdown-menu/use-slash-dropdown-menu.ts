"use client"

import { useCallback } from "react"
import type { Editor } from "@tiptap/react"

// --- Icons ---
import { HeadingOneIcon } from "../../../components/tiptap-icons/heading-one-icon"
import { HeadingTwoIcon } from "../../../components/tiptap-icons/heading-two-icon"
import { HeadingThreeIcon } from "../../../components/tiptap-icons/heading-three-icon"
import { ImageIcon } from "../../../components/tiptap-icons/image-icon"
import { ListIcon } from "../../../components/tiptap-icons/list-icon"
import { ListOrderedIcon } from "../../../components/tiptap-icons/list-ordered-icon"
import { BlockquoteIcon } from "../../../components/tiptap-icons/blockquote-icon"
import { AiSparklesIcon } from "../../../components/tiptap-icons/ai-sparkles-icon"
import { MinusIcon } from "../../../components/tiptap-icons/minus-icon"
import { TypeIcon } from "../../../components/tiptap-icons/type-icon"
import { TableIcon } from "../../../components/tiptap-icons/table-icon"
import { ListIndentedIcon } from "../../../components/tiptap-icons/list-indented-icon"

// --- Lib ---
import {
  isExtensionAvailable,
  isNodeInSchema,
} from "../../../lib/tiptap-utils"
import {
  findSelectionPosition,
  hasContentAbove,
} from "../../../lib/tiptap-advanced-utils"

// --- Tiptap UI ---
import type { SuggestionItem } from "../../../components/tiptap-ui-utils/suggestion-menu"

export interface SlashMenuConfig {
  enabledItems?: SlashMenuItemType[]
  customItems?: SuggestionItem[]
  itemGroups?: {
    [key in SlashMenuItemType]?: string
  }
  showGroups?: boolean
}

const texts = {
  // AI
  continue_writing: {
    title: "Continuar Redigindo",
    subtext: "Continuar a redação a partir da posição atual",
    keywords: ["continuar", "escrever", "redigir", "ai"],
    badge: AiSparklesIcon,
    group: "IA Jurídica",
  },
  ai_ask_button: {
    title: "Consultar Lilith",
    subtext: "Gerar conteúdo ou cláusula com Inteligência Artificial",
    keywords: ["ia", "lilith", "gerar", "cláusula"],
    badge: AiSparklesIcon,
    group: "IA Jurídica",
  },

  // Style
  text: {
    title: "Texto Padrão",
    subtext: "Parágrafo de texto regular",
    keywords: ["p", "paragrafo", "texto"],
    badge: TypeIcon,
    group: "Estrutura",
  },
  heading_1: {
    title: "Título 1",
    subtext: "Título de seção principal",
    keywords: ["h", "titulo1", "h1"],
    badge: HeadingOneIcon,
    group: "Estrutura",
  },
  heading_2: {
    title: "Título 2",
    subtext: "Título de subseção",
    keywords: ["h2", "titulo2"],
    badge: HeadingTwoIcon,
    group: "Estrutura",
  },
  heading_3: {
    title: "Título 3",
    subtext: "Título de grupo menor",
    keywords: ["h3", "titulo3"],
    badge: HeadingThreeIcon,
    group: "Estrutura",
  },
  bullet_list: {
    title: "Lista de Marcadores",
    subtext: "Lista não ordenada",
    keywords: ["ul", "li", "lista", "marcadores"],
    badge: ListIcon,
    group: "Estrutura",
  },
  ordered_list: {
    title: "Lista Numerada",
    subtext: "Lista com itens ordenados",
    keywords: ["ol", "li", "lista", "numerada"],
    badge: ListOrderedIcon,
    group: "Estrutura",
  },
  quote: {
    title: "Citação",
    subtext: "Bloco de citação destacada",
    keywords: ["citacao", "quote", "blockquote"],
    badge: BlockquoteIcon,
    group: "Estrutura",
  },

  // Insert
  table: {
    title: "Tabela",
    subtext: "Inserir tabela estruturada",
    aliases: ["tabela", "inserirTabela"],
    badge: TableIcon,
    group: "Inserir",
  },
  divider: {
    title: "Separador",
    subtext: "Linha horizontal para separar conteúdo",
    keywords: ["hr", "linha", "separador"],
    badge: MinusIcon,
    group: "Inserir",
  },
  toc: {
    title: "Índice",
    subtext: "Inserir sumário dinâmico",
    keywords: ["indice", "sumario", "toc"],
    badge: ListIndentedIcon,
    group: "Inserir",
  },

  // Upload
  image: {
    title: "Imagem",
    subtext: "Anexar imagem ao documento",
    keywords: [
      "imagem",
      "upload",
      "img",
      "foto",
    ],
    badge: ImageIcon,
    group: "Anexos",
  },
}

export type SlashMenuItemType = keyof typeof texts

const getItemImplementations = () => {
  return {
    // AI
    continue_writing: {
      check: (editor: Editor) => {
        const { hasContent } = hasContentAbove(editor)
        const extensionsReady = isExtensionAvailable(editor, [
          "ai",
          "aiAdvanced",
        ])
        return extensionsReady && hasContent
      },
      action: ({ editor }: { editor: Editor }) => {
        const editorChain = editor.chain().focus()

        const nodeSelectionPosition = findSelectionPosition({ editor })

        if (nodeSelectionPosition !== null) {
          editorChain.setNodeSelection(nodeSelectionPosition)
        }

        editorChain.run()

        ;(editor.chain() as any).focus().aiGenerationShow().run()

        requestAnimationFrame(() => {
          const { hasContent, content } = hasContentAbove(editor)

          const snippet =
            content.length > 500 ? `...${content.slice(-500)}` : content

          const prompt = hasContent
            ? `Context: ${snippet}\n\nContinue writing from where the text above ends. Write ONLY ONE SENTENCE. DONT REPEAT THE TEXT.`
            : "Start writing a new paragraph. Write ONLY ONE SENTENCE."

          ;(editor.chain() as any)
            .focus()
            .aiTextPrompt({
              stream: true,
              format: "rich-text",
              text: prompt,
            })
            .run()
        })
      },
    },
    ai_ask_button: {
      check: (editor: Editor) =>
        isExtensionAvailable(editor, ["ai", "aiAdvanced"]),
      action: ({ editor }: { editor: Editor }) => {
        const editorChain = editor.chain().focus()

        const nodeSelectionPosition = findSelectionPosition({ editor })

        if (nodeSelectionPosition !== null) {
          editorChain.setNodeSelection(nodeSelectionPosition)
        }

        editorChain.run()

        ;(editor.chain() as any).focus().aiGenerationShow().run()
      },
    },

    // Style
    text: {
      check: (editor: Editor) => isNodeInSchema("paragraph", editor),
      action: ({ editor }: { editor: Editor }) => {
        editor.chain().focus().setParagraph().run()
      },
    },
    heading_1: {
      check: (editor: Editor) => isNodeInSchema("heading", editor),
      action: ({ editor }: { editor: Editor }) => {
        editor.chain().focus().toggleHeading({ level: 1 }).run()
      },
    },
    heading_2: {
      check: (editor: Editor) => isNodeInSchema("heading", editor),
      action: ({ editor }: { editor: Editor }) => {
        editor.chain().focus().toggleHeading({ level: 2 }).run()
      },
    },
    heading_3: {
      check: (editor: Editor) => isNodeInSchema("heading", editor),
      action: ({ editor }: { editor: Editor }) => {
        editor.chain().focus().toggleHeading({ level: 3 }).run()
      },
    },
    bullet_list: {
      check: (editor: Editor) => isNodeInSchema("bulletList", editor),
      action: ({ editor }: { editor: Editor }) => {
        editor.chain().focus().toggleBulletList().run()
      },
    },
    ordered_list: {
      check: (editor: Editor) => isNodeInSchema("orderedList", editor),
      action: ({ editor }: { editor: Editor }) => {
        editor.chain().focus().toggleOrderedList().run()
      },
    },
    quote: {
      check: (editor: Editor) => isNodeInSchema("blockquote", editor),
      action: ({ editor }: { editor: Editor }) => {
        editor.chain().focus().toggleBlockquote().run()
      },
    },

    // Insert
    divider: {
      check: (editor: Editor) => isNodeInSchema("horizontalRule", editor),
      action: ({ editor }: { editor: Editor }) => {
        editor.chain().focus().setHorizontalRule().run()
      },
    },
    toc: {
      check: (editor: Editor) => isNodeInSchema("tocNode", editor),
      action: ({ editor }: { editor: Editor }) => {
        editor.chain().focus().insertTocNode().run()
      },
    },
    table: {
      check: (editor: Editor) => isNodeInSchema("table", editor),
      action: ({ editor }: { editor: Editor }) => {
        editor
          .chain()
          .focus()
          .insertTable({
            rows: 3,
            cols: 3,
            withHeaderRow: false,
          })
          .run()
      },
    },

    // Upload
    image: {
      check: (editor: Editor) => isNodeInSchema("image", editor),
      action: ({ editor }: { editor: Editor }) => {
        editor
          .chain()
          .focus()
          .insertContent({
            type: "imageUpload",
          })
          .run()
      },
    },
  }
}

function organizeItemsByGroups(
  items: SuggestionItem[],
  showGroups: boolean
): SuggestionItem[] {
  if (!showGroups) {
    return items.map((item) => ({ ...item, group: "" }))
  }

  const groups: { [groupLabel: string]: SuggestionItem[] } = {}

  // Group items
  items.forEach((item) => {
    const groupLabel = item.group || ""
    if (!groups[groupLabel]) {
      groups[groupLabel] = []
    }
    groups[groupLabel].push(item)
  })

  // Flatten groups in order (this maintains the visual order for keyboard navigation)
  const organizedItems: SuggestionItem[] = []
  Object.entries(groups).forEach(([, groupItems]) => {
    organizedItems.push(...groupItems)
  })

  return organizedItems
}

/**
 * Custom hook for slash dropdown menu functionality
 */
export function useSlashDropdownMenu(config?: SlashMenuConfig) {
  const getSlashMenuItems = useCallback(
    (editor: Editor) => {
      const items: SuggestionItem[] = []

      const enabledItems =
        config?.enabledItems || (Object.keys(texts) as SlashMenuItemType[])
      const showGroups = config?.showGroups !== false

      const itemImplementations = getItemImplementations()

      enabledItems.forEach((itemType) => {
        const itemImpl = itemImplementations[itemType]
        const itemText = texts[itemType]

        if (itemImpl && itemText && itemImpl.check(editor)) {
          const item: SuggestionItem = {
            onSelect: ({ editor }) => itemImpl.action({ editor }),
            ...itemText,
          }

          if (config?.itemGroups?.[itemType]) {
            item.group = config.itemGroups[itemType]
          } else if (!showGroups) {
            item.group = ""
          }

          items.push(item)
        }
      })

      if (config?.customItems) {
        items.push(...config.customItems)
      }

      // Reorganize items by groups to ensure keyboard navigation works correctly
      return organizeItemsByGroups(items, showGroups)
    },
    [config]
  )

  return {
    getSlashMenuItems,
    config,
  }
}
