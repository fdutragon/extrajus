export type CopyResult = {
  text: string
  variant: string
}

/**
 * Busca as copies ativas do Supabase com cache ISR (revalidate).
 * Determinístico por seed (session_id) para manter consistência no teste A/B.
 */
export async function getCopies(seed?: string): Promise<Record<string, CopyResult>> {
  console.log("[copies] Fetching copies from:", process.env.NEXT_PUBLIC_LILITH_SUPABASE_URL)
  console.log("[copies] Using seed:", seed)

  try {
    const url = `${process.env.NEXT_PUBLIC_LILITH_SUPABASE_URL}/rest/v1/site_copies?status=eq.active`
    const res = await fetch(url, {
      headers: {
        'apikey': process.env.NEXT_PUBLIC_LILITH_SUPABASE_ANON_KEY!,
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_LILITH_SUPABASE_ANON_KEY}`
      },
      next: { revalidate: 60 } // Revalida a cada minuto
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error("[copies] Fetch failed:", res.status, errorText)
      throw new Error(`Failed to fetch copies: ${res.statusText}`)
    }

    const copies = await res.json()
    console.log("[copies] Raw copies received:", JSON.stringify(copies, null, 2))
    const result: Record<string, CopyResult> = {}

    copies.forEach((copy: any) => {
      let variantId = copy.champion_variant
      const variants = copy.variants || []

      if (copy.rotation_mode === 'ab_test' && variants.length > 0) {
        if (seed) {
          let hash = 0
          for (let i = 0; i < seed.length; i++) {
            hash = (hash << 5) - hash + seed.charCodeAt(i)
            hash |= 0
          }
          const index = Math.abs(hash) % variants.length
          variantId = variants[index].id
          console.log(`[copies] AB Test for ${copy.element_id}: selected ${variantId} via seed`)
        } else {
          variantId = variants[0].id
          console.log(`[copies] AB Test for ${copy.element_id}: no seed, selected ${variantId}`)
        }
      }

      const variant = variants.find((v: any) => v.id === variantId) || variants[0]
      if (variant) {
        result[copy.element_id] = {
          text: variant.text,
          variant: variant.id
        }
      }
    })

    console.log("[copies] Final processed copies:", result)
    return result
  } catch (error) {
    console.error("[copies] Error fetching copies:", error)
    return {}
  }
}
