import { describe, it, expect, vi, beforeEach } from 'vitest'
import { toggleFollowFeed, searchFeeds, getIsFollowingFeed } from './actions'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

vi.mock('@/lib/auth', () => ({
    getSession: vi.fn(),
}))

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}))

const mockPrismaActivity = {
    followedFeed: {
        findUnique: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
    },
    feed: {
        findMany: vi.fn(),
    },
}

vi.mock('@/lib/prisma', () => ({
    getPrismaActivity: vi.fn(() => mockPrismaActivity),
}))

describe('Server Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('toggleFollowFeed', () => {
        it('should throw if unauthorized', async () => {
            ;(getSession as any).mockResolvedValue(null)
            await expect(toggleFollowFeed(1)).rejects.toThrow('Unauthorized')
        })

        it('should follow if not already following', async () => {
            ;(getSession as any).mockResolvedValue({ user: { id: 1 } })
            mockPrismaActivity.followedFeed.findUnique.mockResolvedValue(null)

            const result = await toggleFollowFeed(100)

            expect(mockPrismaActivity.followedFeed.create).toHaveBeenCalled()
            expect(result).toBe(true)
            expect(revalidatePath).toHaveBeenCalledWith('/feeds/100')
        })

        it('should unfollow if already following', async () => {
            ;(getSession as any).mockResolvedValue({ user: { id: 1 } })
            mockPrismaActivity.followedFeed.findUnique.mockResolvedValue({
                id: 999,
            })

            const result = await toggleFollowFeed(100)

            expect(mockPrismaActivity.followedFeed.delete).toHaveBeenCalled()
            expect(result).toBe(false)
        })
    })

    describe('searchFeeds', () => {
        it('should return latest feeds on empty query', async () => {
            mockPrismaActivity.feed.findMany.mockResolvedValue([
                {
                    id: 1,
                    name: 'Feed 1',
                    tagIds: [1n],
                    publisherIds: [1n],
                    createdAt: new Date(),
                },
            ])

            const result = await searchFeeds('')

            expect(mockPrismaActivity.feed.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    orderBy: { createdAt: 'desc' },
                })
            )
            expect(result).toHaveLength(1)
        })

        it('should search by name or description', async () => {
            mockPrismaActivity.feed.findMany.mockResolvedValue([])

            await searchFeeds('Tech')

            expect(mockPrismaActivity.feed.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ OR: expect.any(Array) }),
                })
            )
        })
    })

    describe('getIsFollowingFeed', () => {
        it('should return false if not logged in', async () => {
            ;(getSession as any).mockResolvedValue(null)
            const result = await getIsFollowingFeed(1)
            expect(result).toBe(false)
        })

        it('should return true if following', async () => {
            ;(getSession as any).mockResolvedValue({ user: { id: 1 } })
            mockPrismaActivity.followedFeed.findUnique.mockResolvedValue({
                id: 1,
            })
            const result = await getIsFollowingFeed(1)
            expect(result).toBe(true)
        })
    })
})
