import { describe, it, expect } from 'vitest';
import { GET } from './route';

describe('Livez Route', () => {
    it('returns 200 ok', async () => {
        const res = await GET();
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.status).toBe('ok');
    });
});
