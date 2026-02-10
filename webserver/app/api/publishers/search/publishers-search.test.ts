import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from './route'
import { NextRequest } from 'next/server'

const mockPrismaContent = {
    publishers: {
        findMany: vi.fn(),
    },
}

vi.mock('@/lib/prisma', () => ({
    getPrismaContent: () => mockPrismaContent,
}))

describe('Publishers Search API', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('returns empty list if query too short', async () => {
        const req = new NextRequest('http://api/publishers/search?q=a')
        const res = await GET(req)
        const json = await res.json()
        expect(json).toEqual([])
    })

    it('searches publishers by string', async () => {
        const req = new NextRequest('http://api/publishers/search?q=news')
        mockPrismaContent.publishers.findMany.mockResolvedValue([
            {
                publisher_id: 1n,
                name: 'Google News',
                display_name: 'Google News',
            },
        ])

        const res = await GET(req)
        const json = await res.json()

        expect(json).toHaveLength(1)
        expect(json[0].publisher_id).toBe('1')
    })

    it('searches publishers by IDs', async () => {
        const req = new NextRequest('http://api/publishers/search?ids=10')
        mockPrismaContent.publishers.findMany.mockResolvedValue([
            { publisher_id: 10n, name: 'CNN', display_name: 'CNN' },
        ])

        const res = await GET(req)
        const json = await res.json()

        expect(json).toHaveLength(1)
        expect(json[0].name).toBe('CNN')
    })

    it('returns 500 if ids param is invalid/empty', async () => {
        const req = new NextRequest('http://api/publishers/search?ids=abc')
        const res = await GET(req)
        expect(res.status).toBe(500)
    })
})
