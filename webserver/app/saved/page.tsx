
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import ArticleCard from "@/components/ArticleCard";
import AuthGuard from "@/components/AuthGuard";
import { Article } from "@/lib/articles";
import { Loader2 } from "lucide-react";

export default function MarkedArticlesPage() {
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    useEffect(() => {
        if (authLoading) return;

        if (!isAuthenticated || !user) {
            setLoading(false);
            return;
        }

        // Reset state on auth change
        setArticles([]);
        setPage(1);
        setLoading(true);

        fetchMarkedArticles(1);
    }, [user, isAuthenticated, authLoading]);

    const fetchMarkedArticles = async (pageNum: number) => {
        if (!user) return;
        try {
            const res = await fetch(`/api/articles/marked?userId=${user.id}&limit=9&page=${pageNum}`);
            if (!res.ok) throw new Error("Failed to fetch marked articles");
            const data = await res.json();

            // API now returns full article objects in `markedArticles`
            const newArticles = data.markedArticles || [];

            setArticles(prev => pageNum === 1 ? newArticles : [...prev, ...newArticles]);
            setHasMore(data.pagination?.hasMore ?? false);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setIsLoadingMore(false);
        }
    };

    const loadMore = () => {
        if (!hasMore || isLoadingMore) return;
        setIsLoadingMore(true);
        const nextPage = page + 1;
        setPage(nextPage);
        fetchMarkedArticles(nextPage);
    };

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <AuthGuard>
            <div className="container max-w-2xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-serif font-bold mb-8">Read Later</h1>

                {articles.length === 0 ? (
                    <div className="p-8 bg-gray-50 rounded-lg text-center border border-gray-100">
                        <p className="text-gray-600">You haven't saved any articles yet.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-8">
                        <div className="flex flex-col">
                            {articles.map((article, index) => (
                                <ArticleCard
                                    key={`${article.article_id}-${index}`}
                                    article={article}
                                    variant="list"
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
                                    {isLoadingMore ? "Loading..." : "Load More"}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AuthGuard>
    );
}
