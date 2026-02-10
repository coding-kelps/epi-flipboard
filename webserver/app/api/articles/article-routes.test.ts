import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST as MarkPOST } from './mark/route'
import { GET as MarkedGET } from './marked/route'
import { POST as RecordHistoryPOST } from '../history/record/route'
import { GET as HistoryGET } from '../history/route'
import { NextRequest } from 'next/server'

// Mock Dependencies
const mockPrismaActivity = {
    markedArticle: {
        create: vi.fn(),
        deleteMany: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
    },
    readingHistory: {
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
    },
}

const mockPrismaContent = {
    articles: {
        findMany: vi.fn(),
    },
}

vi.mock('@/lib/prisma', () => ({
    getPrismaActivity: () => mockPrismaActivity,
    getPrismaContent: () => mockPrismaContent,
}))

vi.mock('@/lib/auth', () => ({
    getSession: vi.fn(),
}))

import { getSession } from '@/lib/auth'

// Mock Articles Lib
vi.mock('@/lib/articles', () => ({
    getArticlesByIds: vi.fn(),
}))

import { getArticlesByIds } from '@/lib/articles'

describe('Article & History API Routes', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('Mark Article Route', () => {
        it('marks an article', async () => {
            const req = new NextRequest('http://api/articles/mark', {
                method: 'POST',
                body: JSON.stringify({
                    userId: '1',
                    articleId: '100',
                    action: 'mark',
                }),
            })
            mockPrismaActivity.markedArticle.create.mockResolvedValue({
                userId: 1,
                articleId: 100n,
                createdAt: new Date(),
            })

            const res = await MarkPOST(req)
            const json = await res.json()

            expect(json.success).toBe(true)
        })

        it('unmarks an article', async () => {
            const req = new NextRequest('http://api/articles/mark', {
                method: 'POST',
                body: JSON.stringify({
                    userId: '1',
                    articleId: '100',
                    action: 'unmark',
                }),
            })

            const res = await MarkPOST(req)
            const json = await res.json()

            expect(json.success).toBe(true)
        })

        it('returns 400 for missing fields', async () => {
            const req = new NextRequest('http://api/articles/mark', {
                method: 'POST',
                body: JSON.stringify({ userId: '1' }), // missing articleId/action
            })

            const res = await MarkPOST(req)
            expect(res.status).toBe(400)
        })

        it('returns 400 for invalid action', async () => {
            const req = new NextRequest('http://api/articles/mark', {
                method: 'POST',
                body: JSON.stringify({
                    userId: '1',
                    articleId: '100',
                    action: 'invalid',
                }),
            })

            const res = await MarkPOST(req)
            expect(res.status).toBe(400)
        })

        it('returns 500 on internal error', async () => {
            const req = new NextRequest('http://api/articles/mark', {
                method: 'POST',
                body: JSON.stringify({
                    userId: '1',
                    articleId: '100',
                    action: 'mark',
                }),
            })
            mockPrismaActivity.markedArticle.create.mockRejectedValue(
                new Error('DB Error')
            )

            const res = await MarkPOST(req)
            expect(res.status).toBe(500)
        })
    })

    describe('Marked Articles Route', () => {
        it('returns marked articles', async () => {
            const req = new NextRequest('http://api/articles/marked?userId=1')
            mockPrismaActivity.markedArticle.findMany.mockResolvedValue([
                { articleId: 100n, createdAt: new Date() },
            ])
            mockPrismaActivity.markedArticle.count.mockResolvedValue(1)
            ;(getArticlesByIds as any).mockResolvedValue([
                {
                    article_id: 100n,
                    title: 'Marked Art',
                    publisher_id: 1n,
                    publishers: { publisher_id: 1n },
                    article_tag: [
                        {
                            article_id: 100n,
                            tag_id: 1n,
                            tags: {
                                tag_id: 1n,
                                name: 'Tag',
                                created_at: new Date(),
                            },
                        },
                    ],
                },
            ])

            const res = await MarkedGET(req)
            const json = await res.json()

            expect(json.markedArticles).toHaveLength(1)
        })

        it('returns empty if no marked articles', async () => {
            const req = new NextRequest('http://api/articles/marked?userId=1')
            mockPrismaActivity.markedArticle.findMany.mockResolvedValue([])
            mockPrismaActivity.markedArticle.count.mockResolvedValue(0)

            const res = await MarkedGET(req)
            const json = await res.json()

            expect(json.markedArticles).toHaveLength(0)
        })

        it('returns 400 if userId missing', async () => {
            const req = new NextRequest('http://api/articles/marked')
            const res = await MarkedGET(req)
            expect(res.status).toBe(400)
        })

        it('returns 500 on internal error', async () => {
            const req = new NextRequest('http://api/articles/marked?userId=1')
            mockPrismaActivity.markedArticle.findMany.mockRejectedValue(
                new Error('DB Error')
            )

            const res = await MarkedGET(req)
            expect(res.status).toBe(500)
        })
    })

    describe('Record History Route', () => {
        it('records history (create)', async () => {
            ;(getSession as any).mockResolvedValue({ user: { id: 1 } })
            const req = new NextRequest('http://api/history/record', {
                method: 'POST',
                body: JSON.stringify({ articleId: 100 }),
            })

            mockPrismaActivity.readingHistory.findFirst.mockResolvedValue(null)

            const res = await RecordHistoryPOST(req)
            const json = await res.json()

            expect(json.success).toBe(true)
        })

        it('records history (update)', async () => {
            ;(getSession as any).mockResolvedValue({ user: { id: 1 } })
            const req = new NextRequest('http://api/history/record', {
                method: 'POST',
                body: JSON.stringify({ articleId: 100 }),
            })

            mockPrismaActivity.readingHistory.findFirst.mockResolvedValue({
                id: 5,
            })

            const res = await RecordHistoryPOST(req)
            const json = await res.json()

            expect(json.success).toBe(true)
        })

        it('returns 401 if not authorized', async () => {
            ;(getSession as any).mockResolvedValue(null)
            const req = new NextRequest('http://api/history/record', {
                method: 'POST',
                body: JSON.stringify({ articleId: 100 }),
            })
            const res = await RecordHistoryPOST(req)
            expect(res.status).toBe(401)
        })

        it('returns 400 if articleId missing', async () => {
            ;(getSession as any).mockResolvedValue({ user: { id: 1 } })
            const req = new NextRequest('http://api/history/record', {
                method: 'POST',
                body: JSON.stringify({}),
            })
            const res = await RecordHistoryPOST(req)
            expect(res.status).toBe(400)
        })

        it('returns 500 on internal error', async () => {
            ;(getSession as any).mockResolvedValue({ user: { id: 1 } })
            const req = new NextRequest('http://api/history/record', {
                method: 'POST',
                body: JSON.stringify({ articleId: 100 }),
            })
            mockPrismaActivity.readingHistory.findFirst.mockRejectedValue(
                new Error('DB Error')
            )

            const res = await RecordHistoryPOST(req)
            expect(res.status).toBe(500)
        })
    })

    describe('Get History Route', () => {
        it('returns history list', async () => {
            ;(getSession as any).mockResolvedValue({ user: { id: 1 } })
            const req = new NextRequest('http://api/history')

            mockPrismaActivity.readingHistory.findMany.mockResolvedValue([
                { articleId: 100n, readAt: new Date() },
            ])
            mockPrismaActivity.readingHistory.count.mockResolvedValue(1)

            mockPrismaContent.articles.findMany.mockResolvedValue([
                {
                    article_id: 100n,
                    title: 'Read Art',
                    publisher_id: 1n,
                    publishers: { publisher_id: 1n },
                    article_tag: [
                        {
                            article_id: 100n,
                            tag_id: 1n,
                            tags: {
                                tag_id: 1n,
                                name: 'Tag',
                                created_at: new Date(),
                            },
                        },
                    ],
                },
            ])

            const res = await HistoryGET(req)
            const json = await res.json()

            expect(json.articles).toHaveLength(1)
        })

        it('returns 401 if not authorized', async () => {
            ;(getSession as any).mockResolvedValue(null)
            const req = new NextRequest('http://api/history')
            const res = await HistoryGET(req)
            expect(res.status).toBe(401)
        })

        it('returns 500 on internal error', async () => {
            ;(getSession as any).mockResolvedValue({ user: { id: 1 } })
            const req = new NextRequest('http://api/history')
            mockPrismaActivity.readingHistory.findMany.mockRejectedValue(
                new Error('DB Error')
            )

            const res = await HistoryGET(req)
            expect(res.status).toBe(500)
        })
        it('returns empty list if history is empty', async () => {
            ;(getSession as any).mockResolvedValue({ user: { id: 1 } })
            const req = new NextRequest('http://api/history')

            mockPrismaActivity.readingHistory.findMany.mockResolvedValue([])
            mockPrismaActivity.readingHistory.count.mockResolvedValue(0)

            const res = await HistoryGET(req)
            const json = await res.json()
            expect(json.articles).toHaveLength(0)
        })
    })
})
