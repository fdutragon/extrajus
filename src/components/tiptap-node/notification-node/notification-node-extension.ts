import { Node, mergeAttributes } from "@tiptap/core"

export interface NotificationNodeOptions {
  HTMLAttributes: Record<string, any>
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    setNotificationNode: (level: number) => ReturnType
  }
}

export const NotificationNode = Node.create<NotificationNodeOptions>({
  name: "notificationNode",

  addOptions() {
    return {
      HTMLAttributes: {
        class: "notification-node",
      },
    }
  },

  content: "inline*",
  group: "block",
  defining: true,

  addAttributes() {
    return {
      level: {
        default: 1, // 1: Seção, 2: Item, 3: Subitem, 4: Detalhe
        parseHTML: (element) => parseInt(element.getAttribute("data-level") || "1", 10),
        renderHTML: (attributes) => {
          return {
            "data-level": attributes.level,
            class: `notification-node-level-${attributes.level}`,
          }
        },
      },
      aiHighlight: {
        default: false,
        parseHTML: (element) => element.hasAttribute("data-ai-highlight"),
        renderHTML: (attributes) => {
          if (!attributes.aiHighlight) return {}
          return {
            "data-ai-highlight": "true",
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="notification-node"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "notification-node",
      }),
      ["span", { class: "notification-node-counter", contentEditable: "false" }],
      ["div", { class: "notification-node-content" }, 0],
    ]
  },

  addCommands(): any {
    return {
      setNotificationNode:
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
          // If level 1, turn into a regular paragraph
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
          // Empty node, turn it into a paragraph on enter
          return this.editor.commands.setParagraph()
        }

        // Create a new notification node of the same level
        return this.editor.commands.insertContent({
          type: this.name,
          attrs: { level: node.attrs.level },
        })
      },
    }
  },
})
