import { searchArticles } from '@/lib/articles'
import ArticleCard from '@/components/ArticleCard'
import { checkImageResolution } from '@/lib/image-utils'
import { Article } from '@/lib/articles'

export const dynamic = 'force-dynamic'

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ q: string }>
}) {
    const { q: query } = await searchParams

    if (!query) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <h1 className="text-2xl font-serif">
                    Please enter a search term.
                </h1>
            </div>
        )
    }

    const articles = await searchArticles(query)

    if (!articles || articles.length === 0) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <h1 className="text-2xl font-serif">
                    No articles found for &quot;{query}&quot;.
                </h1>
                <p className="text-gray-500 mt-2">
                    Try searching for something else.
                </p>
            </div>
        )
    }

    // Logic: Find the first article with minimal resolution for Lead Story (same as Home)
    let leadStory: Article | undefined

    // Check top 10 articles for a high-res image
    for (let i = 0; i < Math.min(articles.length, 10); i++) {
        const article = articles[i]
        if (article.image_url) {
            const isHighRes = await checkImageResolution(article.image_url, 800)
            if (isHighRes) {
                leadStory = article
                break
            }
        }
    }

    // Fallback if no high-res image found
    if (!leadStory) {
        if (articles.findIndex((a) => a.image_url) !== -1) {
            leadStory = articles[articles.findIndex((a) => a.image_url)]
        } else {
            leadStory = articles[0]
        }
    }

    // Filter out the lead story from the rest of the list
    const otherArticles = articles.filter(
        (a) => a.article_id !== leadStory!.article_id
    )
    const articlesWithImages = otherArticles.filter((a) => a.image_url)

    const topStories = articlesWithImages.slice(0, 4)
    const remaining = otherArticles.slice(4, 21)

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-6 border-b border-black pb-2">
                Search Results for &quot;{query}&quot;
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
                {/* Main Content Area (Span 8) */}
                <section className="lg:col-span-8 lg:pr-6 flex flex-col gap-8">
                    {/* Main Lead */}
                    <ArticleCard
                        article={leadStory!}
                        variant="lead"
                        className="border-b border-gray-200 pb-6"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {topStories.map((article) => (
                            <ArticleCard
                                key={String(article.article_id)}
                                article={article}
                                variant="standard"
                            />
                        ))}
                    </div>
                </section>

                {/* Sidebar Area (Span 4) */}
                <section className="lg:col-span-4 lg:pl-6 flex flex-col gap-6">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-gray-900 mb-2 border-t border-black pt-1">
                        More Results
                    </h4>
                    <div className="flex flex-col gap-4">
                        {remaining.map((article) => (
                            <ArticleCard
                                key={String(article.article_id)}
                                article={article}
                                variant="compact"
                            />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    )
}
