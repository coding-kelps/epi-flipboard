
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

    useEffect(() => {
        if (authLoading) return;

        if (!isAuthenticated || !user) {
            setLoading(false);
            return;
        }

        const fetchMarkedArticles = async () => {
            try {
                const res = await fetch(`/api/articles/marked?userId=${user.id}`);
                if (!res.ok) throw new Error("Failed to fetch marked articles");
                const data = await res.json();

                // API now returns full article objects in `markedArticles`
                setArticles(data.markedArticles || []);

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchMarkedArticles();
    }, [user, isAuthenticated, authLoading]);

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
                    <div className="flex flex-col">
                        {articles.map((article) => (
                            <ArticleCard
                                key={article.article_id}
                                article={article}
                                variant="compact"
                            />
                        ))}
                    </div>
                )}
            </div>
        </AuthGuard>
    );
}
