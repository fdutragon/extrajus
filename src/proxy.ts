import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function proxy(request: NextRequest) {
  const response = await updateSession(request)
  
  // Garantimos que o usuÃ¡rio sempre tenha um seed para testes A/B determinÃ­sticos no servidor
  // Isso permite que o motor de copies da Lilith escolha a variante certa sem Layout Shift
  const seed = request.cookies.get('ex_variant_seed')

  if (!seed && response instanceof NextResponse) {
    const newSeed = crypto.randomUUID()
    response.cookies.set('ex_variant_seed', newSeed, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 ano para consistÃªncia absoluta
      httpOnly: false, // Permitimos que o client leia se precisar
    })
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - any image file
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
