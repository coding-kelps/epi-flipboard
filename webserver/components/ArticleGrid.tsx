import { Article } from '@/lib/articles'
import ArticleCard from '@/components/ArticleCard'

export default function ArticleGrid({ articles }: { articles: Article[] }) {
    return (
        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
                {articles.slice(0, 2).map((article) => (
                    <ArticleCard key={article.title} article={article} />
                ))}
            </div>

            <div className="space-y-6">
                {articles.slice(2).map((article) => (
                    <ArticleCard key={article.title} article={article} />
                ))}
            </div>
        </section>
    )
}
