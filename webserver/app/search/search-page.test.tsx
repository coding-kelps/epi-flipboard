import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SearchPage from './page';
import * as articlesLib from '@/lib/articles';

vi.mock('@/lib/articles', () => ({
    searchArticles: vi.fn(),
    checkImageResolution: vi.fn(),
}));

vi.mock('@/components/ArticleCard', () => ({
    default: ({ article, variant }: any) => <div data-testid={`article-card-${variant}`}>{article.title}</div>
}));

describe('SearchPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (articlesLib.checkImageResolution as any).mockResolvedValue(true);
    });

    it('renders please enter search term if empty query', async () => {
        const jsx = await SearchPage({ searchParams: Promise.resolve({ q: '' }) });
        render(jsx);
        expect(screen.getByText('Please enter a search term.')).toBeInTheDocument();
    });

    it('renders no results found', async () => {
        (articlesLib.searchArticles as any).mockResolvedValue([]);
        const jsx = await SearchPage({ searchParams: Promise.resolve({ q: 'missing' }) });
        render(jsx);
        expect(screen.getByText('No articles found for "missing".')).toBeInTheDocument();
    });

    it('renders search results correctly', async () => {
        const mockArticles = Array.from({ length: 10 }, (_, i) => ({
            article_id: i,
            title: `Article ${i}`,
            image_url: `http://example.com/img${i}.jpg`,
        }));
        (articlesLib.searchArticles as any).mockResolvedValue(mockArticles);

        const jsx = await SearchPage({ searchParams: Promise.resolve({ q: 'tech' }) });
        render(jsx);

        expect(screen.getByText('Search Results for "tech"')).toBeInTheDocument();
        // Should have a lead story
        expect(screen.getByTestId('article-card-lead')).toBeInTheDocument();
        expect(screen.getByText('Article 0')).toBeInTheDocument();
    });
});
