"use client"

import React, { createContext, useContext } from 'react'

export type CopyData = {
  text: string
  variant: string
}

const CopiesContext = createContext<Record<string, CopyData>>({})

export function CopiesProvider({ 
  children, 
  initialCopies 
}: { 
  children: React.ReactNode
  initialCopies: Record<string, CopyData> 
}) {
  // Debug para garantir que as copies chegaram no navegador
  React.useEffect(() => {
    console.log("[Lilith] Copies carregadas no cliente:", initialCopies)
  }, [initialCopies])

  return (
    <CopiesContext.Provider value={initialCopies}>
      {children}
    </CopiesContext.Provider>
  )
}

export const useCopies = () => {
  const context = useContext(CopiesContext)
  if (!context) {
    // Retorno seguro caso o provider falhe
    return {} as Record<string, CopyData>
  }
  return context
}

/**
 * Hook utilitÃ¡rio para buscar uma copy específica com fallback.
 */
export const useCopy = (elementId: string, fallback: string) => {
  const copies = useCopies()
  const copy = copies[elementId]
  
  React.useEffect(() => {
    console.log(`[Lilith A/B] useCopy('${elementId}') ->`, copy ? 'BANCO' : 'FALLBACK', copy?.text || fallback)
  }, [elementId, copy, fallback])

  return {
    text: copy?.text || fallback,
    variant: copy?.variant || 'default'
  }
}
