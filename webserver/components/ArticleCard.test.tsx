import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ArticleCard from './ArticleCard';
import { authenticatedContext, defaultAuthContext } from '@/lib/test-utils';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Mock useAuth locally
const mockUseAuth = vi.fn();

vi.mock('@/components/AuthProvider', () => ({
    useAuth: () => mockUseAuth(),
    AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));


// Helper to mock fetch
function mockFetch(status = 200, data: any = {}) {
    global.fetch = vi.fn((url: string | Request) => {
        if (typeof url === 'string' && url.includes('/api/comments') && !data.length) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve([]),
            });
        }
        return Promise.resolve({
            ok: status >= 200 && status < 300,
            json: () => Promise.resolve(data),
        });
    }) as any;
}

const mockArticle = {
    article_id: 1n,
    title: 'Test Article Card',
    description: 'Card Description',
    published_at: new Date('2024-01-01'),
    image_url: 'http://example.com/image.jpg',
    url: 'http://example.com/article',
    original_url: 'http://example.com/original',
    content: 'Content',
    summary: 'Summary',
    publisher_id: 1n,
    publishers: { name: 'Test Publisher', display_name: 'Display Pub', main_url: '', logo_url: '' },
    article_tag: [{ tags: { name: 'Tech', id: 1n } }],
    _count: { comments: 2 },
    isSaved: false,
};

describe('ArticleCard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseAuth.mockReturnValue(defaultAuthContext);
        mockFetch();
    });

    it('renders standard variant correctly', () => {
        render(<ArticleCard article={mockArticle} variant="standard" />);
        expect(screen.getByText('Test Article Card')).toBeInTheDocument();
        expect(screen.getByText('Card Description')).toBeInTheDocument();
        expect(screen.getByText('By Display Pub')).toBeInTheDocument(); // CSS handles uppercase
        expect(screen.getByText('2 Comments')).toBeInTheDocument();
    });

    it('renders compact variant correctly', () => {
        render(<ArticleCard article={mockArticle} variant="compact" />);
        expect(screen.getByText('Test Article Card')).toBeInTheDocument();
        // Compact might show fewer details
        expect(screen.queryByText('Card Description')).not.toBeInTheDocument();
    });

    it('renders lead variant correctly', () => {
        render(<ArticleCard article={mockArticle} variant="lead" />);
        expect(screen.getByText('Test Article Card')).toBeInTheDocument();
        expect(screen.getByRole('img')).toHaveAttribute('alt', 'Test Article Card');
    });

    it('opens sidebar when clicked', async () => {
        const user = userEvent.setup();
        render(<ArticleCard article={mockArticle} />);

        // Find the main card container (article element)
        // ArticleCard renders one article tag for the card itself.
        const card = screen.getByRole('article');
        await user.click(card);

        // Sidebar should be in the document
        await waitFor(() => {
            expect(screen.getByText('Read Full Article')).toBeInTheDocument();
        });
    });

    it('records history when clicked if authenticated', async () => {
        const user = userEvent.setup();
        mockUseAuth.mockReturnValue(authenticatedContext);
        render(<ArticleCard article={mockArticle} />);

        const card = screen.getByRole('article');
        await user.click(card);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/history/record', expect.anything());
        });
    });

    it('toggles save/bookmark status', async () => {
        const user = userEvent.setup();
        mockUseAuth.mockReturnValue(authenticatedContext);
        render(<ArticleCard article={mockArticle} />);

        const saveButtons = screen.getAllByRole('button', { name: /save/i });
        const saveButton = saveButtons[0];

        await user.click(saveButton);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/articles/mark', expect.objectContaining({
                method: 'POST',
                body: expect.stringContaining('"action":"mark"')
            }));
        });
    });

    it('prompts login if trying to save while unauthenticated', async () => {
        const user = userEvent.setup();
        mockUseAuth.mockReturnValue(defaultAuthContext);
        render(<ArticleCard article={mockArticle} />);

        const saveButtons = screen.getAllByRole('button', { name: /save/i });
        const saveButton = saveButtons[0];

        await user.click(saveButton);

        await waitFor(() => {
            expect(defaultAuthContext.openAuthModal).toHaveBeenCalled();
        });
        expect(global.fetch).not.toHaveBeenCalledWith('/api/articles/mark', expect.anything());

    });

    it('allows posting a comment when authenticated', async () => {
        const user = userEvent.setup();
        mockUseAuth.mockReturnValue(authenticatedContext);
        render(<ArticleCard article={mockArticle} />);

        // Open sidebar
        const card = screen.getByRole('article');
        await user.click(card);

        // Wait for sidebar
        await waitFor(() => {
            expect(screen.getByText('Comments')).toBeInTheDocument();
        });

        const textarea = screen.getByPlaceholderText('Write a thought...');
        await user.type(textarea, 'Nice article!');

        const postButton = screen.getByRole('button', { name: /post comment/i });
        await user.click(postButton);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/comments', expect.objectContaining({
                method: 'POST',
                body: expect.stringContaining('Nice article!')
            }));
        });
    });
});
