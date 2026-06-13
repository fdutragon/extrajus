import { redirect } from "next/navigation"

interface GerarPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function GerarRedirectionPage({ params }: GerarPageProps) {
  const resolvedParams = await params
  const slug = resolvedParams.slug

  // Redireciona o usuário para a página inicial com o template configurado na URL
  redirect(`/?template=${slug}`)
}
