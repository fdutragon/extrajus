import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Biblioteca de Modelos de Elite | SmartDoc",
  description: "Biblioteca exclusiva de modelos de contratos de alta performance, blindagem patrimonial e engenharia jurídica avançada. Proteja seus ativos com documentos elaborados por especialistas.",
  keywords: ["contratos jurídicos", "modelos de contrato", "blindagem patrimonial", "engenharia jurídica", "SmartDoc", "advocacia de alta performance"],
  authors: [{ name: "SmartDoc Team" }],
  openGraph: {
    title: "Biblioteca de Modelos | SmartDoc",
    description: "Modelos de contratos blindados e prontos para uso. O padrão ouro da engenharia jurídica.",
    url: "https://smartdoc.com.br/modelos",
    siteName: "SmartDoc",
    images: [
      {
        url: "https://smartdoc.com.br/og-arsenal.png",
        width: 1200,
        height: 630,
        alt: "Biblioteca de Modelos SmartDoc",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Biblioteca de Modelos | SmartDoc",
    description: "A biblioteca definitiva de contratos de alta performance.",
    images: ["https://smartdoc.com.br/og-arsenal.png"],
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
            "name": "Biblioteca de Modelos SmartDoc",
            "description": "Biblioteca de modelos de contratos e documentos jurídicos de alta performance.",
            "url": "https://smartdoc.com.br/modelos",
            "provider": {
              "@type": "Organization",
              "name": "SmartDoc",
              "url": "https://smartdoc.com.br"
            }
          }),
        }}
      />
      {children}
    </>
  );
}
