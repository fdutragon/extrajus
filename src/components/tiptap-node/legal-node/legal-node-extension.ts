import { Node, mergeAttributes } from "@tiptap/core"

export interface LegalNodeOptions {
  HTMLAttributes: Record<string, any>
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    setLegalNode: (level: number) => ReturnType
  }
}

export const LegalNode = Node.create<LegalNodeOptions>({
  name: "legalNode",

  addOptions() {
    return {
      HTMLAttributes: {
        class: "legal-node",
      },
    }
  },

  content: "inline*",
  group: "block",
  defining: true,

  addAttributes() {
    return {
      level: {
        default: 1, // 1: Cláusula, 2: Parágrafo, 3: Inciso, 4: Alínea
        parseHTML: (element) => parseInt(element.getAttribute("data-level") || "1", 10),
        renderHTML: (attributes) => {
          return {
            "data-level": attributes.level,
            class: `legal-node-level-${attributes.level}`,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="legal-node"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "legal-node",
      }),
      ["span", { class: "legal-node-counter", contentEditable: "false" }],
      ["div", { class: "legal-node-content" }, 0],
    ]
  },

  addCommands(): any {
    return {
      setLegalNode:
        (level: number) =>
        ({ commands }: any) => {
          return commands.setNode(this.name, { level })
        },
    }
  },

  addKeyboardShortcuts() {
    return {
      Tab: () => {
        // Demote (increase level)
        const { state, dispatch } = this.editor.view
        const { selection } = state
        const { $from } = selection

        const node = $from.parent
        if (node.type.name !== this.name) return false

        const currentLevel = node.attrs.level
        if (currentLevel < 4) {
          if (dispatch) {
            const tr = state.tr.setNodeMarkup($from.before(), null, {
              level: currentLevel + 1,
            })
            dispatch(tr)
          }
          return true
        }
        return false
      },
      "Shift-Tab": () => {
        // Promote (decrease level)
        const { state, dispatch } = this.editor.view
        const { selection } = state
        const { $from } = selection

        const node = $from.parent
        if (node.type.name !== this.name) return false

        const currentLevel = node.attrs.level
        if (currentLevel > 1) {
          if (dispatch) {
            const tr = state.tr.setNodeMarkup($from.before(), null, {
              level: currentLevel - 1,
            })
            dispatch(tr)
          }
          return true
        } else {
          // If level 1, maybe turn into a regular paragraph?
          return this.editor.commands.setParagraph()
        }
      },
      Enter: () => {
        const { state, dispatch } = this.editor.view
        const { selection } = state
        const { $from, empty } = selection

        if (!empty) return false

        const node = $from.parent
        if (node.type.name !== this.name) return false

        if (node.content.size === 0) {
          // Empty legal node, turn it into a paragraph on enter
          return this.editor.commands.setParagraph()
        }

        // Create a new legal node of the same level
        return this.editor.commands.insertContent({
          type: this.name,
          attrs: { level: node.attrs.level },
        })
      },
    }
  },
})
