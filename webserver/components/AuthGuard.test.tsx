import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AuthGuard from './AuthGuard';
import { defaultAuthContext, authenticatedContext } from '@/lib/test-utils';

const mockUseAuth = vi.fn();
const mockOpenAuthModal = vi.fn();

vi.mock('@/components/AuthProvider', () => ({
    useAuth: () => mockUseAuth(),
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: vi.fn() }),
}));

describe('AuthGuard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Default to not loading, not authenticated
        mockUseAuth.mockReturnValue({
            ...defaultAuthContext,
            loading: false,
            isAuthenticated: false,
            openAuthModal: mockOpenAuthModal,
        });
    });

    it('renders loading state', () => {
        mockUseAuth.mockReturnValue({ ...defaultAuthContext, loading: true });
        render(<AuthGuard>Content</AuthGuard>);
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('opens auth modal and renders children (restricted) when unauthenticated', () => {
        render(<AuthGuard>Protected Content</AuthGuard>);
        expect(mockOpenAuthModal).toHaveBeenCalled();
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('renders children without modal when authenticated', () => {
        mockUseAuth.mockReturnValue({
            ...authenticatedContext,
            loading: false,
            openAuthModal: mockOpenAuthModal,
        });
        render(<AuthGuard>Protected Content</AuthGuard>);
        expect(mockOpenAuthModal).not.toHaveBeenCalled();
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
});
