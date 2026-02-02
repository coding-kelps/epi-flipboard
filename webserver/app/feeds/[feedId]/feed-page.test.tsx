import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FeedPage from './page';
import { notFound } from 'next/navigation';
import * as prismaLib from '@/lib/prisma';
import * as articlesLib from '@/lib/articles';
import * as authLib from '@/lib/auth';
import * as actionsLib from '@/app/actions';
import * as feedActivityLib from '@/lib/feed-activity';

// Mock dependencies
vi.mock('next/navigation', () => ({
    notFound: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
    getPrismaActivity: vi.fn(),
    getPrismaContent: vi.fn(),
}));

vi.mock('@/lib/articles', () => ({
    getArticlesByTags: vi.fn(),
    checkImageResolution: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
    getSession: vi.fn(),
}));

vi.mock('@/app/actions', () => ({
    getIsFollowingFeed: vi.fn(),
}));

vi.mock('@/lib/feed-activity', () => ({
    updateFeedLastVisit: vi.fn(),
}));

// Mock Components
vi.mock('@/components/ArticleCard', () => ({
    default: ({ article, variant }: any) => <div data-testid={`article-card-${variant}`}>{article.title}</div>
}));

vi.mock('@/components/FollowButton', () => ({
    default: () => <button>Follow</button>
}));

describe('FeedPage', () => {
    const mockPrismaActivity = {
        feed: {
            findUnique: vi.fn(),
        }
    };

    const mockPrismaContent = {
        tags: {
            findMany: vi.fn(),
        },
        publishers: {
            findMany: vi.fn(),
        }
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (prismaLib.getPrismaActivity as any).mockReturnValue(mockPrismaActivity);
        (prismaLib.getPrismaContent as any).mockReturnValue(mockPrismaContent);
    });

    const mockFeed = {
        id: 1,
        name: 'Test Feed',
        description: 'Test Description',
        tagIds: [1n],
        publisherIds: [1n],
    };

    const mockTags = [{ tag_id: 1n, name: 'Tag1' }];
    const mockPublishers = [{ publisher_id: 1n, display_name: 'Pub1', name: 'Pub1' }];
    const mockArticles = Array.from({ length: 20 }, (_, i) => ({
        article_id: i,
        title: `Article ${i}`,
        image_url: `http://example.com/img${i}.jpg`,
    }));

    it('renders feed content correctly', async () => {
        mockPrismaActivity.feed.findUnique.mockResolvedValue(mockFeed);
        mockPrismaContent.tags.findMany.mockResolvedValue(mockTags);
        mockPrismaContent.publishers.findMany.mockResolvedValue(mockPublishers);
        (articlesLib.getArticlesByTags as any).mockResolvedValue(mockArticles);
        (articlesLib.checkImageResolution as any).mockResolvedValue(true);
        (authLib.getSession as any).mockResolvedValue({ user: { id: 123 } });
        (actionsLib.getIsFollowingFeed as any).mockResolvedValue(false);

        const jsx = await FeedPage({ params: Promise.resolve({ feedId: '1' }) });
        render(jsx);

        expect(screen.getByText('Test Feed')).toBeInTheDocument();
        expect(screen.getByText('Test Description')).toBeInTheDocument();
        expect(screen.getByText('Tag1')).toBeInTheDocument();
        expect(screen.getByText('Pub1')).toBeInTheDocument();

        // Check for articles rendering (Lead, Standard, Compact)
        // We mocked ArticleCard to output title
        expect(screen.getByText('Article 0')).toBeInTheDocument(); // Lead
        expect(screen.getByText('Article 1')).toBeInTheDocument(); // Top stories
    });

    it('calls notFound if invalid feedId', async () => {
        try {
            await FeedPage({ params: Promise.resolve({ feedId: 'abc' }) });
        } catch { }
        expect(notFound).toHaveBeenCalled();
    });

    it('calls notFound if feed does not exist', async () => {
        mockPrismaActivity.feed.findUnique.mockResolvedValue(null);
        try {
            await FeedPage({ params: Promise.resolve({ feedId: '999' }) });
        } catch { }
        expect(notFound).toHaveBeenCalled();
    });

    it('shows empty state if no articles', async () => {
        mockPrismaActivity.feed.findUnique.mockResolvedValue(mockFeed);
        mockPrismaContent.tags.findMany.mockResolvedValue(mockTags);
        mockPrismaContent.publishers.findMany.mockResolvedValue([]);
        (articlesLib.getArticlesByTags as any).mockResolvedValue([]);

        const jsx = await FeedPage({ params: Promise.resolve({ feedId: '1' }) });
        render(jsx);

        expect(screen.getByText('No articles found for these tags yet.')).toBeInTheDocument();
    });

    it('updates last visit if user logged in', async () => {
        mockPrismaActivity.feed.findUnique.mockResolvedValue(mockFeed);
        mockPrismaContent.tags.findMany.mockResolvedValue([]);
        mockPrismaContent.publishers.findMany.mockResolvedValue([]);
        (articlesLib.getArticlesByTags as any).mockResolvedValue([]); // Empty to return early/simple render
        (authLib.getSession as any).mockResolvedValue({ user: { id: '777' } });

        const jsx = await FeedPage({ params: Promise.resolve({ feedId: '1' }) });
        render(jsx);

        expect(feedActivityLib.updateFeedLastVisit).toHaveBeenCalledWith(777, 1);
    });
});
