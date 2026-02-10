import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import ProfilePage from '@/app/profile/page'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'

// Mock dependencies
const mockRouter = {
    push: vi.fn(),
    refresh: vi.fn(),
}

vi.mock('next/navigation', () => ({
    useRouter: () => mockRouter,
}))

// Mock Auth Hook
const mockUseAuth = vi.fn()
vi.mock('@/components/AuthProvider', () => ({
    useAuth: () => mockUseAuth(),
}))

describe('ProfilePage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockUseAuth.mockReturnValue({
            user: null,
            loading: true,
            logout: vi.fn(),
            refreshUser: vi.fn(),
        })
        global.fetch = vi.fn()
    })

    it('shows loading state initially', () => {
        const { container } = render(<ProfilePage />)
        // The loader is in a div with "min-h-screen"
        const loader = container.querySelector('.min-h-screen')
        expect(loader).toBeInTheDocument()
    })

    it('redirects if not authenticated after loading', async () => {
        mockUseAuth.mockReturnValue({
            user: null,
            loading: false,
            logout: vi.fn(),
            refreshUser: vi.fn(),
        })

        render(<ProfilePage />)

        expect(mockRouter.push).toHaveBeenCalledWith('/')
    })

    it('renders profile info when authenticated', () => {
        const user = { id: 1, email: 'test@example.com', name: 'Test User' }
        mockUseAuth.mockReturnValue({
            user,
            loading: false,
            logout: vi.fn(),
            refreshUser: vi.fn(),
        })

        render(<ProfilePage />)

        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument()
        expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument()
    })

    it('handles profile update', async () => {
        const user = { id: 1, email: 'test@example.com', name: 'Old Name' }
        const refreshUser = vi.fn()
        mockUseAuth.mockReturnValue({
            user,
            loading: false,
            logout: vi.fn(),
            refreshUser,
        })
        ;(global.fetch as any).mockResolvedValue({ ok: true })

        render(<ProfilePage />)

        const nameInput = screen.getByDisplayValue('Old Name')
        fireEvent.change(nameInput, { target: { value: 'New Name' } })

        const saveButton = screen.getByText('Save Changes')
        fireEvent.click(saveButton)

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                '/api/account/profile',
                expect.objectContaining({
                    method: 'PUT',
                    body: JSON.stringify({ name: 'New Name' }),
                })
            )
        })
        expect(refreshUser).toHaveBeenCalled()
        expect(
            screen.getByText('Profile updated successfully')
        ).toBeInTheDocument()
    })

    it('handles account deletion', async () => {
        const user = { id: 1, email: 'test@example.com', name: 'Test User' }
        mockUseAuth.mockReturnValue({
            user,
            loading: false,
            logout: vi.fn(),
            refreshUser: vi.fn(),
        })
        ;(global.fetch as any).mockResolvedValue({ ok: true })

        render(<ProfilePage />)

        // click delete
        fireEvent.click(screen.getByText('Delete Account'))

        // confirm email
        const confirmInput = screen.getByPlaceholderText('test@example.com')
        fireEvent.change(confirmInput, {
            target: { value: 'test@example.com' },
        })

        // click confirm
        fireEvent.click(screen.getByText('Confirm Deletion'))

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                '/api/account/delete',
                expect.objectContaining({
                    method: 'DELETE',
                })
            )
        })
        expect(mockRouter.push).toHaveBeenCalledWith('/')
    })
})
