import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HomepageNav from './HomepageNav';
import { defaultAuthContext } from '@/lib/test-utils';

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/components/AuthProvider', () => ({
    useAuth: () => defaultAuthContext,
}));

describe('HomepageNav', () => {
    it('renders all nav cards', () => {
        render(<HomepageNav />);
        expect(screen.getByText('Explore')).toBeInTheDocument();
        expect(screen.getByText('My Feeds')).toBeInTheDocument();
        expect(screen.getByText('Saved')).toBeInTheDocument();
        expect(screen.getByText('History')).toBeInTheDocument();
    });
});
