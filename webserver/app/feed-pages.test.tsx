import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FeedsPage from './feeds/page';
import FeedPage from './feeds/[feedId]/page';
import { getSession, verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { getPrismaActivity } from '@/lib/prisma';

// Mock Dependencies
vi.mock('@/lib/prisma', () => {
    const mockFindMany = vi.fn();
    const mockFindUnique = vi.fn();
    return {
        getPrismaActivity: vi.fn(() => ({
            feed: {
                findMany: mockFindMany,
                findUnique: mockFindUnique,
            },
            followedFeed: {
                updateMany: vi.fn(),
            }
        })),
        getPrismaContent: vi.fn(() => ({
            tags: { findMany: vi.fn().mockResolvedValue([{ tag_id: 1n, name: 'Tag1' }]) },
            publishers: { findMany: vi.fn().mockResolvedValue([{ publisher_id: 1n, name: 'Pub1' }]) }
        })),
    };
});

vi.mock('@/lib/auth', () => ({
    getSession: vi.fn(),
    verifyToken: vi.fn(),
}));

vi.mock('@/lib/articles', () => ({
    getArticlesByTags: vi.fn().mockResolvedValue([
        {
            article_id: 1n,
            title: 'Article 1',
            image_url: 'http://img.com/1.jpg',
            publishers: { name: 'Pub', image_url: '', publisher_id: 1n, display_name: 'Pub' },
            article_tag: []
        }
    ]),
}));

vi.mock('@/lib/image-utils', () => ({
    checkImageResolution: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/app/actions', () => ({
    getIsFollowingFeed: vi.fn().mockResolvedValue(false),
}));

vi.mock('next/headers', () => ({
    cookies: vi.fn(),
}));

vi.mock('next/navigation', () => ({
    notFound: vi.fn(),
}));

vi.mock('@/components/AuthGuard', () => ({ default: ({ children }: any) => <div data-testid="auth-guard">{children}</div> }));
vi.mock('@/components/FeedsClientWrapper', () => ({ default: () => <div data-testid="feeds-client-wrapper" /> }));
vi.mock('@/components/ArticleCard', () => ({ default: ({ article }: any) => <div data-testid="article-card">{article.title}</div> }));
vi.mock('@/components/FollowButton', () => ({ default: () => <div data-testid="follow-button" /> }));

describe('Feed Pages', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('My Feeds Page', () => {
        it('renders FeedsClientWrapper with user feeds', async () => {
            (cookies as any).mockResolvedValue({ get: () => ({ value: 'token' }) });
            (verifyToken as any).mockReturnValue({ userId: 1 });

            // Access mock via the module
            const prismaMock = getPrismaActivity() as any;
            prismaMock.feed.findMany.mockResolvedValue([
                { id: 1, name: 'My Feed', tagIds: [1n], publisherIds: [2n], userId: 1n, createdAt: new Date() }
            ]);

            const jsx = await FeedsPage();
            render(jsx);

            expect(screen.getByTestId('feeds-client-wrapper')).toBeInTheDocument();
            expect(prismaMock.feed.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: 1 } }));
        });

        it('handles unauthenticated state gracefully', async () => {
            (cookies as any).mockResolvedValue({ get: () => undefined });

            const jsx = await FeedsPage();
            render(jsx);

            expect(screen.getByTestId('feeds-client-wrapper')).toBeInTheDocument();
        });
    });

    describe('Feed Detail Page', () => {
        const params = Promise.resolve({ feedId: '100' });

        it('renders feed details and articles', async () => {
            const prismaMock = getPrismaActivity() as any;
            prismaMock.feed.findUnique.mockResolvedValue({
                id: 100, name: 'My Tech Feed', description: 'Desc', tagIds: [1n], publisherIds: []
            });
            (getSession as any).mockResolvedValue({ user: { id: 1 } });

            const jsx = await FeedPage({ params });
            render(jsx);

            expect(screen.getByText('My Tech Feed')).toBeInTheDocument();
            expect(screen.getByText('Article 1')).toBeInTheDocument();
            expect(screen.getByTestId('follow-button')).toBeInTheDocument();
        });

        it('calls notFound if feed does not exist', async () => {
            const prismaMock = getPrismaActivity() as any;
            prismaMock.feed.findUnique.mockResolvedValue(null);

            // Important: Make notFound throw!
            (notFound as any).mockImplementation(() => { throw new Error('NEXT_NOT_FOUND') });

            await expect(FeedPage({ params })).rejects.toThrow('NEXT_NOT_FOUND');
            expect(notFound).toHaveBeenCalled();
        });

        it('calls notFound if invalid ID', async () => {
            (notFound as any).mockImplementation(() => { throw new Error('NEXT_NOT_FOUND') });
            await expect(FeedPage({ params: Promise.resolve({ feedId: 'abc' }) })).rejects.toThrow('NEXT_NOT_FOUND');
            expect(notFound).toHaveBeenCalled();
        });
    });
});
