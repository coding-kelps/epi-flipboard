import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import MarkedArticlesPage from './page'
import * as authProvider from '@/components/AuthProvider'

// Mock dependencies
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock AuthProvider hook
const mockUseAuth = vi.fn()
vi.mock('@/components/AuthProvider', async (importOriginal) => {
    const actual = await importOriginal<typeof authProvider>()
    return {
        ...actual,
        useAuth: () => mockUseAuth(),
    }
})

// Mock AuthGuard (just render children)
vi.mock('@/components/AuthGuard', () => ({
    default: ({ children }: any) => <>{children}</>,
}))

// Mock ArticleCard
vi.mock('@/components/ArticleCard', () => ({
    default: ({ article }: any) => (
        <div data-testid="article-card">{article.title}</div>
    ),
}))

describe('MarkedArticlesPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockUseAuth.mockReturnValue({
            user: { id: 1 },
            isAuthenticated: true,
            loading: false,
        })
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({
                markedArticles: [],
                pagination: { hasMore: false },
            }),
        })
    })

    it('shows loading state initially', () => {
        // Force loading state
        mockUseAuth.mockReturnValue({
            user: null,
            isAuthenticated: false,
            loading: true,
        })

        const { container } = render(<MarkedArticlesPage />)
        expect(container.querySelector('.animate-spin')).toBeInTheDocument()
    })

    it('fetches and renders articles', async () => {
        const mockArticles = [
            { article_id: 1, title: 'Saved Article 1' },
            { article_id: 2, title: 'Saved Article 2' },
        ]

        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({
                markedArticles: mockArticles,
                pagination: { hasMore: false },
            }),
        })

        render(<MarkedArticlesPage />)

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/articles/marked?userId=1')
            )
        })

        expect(screen.getByText('Saved Article 1')).toBeInTheDocument()
        expect(screen.getByText('Saved Article 2')).toBeInTheDocument()
    })

    it('shows empty state', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({
                markedArticles: [],
                pagination: { hasMore: false },
            }),
        })

        render(<MarkedArticlesPage />)

        await waitFor(() => {
            expect(
                screen.getByText("You haven't saved any articles yet.")
            ).toBeInTheDocument()
        })
    })

    it('loads more articles', async () => {
        const mockArticlesPage1 = [{ article_id: 1, title: 'Page 1' }]
        const mockArticlesPage2 = [{ article_id: 2, title: 'Page 2' }]

        // Mock fetch to return different pages
        mockFetch
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    markedArticles: mockArticlesPage1,
                    pagination: { hasMore: true },
                }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    markedArticles: mockArticlesPage2,
                    pagination: { hasMore: false },
                }),
            })

        render(<MarkedArticlesPage />)

        // Wait for first load
        await waitFor(() => {
            expect(screen.getByText('Page 1')).toBeInTheDocument()
            expect(screen.getByText('Load More')).toBeInTheDocument()
        })

        // Click load more
        const loadMoreBtn = screen.getByText('Load More')
        fireEvent.click(loadMoreBtn)

        // Wait for second load
        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('page=2')
            )
            expect(screen.getByText('Page 2')).toBeInTheDocument()
        })

        expect(screen.queryByText('Load More')).not.toBeInTheDocument()
    })

    it('handles fetch error', async () => {
        mockFetch.mockRejectedValue(new Error('Network error'))

        // Mock console.error to avoid noise
        const consoleSpy = vi
            .spyOn(console, 'error')
            .mockImplementation(() => {})

        render(<MarkedArticlesPage />)

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalled()
        })

        // Should stop loading (and presumably show empty or previous state, currently logic just stops loading)
        // If empty, it shows "You haven't saved any articles yet." because articles is []
        expect(
            screen.getByText("You haven't saved any articles yet.")
        ).toBeInTheDocument()

        consoleSpy.mockRestore()
    })
})
