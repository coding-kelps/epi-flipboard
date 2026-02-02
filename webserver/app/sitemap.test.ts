import { describe, it, expect } from 'vitest';
import sitemap from './sitemap';

describe('Sitemap', () => {
    it('returns correct sitemap configuration', () => {
        const config = sitemap();
        expect(config).toHaveLength(1);
        expect(config[0]).toMatchObject({
            url: 'https://epi-flipboard.kelps.io/',
            changeFrequency: 'daily',
            priority: 1.0,
        });
        expect(config[0].lastModified).toBeInstanceOf(Date);
    });
});
