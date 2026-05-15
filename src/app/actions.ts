
'use server'

import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export async function createContractAction() {
  console.log("[createContractAction] Starting...")
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.error("[createContractAction] No user found")
    throw new Error("Unauthorized")
  }
  console.log("[createContractAction] User found:", user.id)

  const { data: contract, error } = await supabase
    .from('contracts')
    .insert({
      user_id: user.id,
      title: "Novo Contrato Sem Título",
      status: 'draft'
    })
    .select()
    .single()

  if (error) {
    console.error("[createContractAction] Error creating contract:", error.message, error.details)
    throw new Error(`Failed to create contract: ${error.message}`)
  }

  console.log("[createContractAction] Contract created successfully:", contract.id)
  redirect(`/editor?room=${contract.id}`)
}
