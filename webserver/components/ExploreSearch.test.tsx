import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ExploreSearch from './ExploreSearch';
import userEvent from '@testing-library/user-event';

const mockReplace = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
    useRouter: () => ({ replace: mockReplace }),
    useSearchParams: () => mockSearchParams,
}));

vi.mock('use-debounce', () => ({
    useDebouncedCallback: (callback: any) => callback,
}));

describe('ExploreSearch', () => {
    it('updates URL on search input', async () => {
        const user = userEvent.setup();
        render(<ExploreSearch />);

        const input = screen.getByPlaceholderText('Search for feeds...');
        await user.type(input, 'Tech');

        expect(mockReplace).toHaveBeenLastCalledWith('/explore?q=Tech');
    });

    it('removes query param when empty', async () => {
        const user = userEvent.setup();
        render(<ExploreSearch />);

        const input = screen.getByPlaceholderText('Search for feeds...');
        await user.type(input, 'Tech');
        await user.clear(input);

        expect(mockReplace).toHaveBeenLastCalledWith('/explore?');
    });
});
