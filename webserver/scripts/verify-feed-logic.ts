
import { getPrismaActivity, getPrismaContent } from "@/lib/prisma";
import { updateFeedLastVisit, getFollowedFeedsWithMetadata } from "@/lib/feed-activity";
import { countNewArticles } from "@/lib/articles";

async function main() {
    console.log("Starting verification...");

    const prismaActivity = getPrismaActivity();
    const prismaContent = getPrismaContent();

    // 1. Get a test user (create if needed, or pick first)
    // We'll pick the first user or create one.
    // Note: Schema for User is in `api/auth/[...nextauth]` or similar? 
    // Wait, User table is in `identity` schema? The prompt said `activity` database has `FollowedFeed`.
    // `userId` is just an Int in `FollowedFeed`.

    // Let's just pick a random userId, say 1.
    const userId = 1;

    // 2. Get a test feed
    const feed = await prismaActivity.feed.findFirst();
    if (!feed) {
        console.log("No feeds found. Please seed data.");
        return;
    }
    console.log(`Using feed: ${feed.name} (ID: ${feed.id})`);

    // 3. Ensure user follows feed
    const follow = await prismaActivity.followedFeed.upsert({
        where: {
            userId_feedId: {
                userId,
                feedId: feed.id,
            },
        },
        update: {},
        create: {
            userId,
            feedId: feed.id,
            lastVisit: new Date(0), // visited long ago
        },
    });
    console.log("Followed feed verified.");

    // 4. Set lastVisit to yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    await prismaActivity.followedFeed.update({
        where: { id: follow.id },
        data: { lastVisit: yesterday }
    });
    console.log("Set lastVisit to yesterday.");

    // 5. Count articles since yesterday
    const countYesterday = await countNewArticles(feed.tagIds, feed.publisherIds, yesterday);
    console.log(`Articles since yesterday: ${countYesterday}`);

    // Test from beginning of time (1970)
    const countAll = await countNewArticles(feed.tagIds, feed.publisherIds, new Date(0));
    console.log(`Articles since 1970: ${countAll}`);

    // 6. Update lastVisit to now (simulate visit)
    await updateFeedLastVisit(userId, feed.id);
    console.log("Updated lastVisit to now.");

    // 7. Count articles since now
    const countNow = await countNewArticles(feed.tagIds, feed.publisherIds, new Date());
    console.log(`Articles since now: ${countNow} (Should be 0 commonly, unless very active)`);

    // 8. Test getFollowedFeedsWithMetadata
    const followedFeeds = await getFollowedFeedsWithMetadata(userId);
    const myFeed = followedFeeds.find(f => f.id === feed.id);
    if (myFeed) {
        console.log(`Metadata check - Feed: ${myFeed.name}, New Articles: ${myFeed.newArticlesCount}`);
        if (myFeed.newArticlesCount === 0 || myFeed.newArticlesCount === countNow) { // allow for small timing diff or 0
            console.log("SUCCESS: Metadata shows correct count (approx 0).");
        } else {
            console.warn(`WARNING: Metadata count ${myFeed.newArticlesCount} differs significantly from expected.`);
        }
    } else {
        console.error("ERROR: Feed not found in metadata list.");
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        // await prismaActivity.$disconnect(); // Access protected
    });
