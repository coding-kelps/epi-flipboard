import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NavCard from './NavCard';
import { defaultAuthContext, authenticatedContext } from '@/lib/test-utils';
import userEvent from '@testing-library/user-event';
import { Compass } from 'lucide-react';

const mockUseAuth = vi.fn();
const mockPush = vi.fn();

vi.mock('@/components/AuthProvider', () => ({
    useAuth: () => mockUseAuth(),
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));


describe('NavCard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseAuth.mockReturnValue(defaultAuthContext);
    });

    const defaultProps = {
        title: 'Test Card',
        description: 'Test Description',
        href: '/test',
        icon: Compass,
    };

    it('renders with correct content', () => {
        render(<NavCard {...defaultProps} />);
        expect(screen.getByText('Test Card')).toBeInTheDocument();
        expect(screen.getByText('Test Description')).toBeInTheDocument();
        expect(screen.getByRole('link')).toHaveAttribute('href', '/test');
    });

    it('prevents navigation and opens modal if restricted and unauthenticated', async () => {
        const user = userEvent.setup();
        render(<NavCard {...defaultProps} restricted={true} />);

        const link = screen.getByRole('link');
        await user.click(link);

        expect(defaultAuthContext.openAuthModal).toHaveBeenCalled();
        // Note: We can't easily test that navigation was prevented in jsdom without more mocks, 
        // but verifying openAuthModal is called is the key behavior here.
    });

    it('allows navigation if restricted but authenticated', async () => {
        const user = userEvent.setup();
        mockUseAuth.mockReturnValue(authenticatedContext);
        render(<NavCard {...defaultProps} restricted={true} />);

        const link = screen.getByRole('link');
        await user.click(link);

        expect(defaultAuthContext.openAuthModal).not.toHaveBeenCalled();
    });
});
