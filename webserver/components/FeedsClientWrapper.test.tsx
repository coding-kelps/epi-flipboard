import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import FeedsClientWrapper from './FeedsClientWrapper'
import userEvent from '@testing-library/user-event'

// Mock CreateFeedModal
vi.mock('./CreateFeedModal', () => ({
    default: ({ isOpen, onClose, initialData }: any) =>
        isOpen ? (
            <div data-testid="create-feed-modal">
                <button onClick={onClose}>Close</button>
                <span>
                    {initialData ? `Edit ${initialData.name}` : 'Create New'}
                </span>
            </div>
        ) : null,
}))

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock useRouter
const mockRefresh = vi.fn()
vi.mock('next/navigation', () => ({
    useRouter: () => ({ refresh: mockRefresh }),
}))

describe('FeedsClientWrapper', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockFetch.mockResolvedValue({ ok: true })
    })

    const mockFeeds = [
        {
            id: 1,
            name: 'Tech Feed',
            description: 'Tech news',
            tagIds: [1, 2],
            publisherIds: [],
            userId: 1,
            createdAt: new Date().toISOString(),
        },
    ]

    it('renders empty state when no feeds', () => {
        render(<FeedsClientWrapper initialFeeds={[]} />)
        expect(screen.getByText('No feeds yet')).toBeInTheDocument()
        expect(screen.getByText('Create New Feed')).toBeInTheDocument()
    })

    it('renders list of feeds', () => {
        render(<FeedsClientWrapper initialFeeds={mockFeeds} />)
        expect(screen.getByText('Tech Feed')).toBeInTheDocument()
        expect(screen.getByText('2 tags')).toBeInTheDocument()
    })

    it('opens create modal', async () => {
        const user = userEvent.setup()
        render(<FeedsClientWrapper initialFeeds={mockFeeds} />)

        await user.click(screen.getByText('Create New Feed'))
        expect(screen.getByTestId('create-feed-modal')).toBeInTheDocument()
        expect(screen.getByText('Create New')).toBeInTheDocument()
    })

    it('opens edit modal with feed data', async () => {
        const user = userEvent.setup()
        render(<FeedsClientWrapper initialFeeds={mockFeeds} />)

        // Find edit button (assuming specific structure or title)
        // The component uses an icon button with title="Edit Feed"
        await user.click(screen.getByTitle('Edit Feed'))

        expect(screen.getByTestId('create-feed-modal')).toBeInTheDocument()
        expect(screen.getByText('Edit Tech Feed')).toBeInTheDocument()
    })

    it('deletes feed after confirmation', async () => {
        const user = userEvent.setup()
        // Mock window.confirm
        const mockConfirm = vi.spyOn(window, 'confirm').mockReturnValue(true)

        render(<FeedsClientWrapper initialFeeds={mockFeeds} />)

        await user.click(screen.getByTitle('Delete Feed'))

        expect(mockConfirm).toHaveBeenCalled()
        expect(mockFetch).toHaveBeenCalledWith('/api/feeds/1', {
            method: 'DELETE',
        })
        await waitFor(() => {
            expect(mockRefresh).toHaveBeenCalled()
        })
    })

    it('cancels delete', async () => {
        const user = userEvent.setup()
        const mockConfirm = vi.spyOn(window, 'confirm').mockReturnValue(false)

        render(<FeedsClientWrapper initialFeeds={mockFeeds} />)

        await user.click(screen.getByTitle('Delete Feed'))

        expect(mockConfirm).toHaveBeenCalled()
        expect(mockFetch).not.toHaveBeenCalled()
    })
})
