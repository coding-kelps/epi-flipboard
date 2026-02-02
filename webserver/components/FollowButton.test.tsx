import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FollowButton from './FollowButton';
import { defaultAuthContext, authenticatedContext } from '@/lib/test-utils';
import userEvent from '@testing-library/user-event';
import { toggleFollowFeed } from '@/app/actions';

// Mock dependencies
const mockUseAuth = vi.fn();
const mockToggleFollowFeed = vi.fn();

vi.mock('@/components/AuthProvider', () => ({
    useAuth: () => mockUseAuth(),
}));

vi.mock('@/app/actions', () => ({
    toggleFollowFeed: (id: number) => mockToggleFollowFeed(id),
}));

describe('FollowButton', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseAuth.mockReturnValue(defaultAuthContext);
    });

    it('renders initial state correctly', () => {
        render(<FollowButton feedId={1} initialIsFollowing={false} />);
        expect(screen.getByText('Follow')).toBeInTheDocument();

        render(<FollowButton feedId={2} initialIsFollowing={true} />);
        expect(screen.getByText('Following')).toBeInTheDocument();
    });

    it('prompts auth if not authenticated', async () => {
        const user = userEvent.setup();
        render(<FollowButton feedId={1} initialIsFollowing={false} />);

        await user.click(screen.getByText('Follow'));
        expect(defaultAuthContext.openAuthModal).toHaveBeenCalled();
        expect(mockToggleFollowFeed).not.toHaveBeenCalled();
    });

    it('toggles follow state and calls action when authenticated', async () => {
        const user = userEvent.setup();
        mockUseAuth.mockReturnValue(authenticatedContext);

        render(<FollowButton feedId={1} initialIsFollowing={false} />);

        await user.click(screen.getByText('Follow'));

        // Optimistic update
        expect(screen.getByText('Following')).toBeInTheDocument();

        await waitFor(() => {
            expect(mockToggleFollowFeed).toHaveBeenCalledWith(1);
        });
    });

    it('reverts optimistic update on error', async () => {
        const user = userEvent.setup();
        mockUseAuth.mockReturnValue(authenticatedContext);
        mockToggleFollowFeed.mockImplementation(() => new Promise((_, reject) => setTimeout(() => reject(new Error('Failed')), 100)));

        render(<FollowButton feedId={1} initialIsFollowing={false} />);

        await user.click(screen.getByText('Follow'));
        expect(screen.getByText('Following')).toBeInTheDocument(); // Optimistic

        await waitFor(() => {
            expect(screen.getByText('Follow')).toBeInTheDocument(); // Reverted
        });
    });
});
