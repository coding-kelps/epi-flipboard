'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { Article } from '@/lib/articles'
import { Clock } from 'lucide-react'
import ArticleCard from '@/components/ArticleCard'

interface HistoryArticle extends Article {
    readAt: string
}

export default function HistoryPage() {
    const { isAuthenticated, loading: authLoading } = useAuth() // 'user' removed as it's unused
    const [articles, setArticles] = useState<HistoryArticle[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [isLoadingMore, setIsLoadingMore] = useState(false)

    // Initial fetch
    useEffect(() => {
        if (authLoading) return
        if (!isAuthenticated) {
            setIsLoading(false)
            return
        }

        // Reset state on auth change
        setArticles([])
        setPage(1)
        setIsLoading(true)

        fetchHistory(1)
    }, [isAuthenticated, authLoading])

    const fetchHistory = async (pageNum: number) => {
        try {
            const res = await fetch(`/api/history?limit=9&page=${pageNum}`)
            if (res.ok) {
                const data = await res.json()
                const newArticles: HistoryArticle[] = data.articles || []

                setArticles((prev) =>
                    pageNum === 1 ? newArticles : [...prev, ...newArticles]
                )
                setHasMore(data.pagination?.hasMore ?? false)
            }
        } catch (error) {
            console.error('Failed to fetch history', error)
        } finally {
            setIsLoading(false)
            setIsLoadingMore(false)
        }
    }

    const loadMore = () => {
        if (!hasMore || isLoadingMore) return
        setIsLoadingMore(true)
        const nextPage = page + 1
        setPage(nextPage)
        fetchHistory(nextPage)
    }

    if (authLoading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return (
            <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center text-center gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <Clock className="w-8 h-8 text-gray-400" />
                </div>
                <h1 className="text-2xl font-serif font-bold text-gray-900">
                    Sign in to view your history
                </h1>
                <p className="text-gray-600 max-w-md">
                    Keep track of stories you&apos;ve read and easily find them
                    later.
                </p>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
                <Clock className="w-6 h-6 text-black" />
                <h1 className="text-3xl font-serif font-bold text-gray-900">
                    Reading History
                </h1>
            </div>

            {isLoading && articles.length === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="h-64 bg-gray-100 rounded-lg animate-pulse"
                        ></div>
                    ))}
                </div>
            ) : articles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500">
                    <p className="text-lg font-serif">
                        You haven&apos;t read any articles yet.
                    </p>
                    <p className="text-sm mt-2">
                        Stories you open will appear here.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-8 max-w-3xl mx-auto">
                    <div className="flex flex-col gap-4">
                        {articles.map((article, index) => (
                            <HistoryArticleCard
                                key={`${article.article_id}-${article.readAt}-${index}`}
                                article={article}
                            />
                        ))}
                    </div>

                    {hasMore && (
                        <div className="flex justify-center pb-8">
                            <button
                                onClick={loadMore}
                                disabled={isLoadingMore}
                                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-sm tracking-wider uppercase rounded-full transition-colors disabled:opacity-50"
                            >
                                {isLoadingMore ? 'Loading...' : 'Load More'}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

function HistoryArticleCard({ article }: { article: HistoryArticle }) {
    return <ArticleCard article={article} variant="list" />
}
