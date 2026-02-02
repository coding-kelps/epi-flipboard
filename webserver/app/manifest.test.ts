import { describe, it, expect } from 'vitest';
import manifest from './manifest';

describe('Manifest', () => {
    it('returns correct manifest configuration', () => {
        const config = manifest();
        expect(config).toEqual({
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
        });
    });
});
