import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import NavBar from './NavBar';
import { usePathname } from 'next/navigation';

vi.mock('next/navigation', () => ({
    usePathname: vi.fn(),
}));

describe('NavBar', () => {
    it('renders list of items', () => {
        vi.mocked(usePathname).mockReturnValue('/');
        const items = ['Tech', 'Science', 'Health'];
        render(<NavBar items={items} />);

        items.forEach(item => {
            expect(screen.getByText(item)).toBeInTheDocument();
            expect(screen.getByText(item).closest('a')).toHaveAttribute('href', `/search?q=${item}`);
        });
    });

    it('returns null on /profile route', () => {
        vi.mocked(usePathname).mockReturnValue('/profile');
        const { container } = render(<NavBar items={['Tech']} />);
        expect(container).toBeEmptyDOMElement();
    });
});
