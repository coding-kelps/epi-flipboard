import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
    updateFeedLastVisit,
    getFollowedFeedsWithMetadata,
} from './feed-activity'
import { getPrismaActivity } from '@/lib/prisma'
import { countNewArticles } from '@/lib/articles'

// Mock dependencies
const mockFollowedFeedUpdateMany = vi.fn()
const mockFollowedFeedFindMany = vi.fn()
const mockFeedFindMany = vi.fn()

vi.mock('@/lib/prisma', () => ({
    getPrismaActivity: vi.fn(),
    getPrismaContent: vi.fn(),
}))

vi.mock('@/lib/articles', () => ({
    countNewArticles: vi.fn(),
}))

describe('feed-activity', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        ;(getPrismaActivity as any).mockReturnValue({
            followedFeed: {
                updateMany: mockFollowedFeedUpdateMany,
                findMany: mockFollowedFeedFindMany,
            },
            feed: {
                findMany: mockFeedFindMany,
            },
        })
    })

    describe('updateFeedLastVisit', () => {
        it('updates last visit time', async () => {
            const userId = 1
            const feedId = 100

            await updateFeedLastVisit(userId, feedId)

            expect(mockFollowedFeedUpdateMany).toHaveBeenCalledWith({
                where: { userId, feedId },
                data: {
                    lastVisit: expect.any(Date),
                },
            })
        })

        it('handles errors gracefully', async () => {
            const consoleSpy = vi
                .spyOn(console, 'error')
                .mockImplementation(() => {})
            mockFollowedFeedUpdateMany.mockRejectedValue(new Error('DB Error'))

            await updateFeedLastVisit(1, 100)

            expect(consoleSpy).toHaveBeenCalledWith(
                'Failed to update feed last visit:',
                expect.any(Error)
            )
            consoleSpy.mockRestore()
        })
    })

    describe('getFollowedFeedsWithMetadata', () => {
        it('returns empty array if no followed feeds', async () => {
            mockFollowedFeedFindMany.mockResolvedValue([])

            const result = await getFollowedFeedsWithMetadata(1)
            expect(result).toEqual([])
            expect(mockFeedFindMany).not.toHaveBeenCalled()
        })

        it('returns feeds with new article counts', async () => {
            const userId = 1
            const followedFeeds = [
                { feedId: 10, lastVisit: new Date('2023-01-01') },
                { feedId: 20, lastVisit: new Date('2023-01-02') },
            ]
            const feeds = [
                {
                    id: 10,
                    name: 'Tech',
                    description: 'Tech desc',
                    tagIds: [1],
                    publisherIds: [],
                },
                {
                    id: 20,
                    name: 'Science',
                    description: 'Science desc',
                    tagIds: [2],
                    publisherIds: [5],
                },
            ]

            mockFollowedFeedFindMany.mockResolvedValue(followedFeeds)
            mockFeedFindMany.mockResolvedValue(feeds)
            ;(countNewArticles as any)
                .mockResolvedValueOnce(5)
                .mockResolvedValueOnce(3)

            const result = await getFollowedFeedsWithMetadata(userId)

            expect(mockFollowedFeedFindMany).toHaveBeenCalledWith({
                where: { userId },
                select: { feedId: true, lastVisit: true },
            })
            expect(mockFeedFindMany).toHaveBeenCalledWith({
                where: { id: { in: [10, 20] } },
            })
            expect(countNewArticles).toHaveBeenCalledTimes(2)
            expect(result).toHaveLength(2)
            expect(result[0]).toEqual({
                id: 10,
                name: 'Tech',
                description: 'Tech desc',
                newArticlesCount: 5,
            })
            expect(result[1]).toEqual({
                id: 20,
                name: 'Science',
                description: 'Science desc',
                newArticlesCount: 3,
            })
        })

        it('handles missing feed gracefully', async () => {
            // One followed feed exists in follow table but missing in feed table (edge case)
            mockFollowedFeedFindMany.mockResolvedValue([
                { feedId: 10, lastVisit: new Date() },
            ])
            mockFeedFindMany.mockResolvedValue([]) // No feeds found

            const result = await getFollowedFeedsWithMetadata(1)
            expect(result).toEqual([])
        })
    })
})
