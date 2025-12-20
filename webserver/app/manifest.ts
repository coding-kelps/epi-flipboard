import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'EpiFlipBoard',
    short_name: 'EpiFlipBoard',
    description: "A FlipBoard clone made for a school project.",
    start_url: '/',
    display: 'standalone',
    background_color: '#fdfdfd',
    theme_color: '#fdfdfd',
    icons: [
      {
        src: '/favicon-dark.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}
