import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ExplorePage from './explore/page'
import SearchPage from './search/page'
import SavedPage from './saved/page'
import HistoryPage from './history/page'
import ProfilePage from './profile/page'
import userEvent from '@testing-library/user-event'

// Mock Actions and Libs
const mockSearchFeeds = vi.fn()
const mockSearchArticles = vi.fn()
const mockCheckImageResolution = vi.fn()
const mockUseAuth = vi.fn()

// Create a STABLE router object to prevent useEffect loops
const mockRouter = { push: vi.fn(), refresh: vi.fn() }
const mockRefreshUser = vi.fn()

vi.mock('@/app/actions', () => ({
    searchFeeds: (q: string, limit: number) => mockSearchFeeds(q, limit),
}))

vi.mock('@/lib/articles', () => ({
    searchArticles: (q: string) => mockSearchArticles(q),
}))

vi.mock('@/lib/image-utils', () => ({
    checkImageResolution: (url: string) => mockCheckImageResolution(url),
}))

vi.mock('@/components/AuthProvider', () => ({
    useAuth: () => mockUseAuth(),
}))

vi.mock('next/navigation', () => ({
    useRouter: () => mockRouter,
}))

// Mock Components
vi.mock('@/components/ExploreSearch', () => ({
    default: () => <div data-testid="explore-search" />,
}))
vi.mock('@/components/ArticleCard', () => ({
    default: ({ article }: any) => (
        <div data-testid="article-card">{article.title}</div>
    ),
}))
vi.mock('@/components/AuthGuard', () => ({
    default: ({ children }: any) => (
        <div data-testid="auth-guard">{children}</div>
    ),
}))

// Mock fetch for client-side pages
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('Dynamic Pages', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockCheckImageResolution.mockResolvedValue(true)
    })

    describe('Explore Page', () => {
        it('renders feeds from search', async () => {
            const feeds = [
                {
                    id: 1,
                    name: 'Tech Feed',
                    description: 'Desc',
                    tagIds: [],
                    createdAt: new Date(),
                },
            ]
            mockSearchFeeds.mockResolvedValue(feeds)

            const jsx = await ExplorePage({
                searchParams: Promise.resolve({ q: 'tech' }),
            })
            render(jsx)

            expect(screen.getByText('Explore Feeds')).toBeInTheDocument()
            expect(screen.getByText('Tech Feed')).toBeInTheDocument()
        })

        it('renders empty state', async () => {
            mockSearchFeeds.mockResolvedValue([])
            const jsx = await ExplorePage({
                searchParams: Promise.resolve({ q: 'unknown' }),
            })
            render(jsx)
            expect(screen.getByText('No feeds found.')).toBeInTheDocument()
        })
    })

    describe('Search Page', () => {
        it('renders search results', async () => {
            const articles = [
                {
                    article_id: 1n,
                    title: 'Result 1',
                    image_url: 'http://img.com/1.jpg',
                },
            ]
            mockSearchArticles.mockResolvedValue(articles)

            const jsx = await SearchPage({
                searchParams: Promise.resolve({ q: 'news' }),
            })
            render(jsx)

            expect(
                screen.getByText('Search Results for "news"')
            ).toBeInTheDocument()
            expect(screen.getByText('Result 1')).toBeInTheDocument()
        })

        it('prompts to enter search term if empty', async () => {
            const jsx = await SearchPage({
                searchParams: Promise.resolve({ q: '' }),
            })
            render(jsx)
            expect(
                screen.getByText('Please enter a search term.')
            ).toBeInTheDocument()
        })
    })

    describe('Saved Page (Client Component)', () => {
        it('fetches and renders saved articles', async () => {
            mockUseAuth.mockReturnValue({
                user: { id: 1 },
                isAuthenticated: true,
                loading: false,
            })
            mockFetch.mockResolvedValue({
                ok: true,
                json: async () => ({
                    markedArticles: [{ article_id: 1, title: 'Saved 1' }],
                }),
            })

            // Use findByText to wait for loader to be replaced by content
            render(<SavedPage />)

            expect(await screen.findByText('Read Later')).toBeInTheDocument()
            await waitFor(() => {
                expect(screen.getByText('Saved 1')).toBeInTheDocument()
            })
        })
    })

    describe('History Page (Client Component)', () => {
        it('fetches and renders history', async () => {
            mockUseAuth.mockReturnValue({
                user: { id: 1 },
                isAuthenticated: true,
                loading: false,
            })
            mockFetch.mockResolvedValue({
                ok: true,
                json: async () => ({
                    articles: [{ article_id: 1, title: 'Read 1' }],
                }),
            })

            render(<HistoryPage />)

            expect(screen.getByText('Reading History')).toBeInTheDocument()
            await waitFor(() => {
                expect(screen.getByText('Read 1')).toBeInTheDocument()
            })
        })

        it('prompts login if unauthenticated', () => {
            mockUseAuth.mockReturnValue({
                isAuthenticated: false,
                loading: false,
            })
            render(<HistoryPage />)
            expect(
                screen.getByText('Sign in to view your history')
            ).toBeInTheDocument()
        })
    })

    describe('Profile Page (Client Component)', () => {
        it('renders user profile and allows updates', async () => {
            const user = { id: 1, name: 'John Doe', email: 'john@example.com' }
            mockUseAuth.mockReturnValue({
                user,
                isAuthenticated: true,
                loading: false,
                refreshUser: mockRefreshUser,
            })
            mockFetch.mockResolvedValue({ ok: true })

            render(<ProfilePage />)

            expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()

            const nameInput = screen.getByDisplayValue('John Doe')

            // Use userEvent for realistic interaction
            const userActor = userEvent.setup()
            await userActor.clear(nameInput)
            await userActor.type(nameInput, 'Jane Doe')

            expect(nameInput).toHaveValue('Jane Doe')

            const saveBtn = screen.getByRole('button', { name: 'Save Changes' })
            await userActor.click(saveBtn)

            await waitFor(
                () => {
                    expect(mockFetch).toHaveBeenCalledWith(
                        '/api/account/profile',
                        expect.objectContaining({
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ name: 'Jane Doe' }),
                        })
                    )
                },
                { timeout: 2000 }
            )
        })
    })
})
