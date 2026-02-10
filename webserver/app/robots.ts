import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: [
                    'Googlebot',
                    'Bingbot',
                    'DuckDuckBot',
                    'Qwantify',
                    'BraveSearchBot',
                    'Ecosia',
                ],
                allow: '/',
            },
            {
                userAgent: [
                    'GPTBot',
                    'ClaudeBot',
                    'Google-Extended',
                    'FacebookBot',
                    'Meta-ExternalAgent',
                    'Amazonbot',
                    'CCBot',
                ],
                allow: '/',
            },
            {
                userAgent: '*',
                disallow: '/',
            },
        ],
        sitemap: 'https://epi-flipboard.kelps.io/sitemap.xml',
    }
}
