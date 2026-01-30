
import { getPrismaActivity, getPrismaContent } from "@/lib/prisma";
import { getArticlesByTags } from "@/lib/articles";
import ArticleCard from "@/components/ArticleCard";
import { checkImageResolution } from "@/lib/image-utils";
import { Article } from "@/lib/articles";
import { notFound } from "next/navigation";
import { Tag } from "lucide-react";
import FollowButton from "@/components/FollowButton";
import { getIsFollowingFeed } from "@/app/actions";
import { updateFeedLastVisit } from "@/lib/feed-activity";
import { getSession } from "@/lib/auth";

export const dynamic = 'force-dynamic';

interface FeedPageProps {
    params: Promise<{
        feedId: string;
    }>;
}

// Helper to get tags by IDs (replacing the action)
async function getTagsByIds(tagIds: bigint[]) {
    if (!tagIds.length) return [];

    const prismaContent = getPrismaContent();
    const tags = await prismaContent.tags.findMany({
        where: {
            tag_id: {
                in: tagIds
            }
        }
    });

    return tags.map(tag => ({
        tag_id: tag.tag_id.toString(),
        name: tag.name
    }));
}

async function getFeed(feedId: number) {
    const prismaActivity = getPrismaActivity();
    const feed = await prismaActivity.feed.findUnique({
        where: {
            id: feedId,
        },
    });
    return feed;
}


// Helper to get publishers by IDs
async function getPublishersByIds(publisherIds: bigint[]) {
    if (!publisherIds || !publisherIds.length) return [];

    const prismaContent = getPrismaContent();
    const publishers = await prismaContent.publishers.findMany({
        where: {
            publisher_id: {
                in: publisherIds
            }
        }
    });

    return publishers.map(p => ({
        publisher_id: p.publisher_id.toString(),
        name: p.display_name || p.name
    }));
}

export default async function FeedPage({ params }: FeedPageProps) {
    const { feedId } = await params;
    const id = parseInt(feedId, 10);

    if (isNaN(id)) {
        notFound();
    }

    const feed = await getFeed(id);

    if (!feed) {
        notFound();
    }

    // Fetch tags and publishers for display
    const tags = await getTagsByIds(feed.tagIds);
    const publishers = await getPublishersByIds(feed.publisherIds);
    const articles = await getArticlesByTags(feed.tagIds, feed.publisherIds);

    // Update last visit
    const session = await getSession();
    if (session && session.user) {
        await updateFeedLastVisit(Number(session.user.id), feed.id);
    }

    // --- Reuse display logic from app/page.tsx ---

    if (!articles || articles.length === 0) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="mb-8 border-b border-gray-200 pb-6">
                    <h1 className="text-3xl md:text-5xl font-serif font-black text-gray-900 mb-4">{feed.name}</h1>
                    <p className="text-xl text-gray-600 font-serif max-w-3xl">{feed.description}</p>
                    <div className="flex flex-wrap gap-2 mt-4">
                        {tags.map(tag => (
                            <span key={tag.tag_id} className="text-xs font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                #{tag.name}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No articles found for these tags yet.</p>
                </div>
            </div>
        );
    }

    // Logic: Find the first article with minimal resolution for Lead Story
    let leadStory: Article | undefined;
    let leadStoryIndex = -1;

    // Check top 10 articles for a high-res image
    for (let i = 0; i < Math.min(articles.length, 10); i++) {
        const article = articles[i];
        if (article.image_url) {
            const isHighRes = await checkImageResolution(article.image_url, 800);
            if (isHighRes) {
                leadStory = article;
                leadStoryIndex = i;
                break;
            }
        }
    }

    // Fallback if no high-res image found: just take the first one (or first with ANY image)
    if (!leadStory) {
        leadStoryIndex = articles.findIndex(a => a.image_url);
        if (leadStoryIndex === -1) leadStoryIndex = 0; // Absolute fallback
        leadStory = articles[leadStoryIndex];
    }

    // Filter out the lead story from the rest of the list
    const otherArticles = articles.filter((a) => a.article_id !== leadStory!.article_id);

    // Separate articles with and without images
    const articlesWithImages = otherArticles.filter((a) => a.image_url);

    // topStories: Get 3 articles with images (after secondary lead)
    const topStories = articlesWithImages.slice(0, 4);

    // "The Latest" section: 13 articles (can be mixed)
    const sidebarStories = otherArticles.slice(4, 17);

    // opinionStories: Get 3 articles with images (from remaining articles with images)
    const opinionStories = articlesWithImages.slice(4, 7);

    // "More News" section: min/max 4 articles with images (from remaining articles)
    const usedIds = new Set([
        leadStory!.article_id,
        ...topStories.map(a => a.article_id),
        ...sidebarStories.map(a => a.article_id),
        ...opinionStories.map(a => a.article_id),
    ].filter(Boolean));

    const moreNews = articlesWithImages
        .filter(a => !usedIds.has(a.article_id))
        .slice(0, 4);

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Feed Header */}
            <div className="mb-10 border-b-4 border-black pb-6">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-4 mb-4">
                            <h1 className="text-4xl md:text-6xl font-serif font-black text-gray-900 tracking-tight">{feed.name}</h1>
                            <FollowButton feedId={feed.id} initialIsFollowing={await getIsFollowingFeed(feed.id)} />
                        </div>
                        <p className="text-xl text-gray-600 font-serif max-w-3xl leading-relaxed">{feed.description}</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-6">
                    {tags.map(tag => (
                        <span key={tag.tag_id} className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-white bg-black px-3 py-1 rounded-full">
                            <Tag className="w-3 h-3" />
                            {tag.name}
                        </span>
                    ))}
                    {publishers.map(pub => (
                        <span key={pub.publisher_id} className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-black bg-gray-200 px-3 py-1 rounded-full">
                            {pub.name}
                        </span>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">

                {/* Left Column: Quick News / Sidebar (Span 3) */}
                <section className="lg:col-span-3 lg:pr-6 order-2 lg:order-1 flex flex-col gap-4">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-gray-900 mb-2 border-t border-black pt-1">
                        In this Feed
                    </h4>
                    <div className="flex flex-col gap-4">
                        {sidebarStories.map((article) => (
                            <ArticleCard key={String(article.article_id)} article={article} variant="compact" />
                        ))}
                    </div>
                </section>

                {/* Center Column: Lead Stories (Span 6) */}
                <section className="lg:col-span-6 lg:px-6 order-1 lg:order-2 flex flex-col gap-8">

                    {/* Main Lead */}
                    <ArticleCard
                        article={leadStory!}
                        variant="lead"
                        className="border-b border-gray-200 pb-6"
                    />

                    {/* Secondary Lead & Top Stories Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {topStories.map((article) => (
                            <ArticleCard key={String(article.article_id)} article={article} variant="standard" />
                        ))}
                    </div>

                </section>


                {/* Right Column: Opinion / More (Span 3) */}
                <section className="lg:col-span-3 lg:pl-6 order-3 flex flex-col gap-6">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-gray-900 mb-2 border-t border-black pt-1">
                        Featured
                    </h4>
                    <div className="flex flex-col gap-7">
                        {opinionStories.map((article) => (
                            <ArticleCard key={String(article.article_id)} article={article} variant="standard" />
                        ))}
                    </div>
                </section>

            </div>

            {/* Bottom Section: More News (Full Width) */}
            {moreNews.length > 0 && (
                <section className="mt-12 pt-8 border-t border-black">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-gray-900 mb-6">More from {feed.name}</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                        {moreNews.map((article) => (
                            <ArticleCard key={String(article.article_id)} article={article} variant="standard" />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
