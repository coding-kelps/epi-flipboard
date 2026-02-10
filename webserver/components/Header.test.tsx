import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Header from './Header'
import { defaultAuthContext, authenticatedContext } from '@/lib/test-utils'
import userEvent from '@testing-library/user-event'

// Mock dependencies
const mockUseAuth = vi.fn()
const mockPush = vi.fn()

vi.mock('@/components/AuthProvider', () => ({
    useAuth: () => mockUseAuth(),
}))

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}))

describe('Header', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockUseAuth.mockReturnValue(defaultAuthContext)
    })

    it('renders correctly', () => {
        render(<Header />)
        expect(screen.getByText('Epi FlipBoard')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
        // Check for dynamic date (rough check it exists)
        expect(screen.getByText(/Today’s News/i)).toBeInTheDocument()
    })

    it('shows login button when unauthenticated', () => {
        render(<Header />)
        expect(screen.getByText('Login / Sign up')).toBeInTheDocument()
        expect(screen.queryByText('Profile')).not.toBeInTheDocument()
    })

    it('shows user profile when authenticated', () => {
        mockUseAuth.mockReturnValue(authenticatedContext)
        render(<Header />)
        expect(screen.queryByText('Login / Sign up')).not.toBeInTheDocument()
        expect(screen.getByText('Test User')).toBeInTheDocument()
    })

    it('opens auth modal when login clicked', async () => {
        const user = userEvent.setup()
        render(<Header />)
        await user.click(screen.getByText('Login / Sign up'))
        expect(defaultAuthContext.openAuthModal).toHaveBeenCalled()
    })

    it('navigates on search', async () => {
        const user = userEvent.setup()
        render(<Header />)
        const input = screen.getByPlaceholderText('Search...')
        await user.type(input, 'Tech news')
        await user.type(input, '{enter}')

        expect(mockPush).toHaveBeenCalledWith('/search?q=Tech%20news')
    })

    it('does not navigate on empty search', async () => {
        const user = userEvent.setup()
        render(<Header />)
        const input = screen.getByPlaceholderText('Search...')
        await user.type(input, '{enter}')
        expect(mockPush).not.toHaveBeenCalled()
    })
})
