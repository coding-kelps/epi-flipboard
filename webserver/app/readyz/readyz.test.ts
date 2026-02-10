import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from './route'

const mockPrismaIdentity = {
    $queryRaw: vi.fn(),
}

const mockPrismaContent = {
    $queryRaw: vi.fn(),
}

vi.mock('@/lib/prisma', () => ({
    getPrismaIdentity: () => mockPrismaIdentity,
    getPrismaContent: () => mockPrismaContent,
}))

describe('Readyz Route', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('returns 200 ready when both DBs are healthy', async () => {
        mockPrismaIdentity.$queryRaw.mockResolvedValue([1])
        mockPrismaContent.$queryRaw.mockResolvedValue([1])

        const req = new Request('http://localhost/readyz')
        const res = await GET(req)
        const json = await res.json()

        expect(res.status).toBe(200)
        expect(json.status).toBe('ready')
    })

    it('returns 503 not ready when identity DB fails', async () => {
        mockPrismaIdentity.$queryRaw.mockRejectedValue(new Error('DB Error'))
        mockPrismaContent.$queryRaw.mockResolvedValue([1])

        const req = new Request('http://localhost/readyz')
        const res = await GET(req)
        const json = await res.json()

        expect(res.status).toBe(503)
        expect(json.status).toBe('not ready')
    })

    it('returns 503 not ready when content DB fails', async () => {
        mockPrismaIdentity.$queryRaw.mockResolvedValue([1])
        mockPrismaContent.$queryRaw.mockRejectedValue(new Error('DB Error'))

        const req = new Request('http://localhost/readyz')
        const res = await GET(req)
        const json = await res.json()

        expect(res.status).toBe(503)
        expect(json.status).toBe('not ready')
    })

    it('returns verbose status when requested', async () => {
        mockPrismaIdentity.$queryRaw.mockResolvedValue([1])
        mockPrismaContent.$queryRaw.mockRejectedValue(new Error('DB Error'))

        const req = new Request('http://localhost/readyz?verbose=true')
        const res = await GET(req)
        const json = await res.json()

        expect(json.checks).toBeDefined()
        expect(json.checks.databases.identity).toBe('ok')
        expect(json.checks.databases.content).toBe('fail')
    })
})
