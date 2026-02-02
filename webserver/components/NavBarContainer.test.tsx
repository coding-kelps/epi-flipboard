import { describe, it, expect, vi, beforeEach } from 'vitest';
import NavBarContainer from './NavBarContainer';
import { getPrismaContent } from '@/lib/prisma';

// Mock dependencies
const mockFindMany = vi.fn();
const mockGroupBy = vi.fn();

vi.mock('@/lib/prisma', () => ({
    getPrismaContent: vi.fn(),
}));

// Mock the child component to verify props
vi.mock('./NavBar', () => ({
    default: ({ items }: { items: string[] }) => <div data-testid="navbar" data-items={JSON.stringify(items)} />
}));

describe('NavBarContainer', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (getPrismaContent as any).mockReturnValue({
            article_tag: {
                groupBy: mockGroupBy,
            },
            tags: {
                findMany: mockFindMany,
            },
        });
    });

    it('fetches tags and renders NavBar', async () => {
        // Mock data
        const mockTopTags = [{ tag_id: 1n, _count: { article_id: 5 } }, { tag_id: 2n, _count: { article_id: 3 } }];
        const mockTags = [{ tag_id: 1n, name: 'Tech' }, { tag_id: 2n, name: 'Science' }];

        mockGroupBy.mockResolvedValue(mockTopTags);
        mockFindMany.mockResolvedValue(mockTags);

        const result = await NavBarContainer();

        // Since it's a server component being validated as a function, we inspect the returned React element
        expect(result).not.toBeNull();
        expect(result?.props.items).toEqual(['Tech', 'Science']);
    });

    it('returns null on error', async () => {
        mockGroupBy.mockRejectedValue(new Error('DB Error'));
        const result = await NavBarContainer();
        expect(result).toBeNull();
    });
});
