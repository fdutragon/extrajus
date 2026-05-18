'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const signUpData = {
    email,
    password,
  }

  // 1. Sign up the user
  const { data, error } = await supabase.auth.signUp(signUpData)

  if (error) {
    redirect(`/register?error=${encodeURIComponent(error.message)}`)
  }

  // 2. Programmatically bypass email confirmation using the Service Role Admin Client
  const user = data.user
  if (user) {
    try {
      const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      
      await supabaseAdmin.auth.admin.updateUserById(user.id, { 
        email_confirm: true 
      })
      
      // 3. Authenticate immediately to set cookies and create active session
      await supabase.auth.signInWithPassword({
        email,
        password
      })
    } catch (adminError) {
      console.error('Failed to auto-confirm user:', adminError)
    }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}