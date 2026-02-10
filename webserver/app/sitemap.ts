import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: 'https://epi-flipboard.kelps.io/',
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1.0,
        },
    ]
}
