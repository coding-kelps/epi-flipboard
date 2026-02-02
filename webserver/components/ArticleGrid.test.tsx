import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ArticleGrid from './ArticleGrid';
import { Article } from '@/lib/articles';

// Mock minimal Article data
const mockArticle = (id: number): Article => ({
    article_id: BigInt(id),
    title: `Article ${id}`,
    description: 'Description',
    published_at: new Date(),
    image_url: 'http://example.com/image.jpg',
    url: 'http://example.com',
    original_url: 'http://example.com/original',
    content: 'Content',
    summary: 'Summary',
    publisher_id: BigInt(1),
    publishers: { name: 'Pub', display_name: 'Publisher', main_url: '', logo_url: '' },
    article_tag: [],
    _count: { comments: 0 },
    isSaved: false,
});

describe('ArticleGrid', () => {
    it('renders articles in grid', () => {
        const articles = [mockArticle(1), mockArticle(2), mockArticle(3)];
        render(<ArticleGrid articles={articles} />);

        expect(screen.getByText('Article 1')).toBeInTheDocument();
        expect(screen.getByText('Article 2')).toBeInTheDocument();
        expect(screen.getByText('Article 3')).toBeInTheDocument();
    });

    it('renders empty grid gracefully', () => {
        render(<ArticleGrid articles={[]} />);
        expect(screen.queryByRole('article')).not.toBeInTheDocument();
    });
});
