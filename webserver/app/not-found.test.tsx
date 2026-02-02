import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import NotFound from './not-found';

describe('NotFound Page', () => {
    it('renders 404 message and home link', () => {
        render(<NotFound />);
        expect(screen.getByRole('heading', { name: /Page Not Found/i })).toBeInTheDocument();
        expect(screen.getByText(/we seem to have lost this page/i)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Return Home/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Return Home/i })).toHaveAttribute('href', '/');
    });
});
