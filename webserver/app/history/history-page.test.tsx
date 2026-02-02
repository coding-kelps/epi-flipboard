import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import HistoryPage from './page';
import * as authProvider from '@/components/AuthProvider';

// Mock dependencies
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock AuthProvider hook
const mockUseAuth = vi.fn();
vi.mock('@/components/AuthProvider', async (importOriginal) => {
    const actual = await importOriginal<typeof authProvider>();
    return {
        ...actual,
        useAuth: () => mockUseAuth(),
    };
});

// Mock ArticleCard
vi.mock('@/components/ArticleCard', () => ({
    default: ({ article }: any) => <div data-testid="article-card">{article.title}</div>
}));

describe('HistoryPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseAuth.mockReturnValue({
            user: { id: 1 },
            isAuthenticated: true,
            loading: false,
        });
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({ articles: [], pagination: { hasMore: false } }),
        });
    });

    it('shows loading state initially', () => {
        mockUseAuth.mockReturnValue({ // Wait, useEffect triggers fetch only if isAuthenticated.
            user: { id: 1 },
            isAuthenticated: true,
            loading: false,
        });

        // But internal state `isLoading` is true by default.
        // It renders skeletons if loading && articles.length === 0

        const { container } = render(<HistoryPage />);
        expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('shows sign in prompt if not authenticated', () => {
        mockUseAuth.mockReturnValue({
            user: null,
            isAuthenticated: false,
            loading: false,
        });

        render(<HistoryPage />);
        expect(screen.getByText('Sign in to view your history')).toBeInTheDocument();
    });

    it('fetches and renders history articles', async () => {
        const mockArticles = [
            { article_id: 101, title: 'Read Article 1', readAt: '2023-01-01' },
            { article_id: 102, title: 'Read Article 2', readAt: '2023-01-02' }
        ];

        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({ articles: mockArticles, pagination: { hasMore: false } }),
        });

        render(<HistoryPage />);

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/history'));
        });

        expect(screen.getByText('Read Article 1')).toBeInTheDocument();
        expect(screen.getByText('Read Article 2')).toBeInTheDocument();
    });

    it('shows empty state', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({ articles: [], pagination: { hasMore: false } }),
        });

        render(<HistoryPage />);

        await waitFor(() => {
            expect(screen.getByText("You haven't read any articles yet.")).toBeInTheDocument();
        });
    });

    it('loads more history', async () => {
        const mockArticlesPage1 = [{ article_id: 1, title: 'History Page 1', readAt: 'd1' }];
        const mockArticlesPage2 = [{ article_id: 2, title: 'History Page 2', readAt: 'd2' }];

        mockFetch
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ articles: mockArticlesPage1, pagination: { hasMore: true } }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ articles: mockArticlesPage2, pagination: { hasMore: false } }),
            });

        render(<HistoryPage />);

        await waitFor(() => {
            expect(screen.getByText('History Page 1')).toBeInTheDocument();
        });

        const loadMoreBtn = screen.getByText('Load More');
        fireEvent.click(loadMoreBtn);

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('page=2'));
            expect(screen.getByText('History Page 2')).toBeInTheDocument();
        });
    });

    it('handles fetch error', async () => {
        mockFetch.mockRejectedValue(new Error('API Error'));
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        render(<HistoryPage />);

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalled();
        });

        expect(screen.getByText("You haven't read any articles yet.")).toBeInTheDocument();
        consoleSpy.mockRestore();
    });
});
