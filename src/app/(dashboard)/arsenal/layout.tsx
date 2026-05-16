import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Arsenal Jurídico de Elite | ExtraJus",
  description: "Biblioteca exclusiva de modelos de contratos de alta performance, blindagem patrimonial e engenharia jurídica avançada. Proteja seus ativos com documentos forjados por especialistas.",
  keywords: ["contratos jurídicos", "modelos de contrato", "blindagem patrimonial", "engenharia jurídica", "ExtraJus", "advocacia de alta performance"],
  authors: [{ name: "ExtraJus Team" }],
  openGraph: {
    title: "Arsenal Jurídico | ExtraJus",
    description: "Modelos de contratos blindados e prontos para uso. O padrão ouro da engenharia jurídica.",
    url: "https://extrajus.com.br/arsenal",
    siteName: "ExtraJus",
    images: [
      {
        url: "https://extrajus.com.br/og-arsenal.png",
        width: 1200,
        height: 630,
        alt: "Arsenal Jurídico ExtraJus",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Arsenal Jurídico | ExtraJus",
    description: "A biblioteca definitiva de contratos de alta performance.",
    images: ["https://extrajus.com.br/og-arsenal.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function ArsenalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Arsenal Jurídico ExtraJus",
            "description": "Biblioteca de modelos de contratos e documentos jurídicos de alta performance.",
            "url": "https://extrajus.com.br/arsenal",
            "provider": {
              "@type": "Organization",
              "name": "ExtraJus",
              "url": "https://extrajus.com.br"
            }
          }),
        }}
      />
      {children}
    </>
  );
}
