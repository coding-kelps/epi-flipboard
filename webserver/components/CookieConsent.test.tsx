import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import CookieConsent from './CookieConsent';
import userEvent from '@testing-library/user-event';

const mockGetItem = vi.fn();
const mockSetItem = vi.fn();
const mockClear = vi.fn();

Object.defineProperty(window, 'localStorage', {
    value: {
        getItem: mockGetItem,
        setItem: mockSetItem,
        clear: mockClear,
    },
    writable: true
});

describe('CookieConsent', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetItem.mockReturnValue(null);
    });

    it('shows banner if no consent stored', () => {
        render(<CookieConsent />);
        expect(screen.getByRole('heading', { name: /We Use Cookies/i })).toBeInTheDocument();
    });

    it('does not show banner if consent stored', () => {
        mockGetItem.mockReturnValue('accepted');
        render(<CookieConsent />);
        expect(screen.queryByText(/We Use Cookies/i)).not.toBeInTheDocument();
    });

    it('hides banner and stores consent on accept', async () => {
        const user = userEvent.setup();
        render(<CookieConsent />);

        await user.click(screen.getByText('Accept'));
        expect(screen.queryByText(/We Use Cookies/i)).not.toBeInTheDocument();
        expect(mockSetItem).toHaveBeenCalledWith('cookieConsent', 'accepted');
    });

    it('hides banner and stores consent on decline', async () => {
        const user = userEvent.setup();
        render(<CookieConsent />);

        await user.click(screen.getByText('Decline'));
        expect(screen.queryByText(/We Use Cookies/i)).not.toBeInTheDocument();
        expect(mockSetItem).toHaveBeenCalledWith('cookieConsent', 'declined');
    });
});
