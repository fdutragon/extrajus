import { mergeAttributes, Node } from '@tiptap/core'

export interface VariableOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    insertVariable: (name: string) => ReturnType
  }
}

export const VariableNode = Node.create<VariableOptions>({
  name: 'variable',

  group: 'inline',
  inline: true,
  selectable: true,
  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'contract-variable',
      },
    }
  },

  addAttributes() {
    return {
      name: {
        default: null,
        parseHTML: element => element.getAttribute('data-variable-name'),
        renderHTML: attributes => {
          if (!attributes.name) return {}
          return {
            'data-variable-name': attributes.name,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="variable"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'variable',
      }),
      `{{${HTMLAttributes['data-variable-name']}}}`,
    ]
  },

  addCommands(): any {
    return {
      insertVariable:
        (name: string) =>
        ({ commands }: any) => {
          return commands.insertContent({
            type: this.name,
            attrs: { name },
          })
        },
    }
  },
})
