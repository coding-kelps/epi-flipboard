import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Home from './page'
import { Article } from '@/lib/articles'

// Mock dependencies
const mockGetArticles = vi.fn()
const mockGetSession = vi.fn()
const mockGetFollowedFeeds = vi.fn()
const mockCheckImageResolution = vi.fn()

vi.mock('@/lib/articles', () => ({
    getArticles: () => mockGetArticles(),
}))

vi.mock('@/lib/auth', () => ({
    getSession: () => mockGetSession(),
}))

vi.mock('@/lib/feed-activity', () => ({
    getFollowedFeedsWithMetadata: (id: number) => mockGetFollowedFeeds(id),
}))

vi.mock('@/lib/image-utils', () => ({
    checkImageResolution: (url: string) => mockCheckImageResolution(url),
}))

// Mock Components
vi.mock('@/components/ArticleCard', () => ({
    default: ({ article, variant }: { article: Article; variant: string }) => (
        <div data-testid={`article-card-${variant}`}>{article.title}</div>
    ),
}))

vi.mock('@/components/HomepageNav', () => ({
    default: () => <div data-testid="homepage-nav" />,
}))

vi.mock('@/components/FeedUpdateItem', () => ({
    default: ({ feed }: any) => (
        <div data-testid="feed-update">{feed.name}</div>
    ),
}))

describe('Home Page', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockGetSession.mockResolvedValue(null)
        mockGetFollowedFeeds.mockResolvedValue([])
        mockCheckImageResolution.mockResolvedValue(true)
    })

    const mockArticles: Article[] = Array.from({ length: 15 }, (_, i) => ({
        article_id: BigInt(i + 1),
        title: `Article ${i + 1}`,
        description: 'Desc',
        content: 'Content',
        summary: 'Summary',
        url: 'http://example.com',
        original_url: 'http://example.com',
        image_url: i % 2 === 0 ? 'http://img.com/img.jpg' : '',
        published_at: new Date(),
        publisher_id: BigInt(1),
        isSaved: false,
        _count: { article_tag: 1 },
        publishers: {
            name: 'Pub',
            image_url: null,
            publisher_id: BigInt(1),
            display_name: 'Pub',
        },
        article_tag: [],
    }))

    it('renders empty state when no articles', async () => {
        mockGetArticles.mockResolvedValue([])

        const jsx = await Home()
        render(jsx)

        expect(screen.getByText('No articles found.')).toBeInTheDocument()
    })

    it('renders articles and sidebar structure', async () => {
        mockGetArticles.mockResolvedValue(mockArticles)

        const jsx = await Home()
        render(jsx)

        expect(mockGetArticles).toHaveBeenCalled()

        // Lead story (first with high-res check, we mocked checkImageResolution=true, so first with image: Article 1 (index 0)
        expect(screen.getByTestId('article-card-lead')).toBeInTheDocument()
        expect(screen.getByText('Article 1')).toBeInTheDocument()

        // Top stories (next 2 with images): Article 3, Article 5
        const standardCards = screen.getAllByTestId('article-card-standard')
        expect(standardCards.length).toBeGreaterThan(0)

        // Homepage Nav
        expect(screen.getByTestId('homepage-nav')).toBeInTheDocument()
    })

    it('renders authenticated view with followed feeds', async () => {
        mockGetArticles.mockResolvedValue(mockArticles)
        mockGetSession.mockResolvedValue({ user: { id: '123' } })
        mockGetFollowedFeeds.mockResolvedValue([
            { id: 1, name: 'My Feed', newArticlesCount: 5 },
        ])

        const jsx = await Home()
        render(jsx)

        expect(mockGetFollowedFeeds).toHaveBeenCalledWith(123)
        expect(screen.getByText('Updates for You')).toBeInTheDocument()
        expect(screen.getByText('My Feed')).toBeInTheDocument()
    })
})
