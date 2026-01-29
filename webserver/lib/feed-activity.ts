
import { getPrismaActivity, getPrismaContent } from "@/lib/prisma";
import { getArticlesByTags } from "@/lib/articles";
// import { Feed } from "@/lib/articles";
// Actually Feed is from PrismaClient for Activity.
// Let's check imports in other files.
// In app/feeds/[feedId]/page.tsx: import { getPrismaActivity } from "@/lib/prisma";

export async function updateFeedLastVisit(userId: number, feedId: number) {
    const prismaActivity = getPrismaActivity();
    try {
        await prismaActivity.followedFeed.updateMany({
            where: {
                userId,
                feedId,
            },
            data: {
                lastVisit: new Date(),
            },
        });
    } catch (error) {
        console.error("Failed to update feed last visit:", error);
        // Silent fail is acceptable here as it's just stats
    }
}

export interface FollowedFeedWithMetadata {
    id: number;
    name: string;
    description: string | null;
    newArticlesCount: number;
}

export async function getFollowedFeedsWithMetadata(userId: number): Promise<FollowedFeedWithMetadata[]> {
    const prismaActivity = getPrismaActivity();

    // 1. Get followed feeds
    const followedFeeds = await prismaActivity.followedFeed.findMany({
        where: {
            userId,
        },
        select: {
            feedId: true,
            lastVisit: true,
        },
    });

    if (followedFeeds.length === 0) {
        return [];
    }

    // 2. Get feed details (tags/publishers)
    const feedIds = followedFeeds.map(f => f.feedId);
    const feeds = await prismaActivity.feed.findMany({
        where: {
            id: {
                in: feedIds,
            },
        },
    });

    // Map feeds by ID for easy access
    const feedsById = new Map(feeds.map(f => [f.id, f]));

    // 3. Calculate new articles for each feed
    // We need to fetch articles published AFTER lastVisit for the tags/publishers of each feed.
    // This could be heavy if done individually. 
    // Optimization: Fetch counts in parallel or batch?
    // Current implementation in lib/articles.ts: getArticlesByTags takes tags/publishers.

    // Let's import the counting logic. We need a new function in lib/articles.ts to count.
    // For now we will assume we add `countNewArticles` to lib/articles.ts

    // We'll process in parallel
    const results = await Promise.all(
        followedFeeds.map(async (followed) => {
            const feed = feedsById.get(followed.feedId);
            if (!feed) return null;

            const newArticlesCount = await countNewArticles(
                feed.tagIds,
                feed.publisherIds,
                followed.lastVisit
            );

            return {
                id: feed.id,
                name: feed.name,
                description: feed.description,
                newArticlesCount,
            };
        })
    );

    return results.filter((f): f is FollowedFeedWithMetadata => f !== null);
}

// Placeholder for countNewArticles if I haven't implemented it yet. 
// But I should implement it in lib/articles.ts as per plan.
// I will need to import it.
import { countNewArticles } from "@/lib/articles";
