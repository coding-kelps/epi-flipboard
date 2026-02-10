import { render, screen, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from './AuthProvider'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import React from 'react'

// Mock dependencies
const mockRouter = {
    push: vi.fn(),
    refresh: vi.fn(),
}

vi.mock('next/navigation', () => ({
    useRouter: () => mockRouter,
}))

// Mock AuthModal to avoid complex rendering and focus logic in unit test
vi.mock('@/components/AuthModal', () => ({
    default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
        isOpen ? (
            <div data-testid="auth-modal">
                <button onClick={onClose}>Close</button>
            </div>
        ) : null,
}))

// Helper component to test hook
const TestComponent = () => {
    const {
        user,
        loading,
        login,
        logout,
        isAuthenticated,
        openAuthModal,
        closeAuthModal,
    } = useAuth()

    if (loading) return <div>Loading...</div>

    return (
        <div>
            <div data-testid="auth-status">
                {isAuthenticated ? 'Authenticated' : 'Guest'}
            </div>
            {user && <div data-testid="user-email">{user.email}</div>}
            <button onClick={() => login()}>Login</button>
            <button onClick={logout}>Logout</button>
            <button onClick={openAuthModal}>Open Modal</button>
            <button onClick={closeAuthModal}>Close Modal</button>
        </div>
    )
}

describe('AuthProvider', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        global.fetch = vi.fn()
    })

    it('loads user on mount', async () => {
        const mockUser = { id: 1, email: 'test@example.com', name: 'Test' }
        ;(global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => ({ user: mockUser }),
        })

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        )

        expect(screen.getByText('Loading...')).toBeInTheDocument()

        await waitFor(() => {
            expect(screen.getByTestId('auth-status')).toHaveTextContent(
                'Authenticated'
            )
        })
        expect(screen.getByTestId('user-email')).toHaveTextContent(
            mockUser.email
        )
    })

    it('handles failed user load (guest)', async () => {
        ;(global.fetch as any).mockResolvedValue({
            ok: false,
        })

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        )

        await waitFor(() => {
            expect(screen.getByTestId('auth-status')).toHaveTextContent('Guest')
        })
    })

    it('handles logout', async () => {
        const mockUser = { id: 1, email: 'test@example.com', name: 'Test' }
        // Initial load success
        ;(global.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ user: mockUser }),
        })
        // Logout success
        ;(global.fetch as any).mockResolvedValueOnce({ ok: true })

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        )

        await waitFor(() =>
            expect(screen.getByTestId('auth-status')).toHaveTextContent(
                'Authenticated'
            )
        )

        await userEvent.click(screen.getByText('Logout'))

        await waitFor(() => {
            expect(screen.getByTestId('auth-status')).toHaveTextContent('Guest')
        })
        expect(mockRouter.push).toHaveBeenCalledWith('/')
        expect(mockRouter.refresh).toHaveBeenCalled()
    })

    it('opens and closes modal', async () => {
        ;(global.fetch as any).mockResolvedValue({ ok: false })

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        )

        await waitFor(() =>
            expect(screen.getByTestId('auth-status')).toHaveTextContent('Guest')
        )

        await userEvent.click(screen.getByText('Open Modal'))
        expect(screen.getByTestId('auth-modal')).toBeInTheDocument()

        await userEvent.click(screen.getByText('Close'))
        expect(screen.queryByTestId('auth-modal')).not.toBeInTheDocument()
    })

    it('handles logout failure gracefully', async () => {
        const mockUser = { id: 1, email: 'test@example.com' }
        ;(global.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ user: mockUser }),
        })
        ;(global.fetch as any).mockRejectedValue(new Error('Logout failed'))

        const consoleSpy = vi
            .spyOn(console, 'error')
            .mockImplementation(() => {})

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        )

        await waitFor(() =>
            expect(screen.getByTestId('auth-status')).toHaveTextContent(
                'Authenticated'
            )
        )

        await userEvent.click(screen.getByText('Logout'))

        // Should verify console error called
        expect(consoleSpy).toHaveBeenCalled()
        consoleSpy.mockRestore()
    })
})
