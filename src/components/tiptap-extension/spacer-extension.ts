import { Node, mergeAttributes } from '@tiptap/core'

export interface SpacerOptions {
  HTMLAttributes: Record<string, any>,
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    spacer: {
      /**
       * Add a spacer node
       */
      setSpacer: () => ReturnType,
    }
  }
}

export const Spacer = Node.create<SpacerOptions>({
  name: 'spacer',

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'doc-spacer',
        'data-type': 'spacer',
      },
    }
  },

  group: 'block',

  // Faz do nó um 'atom', o que significa que ele é tratado como uma unidade única
  // e não possui conteúdo editável interno.
  atom: true,

  selectable: false,

  draggable: false,

  parseHTML() {
    return [
      { 
        tag: 'div[data-type="spacer"]',
      },
      // Fallback para caso a IA tente usar a tag customizada
      {
        tag: 'spacer',
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)]
  },

  addCommands() {
    return {
      setSpacer: () => ({ commands }) => {
        return commands.insertContent({ type: this.name })
      },
    }
  },
})
