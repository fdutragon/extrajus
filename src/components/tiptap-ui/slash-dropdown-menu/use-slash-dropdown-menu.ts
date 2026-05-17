"use client"

import { useCallback } from "react"
import type { Editor } from "@tiptap/react"

// --- Icons ---
import { 
  Scale, 
  Pilcrow, 
  Layers, 
  Users,
  Type,
  PenTool,
  Minus
} from "lucide-react"

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

  // Básico
  texto_simples: {
    title: "Texto Simples",
    subtext: "Parágrafo sem formatação jurídica",
    keywords: ["texto", "simples", "p", "paragrafo"],
    badge: Type,
    group: "Básico",
  },

  // Jurídico
  add_preamble: {
    title: "Adicionar Preâmbulo",
    subtext: "Inserir preâmbulo e Cláusula 1ª (Objeto)",
    keywords: ["preambulo", "inicio", "partes", "objeto"],
    badge: Users,
    group: "Jurídico",
  },
  clausula: {
    title: "Cláusula",
    subtext: "Nova cláusula contratual",
    keywords: ["clausula", "legal"],
    badge: Scale,
    group: "Jurídico",
    indent: 0,
  },
  paragrafo_legal: {
    title: "Parágrafo",
    subtext: "Parágrafo de cláusula",
    keywords: ["paragrafo", "legal", "$"],
    badge: Pilcrow,
    group: "Jurídico",
    indent: 1,
  },
  inciso: {
    title: "Inciso",
    subtext: "Inciso (I, II, III...)",
    keywords: ["inciso", "legal"],
    badge: Layers,
    group: "Jurídico",
    indent: 2,
  },
  alinea: {
    title: "Alínea",
    subtext: "Alínea (a, b, c...)",
    keywords: ["alinea", "legal"],
    badge: Minus,
    group: "Jurídico",
    indent: 3,
  },
  add_signature: {
    title: "Campo Assinatura",
    subtext: "Inserir linhas de assinatura",
    keywords: ["assinatura", "firmar", "final", "pacto"],
    badge: PenTool,
    group: "Jurídico",
  },
}

export type SlashMenuItemType = keyof typeof texts

const getItemImplementations = () => {
  return {

    // Básico
    texto_simples: {
      check: (editor: Editor) => isNodeInSchema("paragraph", editor),
      action: ({ editor }: { editor: Editor }) => {
        editor.chain().focus().setParagraph().run()
      },
    },

    // Jurídico
    add_preamble: {
      check: (editor: Editor) => {
        const hasPreamble = editor.getText().includes("CONTRATO DE")
        return !hasPreamble && isNodeInSchema("legalNode", editor)
      },
      action: ({ editor }: { editor: Editor }) => {
        editor
          .chain()
          .focus()
          .insertContent('<h1 data-node-text-align="center"><strong>CONTRATO DE [PREENCHER TIPO DE CONTRATO]</strong></h1><p data-node-text-align="justify"><strong>CONTRATANTE:</strong> [NOME/RAZÃO SOCIAL], [NACIONALIDADE], [ESTADO CIVIL], [PROFISSÃO], inscrito no CPF/CNPJ sob o nº [000.000.000-00], residente e domiciliado em [ENDEREÇO COMPLETO].</p><p data-node-text-align="justify"><strong>CONTRATADO:</strong> [NOME/RAZÃO SOCIAL], [NACIONALIDADE], [ESTADO CIVIL], [PROFISSÃO], inscrito no CPF/CNPJ sob o nº [000.000.000-00], residente e domiciliado em [ENDEREÇO COMPLETO].</p><p data-node-text-align="justify">As partes acima identificadas têm, entre si, justo e acertado o presente Contrato, que se regerá pelas cláusulas seguintes e pelas condições descritas abaixo.</p><p></p><div data-type="legal-node" data-level="1" data-node-text-align="justify"><strong>CLÁUSULA PRIMEIRA - DO OBJETO</strong></div><div data-type="legal-node" data-level="2" data-node-text-align="justify">O presente instrumento tem como objeto [DESCREVER O OBJETO DO CONTRATO COM PRECISÃO].</div>')
          .run()
      },
    },
    add_signature: {
      check: (editor: Editor) => isNodeInSchema("paragraph", editor),
      action: ({ editor }: { editor: Editor }) => {
        editor
          .chain()
          .focus()
          .insertContent('<p></p><p data-node-text-align="center">__________________________________________</p><p data-node-text-align="center"><strong>CONTRATANTE</strong></p><p data-node-text-align="center">__________________________________________</p><p data-node-text-align="center"><strong>CONTRATADO</strong></p>')
          .run()
      },
    },
    clausula: {
      check: (editor: Editor) => isNodeInSchema("legalNode", editor),
      action: ({ editor }: { editor: Editor }) => {
        ;(editor.chain() as any).focus().setLegalNode(1).run()
      },
    },
    paragrafo_legal: {
      check: (editor: Editor) => isNodeInSchema("legalNode", editor),
      action: ({ editor }: { editor: Editor }) => {
        ;(editor.chain() as any).focus().setLegalNode(2).run()
      },
    },
    inciso: {
      check: (editor: Editor) => isNodeInSchema("legalNode", editor),
      action: ({ editor }: { editor: Editor }) => {
        ;(editor.chain() as any).focus().setLegalNode(3).run()
      },
    },
    alinea: {
      check: (editor: Editor) => isNodeInSchema("legalNode", editor),
      action: ({ editor }: { editor: Editor }) => {
        ;(editor.chain() as any).focus().setLegalNode(4).run()
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
  
  // Define group order to ensure UI stability
  const groupOrder = ["Básico", "Inteligência", "Jurídico", "Inserir", "Anexos"]
  
  groupOrder.forEach(groupName => {
    if (groups[groupName]) {
      organizedItems.push(...groups[groupName])
    }
  })

  // Add any groups not in the explicit order
  Object.entries(groups).forEach(([groupName, groupItems]) => {
    if (!groupOrder.includes(groupName)) {
      organizedItems.push(...groupItems)
    }
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
