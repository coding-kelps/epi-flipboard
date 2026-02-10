import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from './route'
import { NextRequest } from 'next/server'

const mockPrismaContent = {
    tags: {
        findMany: vi.fn(),
    },
}

vi.mock('@/lib/prisma', () => ({
    getPrismaContent: () => mockPrismaContent,
}))

describe('Tags Search API', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('returns empty list if query too short', async () => {
        const req = new NextRequest('http://api/tags/search?q=a')
        const res = await GET(req)
        const json = await res.json()
        expect(json).toEqual([])
    })

    it('searches tags by string', async () => {
        const req = new NextRequest('http://api/tags/search?q=tech')
        mockPrismaContent.tags.findMany.mockResolvedValue([
            { tag_id: 1n, name: 'Technology' },
            { tag_id: 2n, name: 'TechCrunch' },
        ])

        const res = await GET(req)
        const json = await res.json()

        expect(json).toHaveLength(2)
        expect(json[0].tag_id).toBe(1)
        expect(json[0].name).toBe('Technology')
        expect(mockPrismaContent.tags.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { name: { contains: 'tech', mode: 'insensitive' } },
            })
        )
    })

    it('searches tags by IDs', async () => {
        const req = new NextRequest('http://api/tags/search?ids=1,2,99')
        mockPrismaContent.tags.findMany.mockResolvedValue([
            { tag_id: 1n, name: 'One' },
            { tag_id: 2n, name: 'Two' },
        ])

        const res = await GET(req)
        const json = await res.json()

        expect(json).toHaveLength(2)
        expect(json[0].name).toBe('One')
        expect(mockPrismaContent.tags.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { tag_id: { in: [1n, 2n, 99n] } },
            })
        )
    })

    it('returns empty list if ids param is invalid/empty', async () => {
        const req = new NextRequest('http://api/tags/search?ids=')
        // ids will be empty string -> split -> [""] -> filter number -> []? or empty if handled by logic
        const res = await GET(req)
        const json = await res.json()
        expect(json).toEqual([])
    })
})
