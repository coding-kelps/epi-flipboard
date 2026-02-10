import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import FeedUpdateItem from './FeedUpdateItem'
import { defaultAuthContext } from '@/lib/test-utils'
import userEvent from '@testing-library/user-event'
import { FollowedFeedWithMetadata } from '@/lib/feed-activity'

const mockUseAuth = vi.fn()
vi.mock('@/components/AuthProvider', () => ({
    useAuth: () => mockUseAuth(),
}))

const mockFeed: FollowedFeedWithMetadata = {
    id: 1,
    name: 'Tech Feed',
    url: 'http://tech.com',
    user_id: 1,
    created_at: new Date(),
    feed_id: 1n,
    newArticlesCount: 5,
}

describe('FeedUpdateItem', () => {
    it('renders feed info', () => {
        mockUseAuth.mockReturnValue(defaultAuthContext)
        render(<FeedUpdateItem feed={mockFeed} />)

        expect(screen.getByText('Tech Feed')).toBeInTheDocument()
        expect(screen.getByText('5 new articles')).toBeInTheDocument()
    })

    it('requests auth if not logged in', async () => {
        const user = userEvent.setup()
        mockUseAuth.mockReturnValue(defaultAuthContext)
        render(<FeedUpdateItem feed={mockFeed} />)

        await user.click(screen.getByRole('link'))
        expect(defaultAuthContext.openAuthModal).toHaveBeenCalled()
    })
})
