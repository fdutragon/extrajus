import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/modelos'],
      disallow: [
        '/dashboard/', 
        '/contracts/', 
        '/signatures/', 
        '/settings/', 
        '/brain/', 
        '/api/',
        '/editor/'
      ],
    },
    sitemap: 'https://extrajus.com.br/sitemap.xml',
  }
}
