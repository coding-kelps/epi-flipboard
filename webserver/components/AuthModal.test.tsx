import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AuthModal from './AuthModal';
import userEvent from '@testing-library/user-event';
import { defaultAuthContext } from '@/lib/test-utils';

const mockUseAuth = vi.fn();
const mockLogin = vi.fn();
const mockFetch = vi.fn();

vi.mock('@/components/AuthProvider', () => ({
    useAuth: () => mockUseAuth(),
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({ refresh: vi.fn() }),
}));

global.fetch = mockFetch;

describe('AuthModal', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseAuth.mockReturnValue({ ...defaultAuthContext, login: mockLogin });
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({}),
        });
    });

    const defaultProps = {
        isOpen: true,
        onClose: vi.fn(),
    };

    it('renders nothing when not open', () => {
        render(<AuthModal {...defaultProps} isOpen={false} />);
        expect(screen.queryByText(/Welcome Back/i)).not.toBeInTheDocument();
    });

    it('renders login form by default', () => {
        render(<AuthModal {...defaultProps} />);
        expect(screen.getByText('Welcome Back')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
        expect(screen.queryByText('Full Name')).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
    });

    it('switches to register form', async () => {
        const user = userEvent.setup();
        render(<AuthModal {...defaultProps} />);

        await user.click(screen.getByText('Sign up'));
        expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument();
        expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();
    });

    it('submits login form successfully', async () => {
        const user = userEvent.setup();
        render(<AuthModal {...defaultProps} />);

        await user.type(screen.getByPlaceholderText('you@example.com'), 'test@test.com');
        await user.type(screen.getByPlaceholderText('••••••••'), 'password');
        await user.click(screen.getByRole('button', { name: 'Sign In' }));

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith('/api/account/login', expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ email: 'test@test.com', password: 'password' }),
            }));
            expect(mockLogin).toHaveBeenCalled();
            expect(defaultProps.onClose).toHaveBeenCalled();
        });
    });

    it('displays error message on failure', async () => {
        const user = userEvent.setup();
        mockFetch.mockResolvedValue({
            ok: false,
            json: async () => ({ error: 'Invalid credentials' }),
        });

        render(<AuthModal {...defaultProps} />);

        await user.type(screen.getByPlaceholderText('you@example.com'), 'test@test.com');
        await user.type(screen.getByPlaceholderText('••••••••'), 'wrong');
        await user.click(screen.getByRole('button', { name: 'Sign In' }));

        expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
        expect(mockLogin).not.toHaveBeenCalled();
    });
});
