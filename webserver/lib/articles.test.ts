import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getArticles, searchArticles, getArticlesByTags, countNewArticles, getArticlesByIds } from './articles';
import { getPrismaContent, getPrismaActivity } from './prisma';

// Mock Prisma
const mockPrismaContentValues = {
    articles: {
        findMany: vi.fn(),
        count: vi.fn(),
    },
};

const mockPrismaActivityValues = {
    comment: {
        groupBy: vi.fn(),
    },
    markedArticle: {
        findMany: vi.fn(),
    },
};

vi.mock('./prisma', () => ({
    getPrismaContent: vi.fn(() => mockPrismaContentValues),
    getPrismaActivity: vi.fn(() => mockPrismaActivityValues),
}));

// Mock Opentelemetry
vi.mock('@opentelemetry/api', () => ({
    trace: {
        getTracer: () => ({
            startActiveSpan: (_name: string, fn: (span: any) => any) => {
                const span = {
                    setAttribute: vi.fn(),
                    recordException: vi.fn(),
                    end: vi.fn(),
                };
                return fn(span);
            },
        }),
    },
}));

describe('articles.ts', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockArticle = {
        article_id: 1n,
        title: 'Test Article',
        description: 'Test Description',
        published_at: new Date(),
        publishers: { name: 'Test Publisher' },
        article_tag: [{ tags: { name: 'Test Tag' } }],
    };

    describe('getArticles', () => {
        it('should fetch articles and enrich them', async () => {
            mockPrismaContentValues.articles.findMany.mockResolvedValue([mockArticle]);
            mockPrismaActivityValues.comment.groupBy.mockResolvedValue([
                { articleId: 1n, _count: { id: 5 } },
            ]);
            mockPrismaActivityValues.markedArticle.findMany.mockResolvedValue([]);

            const result = await getArticles();

            expect(mockPrismaContentValues.articles.findMany).toHaveBeenCalled();
            expect(result).toHaveLength(1);
            expect(result[0].title).toBe('Test Article');
            expect(result[0]._count?.comments).toBe(5);
            expect(result[0].isSaved).toBe(false);
        });

        it('should handle errors gracefully', async () => {
            mockPrismaContentValues.articles.findMany.mockRejectedValue(new Error('DB Error'));

            const result = await getArticles();

            expect(result).toEqual([]);
        });

        it('should check for saved articles if userId is provided', async () => {
            mockPrismaContentValues.articles.findMany.mockResolvedValue([mockArticle]);
            mockPrismaActivityValues.comment.groupBy.mockResolvedValue([]);
            mockPrismaActivityValues.markedArticle.findMany.mockResolvedValue([{ articleId: 1n }]);

            const result = await getArticles(123);

            expect(mockPrismaActivityValues.markedArticle.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ userId: 123 })
                })
            );
            expect(result[0].isSaved).toBe(true);
        });
    });

    describe('searchArticles', () => {
        it('should search articles by query', async () => {
            mockPrismaContentValues.articles.findMany.mockResolvedValue([mockArticle]);
            mockPrismaActivityValues.comment.groupBy.mockResolvedValue([]);
            mockPrismaActivityValues.markedArticle.findMany.mockResolvedValue([]);

            const result = await searchArticles('Test');

            expect(mockPrismaContentValues.articles.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        OR: expect.arrayContaining([
                            expect.objectContaining({ title: { contains: 'Test', mode: 'insensitive' } })
                        ])
                    })
                })
            );
            expect(result).toHaveLength(1);
        });

        it('should return empty array on error', async () => {
            mockPrismaContentValues.articles.findMany.mockRejectedValue(new Error('Search Error'));
            const result = await searchArticles('fail');
            expect(result).toEqual([]);
        });
    });

    describe('getArticlesByTags', () => {
        it('should filter by tags', async () => {
            mockPrismaContentValues.articles.findMany.mockResolvedValue([mockArticle]);
            mockPrismaActivityValues.comment.groupBy.mockResolvedValue([]);

            await getArticlesByTags([1n]);

            expect(mockPrismaContentValues.articles.findMany).toHaveBeenCalled();
        });
    });

    describe('countNewArticles', () => {
        it('should count new articles', async () => {
            mockPrismaContentValues.articles.count.mockResolvedValue(10);
            const count = await countNewArticles([], [], new Date());
            expect(count).toBe(10);
        });
    });

    describe('getArticlesByIds', () => {
        it('should get articles by ids', async () => {
            mockPrismaContentValues.articles.findMany.mockResolvedValue([mockArticle]);
            mockPrismaActivityValues.comment.groupBy.mockResolvedValue([]);

            const result = await getArticlesByIds([1n]);
            expect(result).toHaveLength(1);
        });
    });
});
