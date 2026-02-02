import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CreateFeedModal, { FeedData } from './CreateFeedModal';
import userEvent from '@testing-library/user-event';

// Mock Fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock useRouter
const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({ refresh: mockRefresh }),
}));

describe('CreateFeedModal', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => [],
        });
    });

    const defaultProps = {
        isOpen: true,
        onClose: vi.fn(),
    };

    it('renders correctly', () => {
        render(<CreateFeedModal {...defaultProps} />);
        expect(screen.getByText('Create New Feed')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('e.g. Tech Trends')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Create Feed' })).toBeInTheDocument();
    });

    it('submits form successfully', async () => {
        const user = userEvent.setup();
        mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) }); // For submit

        render(<CreateFeedModal {...defaultProps} />);

        await user.type(screen.getByPlaceholderText('e.g. Tech Trends'), 'My New Feed');
        await user.type(screen.getByPlaceholderText('What is this feed about?'), 'Cool stuff');

        await user.click(screen.getByRole('button', { name: 'Create Feed' }));

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith('/api/feeds', expect.objectContaining({
                method: 'POST',
                body: expect.stringContaining('My New Feed'),
            }));
            expect(defaultProps.onClose).toHaveBeenCalled();
            expect(mockRefresh).toHaveBeenCalled();
        });
    });

    it('searches and adds tags', async () => {
        const user = userEvent.setup();
        const mockTags = [{ tag_id: 1, name: 'javascript' }];
        // Default empty response for unrelated calls
        mockFetch.mockResolvedValue({ ok: true, json: async () => [] });
        // Specific mock for search
        mockFetch.mockImplementation((url) => {
            if (url.includes('/api/tags/search')) {
                return Promise.resolve({ ok: true, json: async () => mockTags });
            }
            return Promise.resolve({ ok: true, json: async () => [] });
        });

        render(<CreateFeedModal {...defaultProps} />);

        const searchInput = screen.getByPlaceholderText('Search tags...');
        await user.type(searchInput, 'java');

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith('/api/tags/search?q=java');
            expect(screen.getByText('javascript', { selector: 'button' })).toBeInTheDocument();
        });

        await user.click(screen.getByText('javascript', { selector: 'button' }));

        expect(screen.getByText('javascript', { selector: 'span' })).toBeInTheDocument();
    });

    it('searches and adds publishers', async () => {
        const user = userEvent.setup();
        const mockPubs = [{ publisher_id: 'p1', name: 'Tech Daily' }];

        mockFetch.mockImplementation((url) => {
            if (url.includes('/api/publishers/search')) {
                return Promise.resolve({ ok: true, json: async () => mockPubs });
            }
            return Promise.resolve({ ok: true, json: async () => [] });
        });

        render(<CreateFeedModal {...defaultProps} />);

        const searchInput = screen.getByPlaceholderText('Search publishers...');
        await user.type(searchInput, 'Tech');

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith('/api/publishers/search?q=Tech');
            expect(screen.getByText('Tech Daily', { selector: 'button' })).toBeInTheDocument();
        });

        await user.click(screen.getByText('Tech Daily', { selector: 'button' }));

        expect(screen.getByText('Tech Daily', { selector: 'span' })).toBeInTheDocument();
    });

    it('removes tags and publishers', async () => {
        const user = userEvent.setup();

        // Setup initial state manually or use logic to add them first
        // Easier to simulate adding first since props don't allow deep preset easily without mocking initialData logic
        // But we can test initialData flow too.

        const initialData: FeedData = {
            id: 123,
            name: 'Edit Me',
            description: 'Desc',
            tagIds: [1],
            tags: [{ tag_id: 1, name: 'RemoveTag' }],
            publisherIds: [], // publisherIds is a number array in interface? wait, in interface it IS number[] but publishers has string id in Publisher interface?
            // Let's check interface in modal: Publisher { publisher_id: string }
            // FeedData: publisherIds?: number[]. This mismatch in source code might be an issue or handled by casting.
            // In modal code: publisherIds: selectedPublishers.map(p => p.publisher_id)
            // But helper says getPublishersByIds(publisherIds: bigint[]).
            // Let's stick to what the component consumes.
            publishers: [{ publisher_id: 'p2', name: 'RemovePub' }]
        };

        render(<CreateFeedModal {...defaultProps} initialData={initialData} />);

        // Verify present
        expect(screen.getByText('RemoveTag')).toBeInTheDocument();
        expect(screen.getByText('RemovePub')).toBeInTheDocument();

        // Remove Tag (look for close button in the span)
        // Structure: <span>Name <button><X/></button></span>
        const removeTagBtn = screen.getByText('RemoveTag').querySelector('button');
        await user.click(removeTagBtn!);

        expect(screen.queryByText('RemoveTag')).not.toBeInTheDocument();

        // Remove Publisher
        const removePubBtn = screen.getByText('RemovePub').querySelector('button');
        await user.click(removePubBtn!);
        expect(screen.queryByText('RemovePub')).not.toBeInTheDocument();
    });

    it('fetches tags and publishers if only IDs provided in initialData', async () => {
        const initialData: FeedData = {
            id: 123,
            name: 'Edit Me',
            description: 'Desc',
            tagIds: [10],
            publisherIds: [20]
        };

        mockFetch.mockImplementation((url) => {
            if (url.includes('/api/tags/search?ids=10')) {
                return Promise.resolve({ ok: true, json: async () => [{ tag_id: 10, name: 'FetchedTag' }] });
            }
            if (url.includes('/api/publishers/search?ids=20')) {
                // Warning: publisherIds in FeedData is number[], but in Publisher it is string.
                // The Modal code uses `selectedPublishers` which are `Publisher` objects.
                // The useEffect calls `/api/publishers/search?ids=...`
                return Promise.resolve({ ok: true, json: async () => [{ publisher_id: '20', name: 'FetchedPub' }] });
            }
            return Promise.resolve({ ok: true, json: async () => [] });
        });

        render(<CreateFeedModal {...defaultProps} initialData={initialData} />);

        await waitFor(() => {
            expect(screen.getByText('FetchedTag')).toBeInTheDocument();
            expect(screen.getByText('FetchedPub')).toBeInTheDocument();
        });
    });

    it('handles edit submission (PUT)', async () => {
        const user = userEvent.setup();
        const initialData: FeedData = {
            id: 999,
            name: 'Old Name',
            description: 'Old Desc',
            tagIds: [],
            publisherIds: []
        };

        mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

        render(<CreateFeedModal {...defaultProps} initialData={initialData} />);

        const nameInput = screen.getByDisplayValue('Old Name');
        await user.clear(nameInput);
        await user.type(nameInput, 'Updated Name');

        await user.click(screen.getByRole('button', { name: 'Save Changes' }));

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith('/api/feeds/999', expect.objectContaining({
                method: 'PUT',
                body: expect.stringContaining('Updated Name'),
            }));
        });
    });

    it('does not submit if name is empty', async () => {
        const user = userEvent.setup();
        render(<CreateFeedModal {...defaultProps} />);

        const submitBtn = screen.getByRole('button', { name: 'Create Feed' });
        expect(submitBtn).toBeDisabled();

        // Alternatively, if it wasn't disabled (it is in code), check fetch not called
        await user.click(submitBtn);
        expect(mockFetch).not.toHaveBeenCalled();
    });
});
