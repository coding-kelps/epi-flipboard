import { searchFeeds } from '@/app/actions'
import ExploreSearch from '@/components/ExploreSearch'
import Link from 'next/link'

interface ExplorePageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export const dynamic = 'force-dynamic'

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
    const { q } = await searchParams
    const query = typeof q === 'string' ? q : ''

    const feeds = await searchFeeds(query, 9)

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col items-center mb-12">
                <h1 className="text-4xl md:text-5xl font-serif font-black text-center mb-8">
                    Explore Feeds
                </h1>
                <ExploreSearch />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {feeds.map((feed) => (
                    <Link
                        key={feed.id}
                        href={`/feeds/${feed.id}`}
                        className="group block relative"
                    >
                        <article className="h-full p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow flex flex-col">
                            <div className="flex justify-between items-start">
                                <h2 className="text-xl font-bold font-serif text-gray-900 mb-2 group-hover:text-gray-700">
                                    {feed.name}
                                </h2>
                            </div>
                            <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-grow">
                                {feed.description}
                            </p>
                            <div className="text-xs text-gray-400 mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                                <span>{feed.tagIds.length} tags</span>
                                <span>
                                    {new Date(
                                        feed.createdAt
                                    ).toLocaleDateString()}
                                </span>
                            </div>
                        </article>
                    </Link>
                ))}
            </div>

            {feeds.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500">No feeds found.</p>
                </div>
            )}
        </div>
    )
}
