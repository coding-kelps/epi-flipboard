import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from './route'
import { NextRequest } from 'next/server'

const mockPrismaActivity = {
    comment: {
        count: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
    },
}

const mockPrismaIdentity = {
    user: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
    },
}

vi.mock('@/lib/prisma', () => ({
    getPrismaActivity: () => mockPrismaActivity,
    getPrismaIdentity: () => mockPrismaIdentity,
}))

vi.mock('@/lib/auth', () => ({
    getSession: vi.fn(),
}))

import { getSession } from '@/lib/auth'

describe('Comments API', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('GET', () => {
        it('returns 400 if articleId missing', async () => {
            const req = new NextRequest('http://api/comments')
            const res = await GET(req)
            expect(res.status).toBe(400)
        })

        it('returns count only', async () => {
            const req = new NextRequest(
                'http://api/comments?articleId=1&count=true'
            )
            mockPrismaActivity.comment.count.mockResolvedValue(5)

            const res = await GET(req)
            const json = await res.json()

            expect(json.count).toBe(5)
        })

        it('returns comments with merged user data', async () => {
            const req = new NextRequest('http://api/comments?articleId=1')

            mockPrismaActivity.comment.findMany.mockResolvedValue([
                { id: 1, content: 'Nice', createdAt: new Date(), userId: 10 },
            ])
            mockPrismaIdentity.user.findMany.mockResolvedValue([
                { id: 10, name: 'Commenter', email: 'c@c.com' },
            ])

            const res = await GET(req)
            const json = await res.json()

            expect(json).toHaveLength(1)
            expect(json[0].user.name).toBe('Commenter')
        })

        it('returns comments with unknown user fallback', async () => {
            const req = new NextRequest('http://api/comments?articleId=1')

            mockPrismaActivity.comment.findMany.mockResolvedValue([
                { id: 1, content: 'Nice', createdAt: new Date(), userId: 99 },
            ])
            mockPrismaIdentity.user.findMany.mockResolvedValue([]) // User NOT found

            const res = await GET(req)
            const json = await res.json()

            expect(json).toHaveLength(1)
            expect(json[0].user.name).toBe('Unknown User')
        })

        it('returns empty list if no comments', async () => {
            const req = new NextRequest('http://api/comments?articleId=1')
            mockPrismaActivity.comment.findMany.mockResolvedValue([])

            const res = await GET(req)
            const json = await res.json()
            expect(json).toEqual([])
        })

        it('returns 500 on internal error', async () => {
            const req = new NextRequest('http://api/comments?articleId=1')
            mockPrismaActivity.comment.findMany.mockRejectedValue(
                new Error('DB Error')
            )

            const res = await GET(req)
            expect(res.status).toBe(500)
        })
    })

    describe('POST', () => {
        it('creates comment successfully', async () => {
            ;(getSession as any).mockResolvedValue({
                user: { id: 1, name: 'Poster' },
            })

            const req = new NextRequest('http://api/comments', {
                method: 'POST',
                body: JSON.stringify({
                    articleId: 100,
                    content: 'New Comment',
                }),
            })

            mockPrismaActivity.comment.create.mockResolvedValue({
                id: 1,
                content: 'New Comment',
                createdAt: new Date(),
                userId: 1,
                articleId: 100n,
            })
            mockPrismaIdentity.user.findUnique.mockResolvedValue({
                id: 1,
                name: 'Poster DB',
            })

            const res = await POST(req)
            const json = await res.json()

            expect(res.status).toBe(200)
            expect(json.content).toBe('New Comment')
            expect(json.user.name).toBe('Poster DB')
        })

        it('uses session name if DB user name missing', async () => {
            ;(getSession as any).mockResolvedValue({
                user: { id: 1, name: 'Session Name' },
            })

            const req = new NextRequest('http://api/comments', {
                method: 'POST',
                body: JSON.stringify({ articleId: 100, content: 'C' }),
            })

            mockPrismaActivity.comment.create.mockResolvedValue({ id: 1 })
            mockPrismaIdentity.user.findUnique.mockResolvedValue({
                id: 1,
                name: null,
            }) // null name in DB

            const res = await POST(req)
            const json = await res.json()
            expect(json.user.name).toBe('Session Name')
        })

        it('returns 401 if not authorized', async () => {
            ;(getSession as any).mockResolvedValue(null)
            const req = new NextRequest('http://api/comments', {
                method: 'POST',
            })
            const res = await POST(req)
            expect(res.status).toBe(401)
        })

        it('returns 400 if missing fields', async () => {
            ;(getSession as any).mockResolvedValue({ user: { id: 1 } })
            const req = new NextRequest('http://api/comments', {
                method: 'POST',
                body: JSON.stringify({ articleId: 100 }), // missing content
            })

            const res = await POST(req)
            expect(res.status).toBe(400)
        })

        it('returns 500 on internal error', async () => {
            ;(getSession as any).mockResolvedValue({ user: { id: 1 } })
            const req = new NextRequest('http://api/comments', {
                method: 'POST',
                body: JSON.stringify({ articleId: 100, content: 'C' }),
            })

            mockPrismaActivity.comment.create.mockRejectedValue(
                new Error('DB Error')
            )

            const res = await POST(req)
            expect(res.status).toBe(500)
        })
    })
})
