
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getPrismaContent, getPrismaActivity } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const activityPrisma = getPrismaActivity();
        const contentPrisma = getPrismaContent();

        const session = await getSession();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '9');
        const page = parseInt(searchParams.get('page') || '1');
        const skip = (page - 1) * limit;

        // Fetch history and count from activity DB
        const [history, totalCount] = await Promise.all([
            activityPrisma.readingHistory.findMany({
                where: {
                    userId: session.user.id,
                },
                orderBy: {
                    readAt: 'desc',
                },
                take: limit,
                skip: skip,
            }),
            activityPrisma.readingHistory.count({
                where: {
                    userId: session.user.id,
                },
            })
        ]);

        const totalPages = Math.ceil(totalCount / limit);
        const hasMore = page < totalPages;

        if (history.length === 0) {
            return NextResponse.json({
                articles: [],
                pagination: { page, limit, totalCount, totalPages, hasMore }
            });
        }

        // Extract article IDs
        const articleIds = history.map(h => h.articleId);

        // Fetch article details from content DB
        const articles = await contentPrisma.articles.findMany({
            where: {
                article_id: {
                    in: articleIds,
                },
            },
            include: {
                publishers: true,
                article_tag: {
                    include: {
                        tags: true,
                    },
                },
            },
        });

        // Map articles back to history order (because findMany doesn't guarantee order based on 'in' array)
        // And also we might want to attach the 'readAt' date if needed by UI (though user didn't explicitly ask for it, it's good practice)

        // Create a map for quick lookup
        const articleMap = new Map(articles.map(a => [a.article_id.toString(), a])); // BigInt key map might be tricky, stringify

        const sortedArticles = history.map(h => {
            const article = articleMap.get(h.articleId.toString());
            if (!article) return null;
            // Start transforming BigInt to string for JSON serialization
            return {
                ...article,
                article_id: article.article_id.toString(),
                publisher_id: article.publisher_id.toString(),
                publishers: {
                    ...article.publishers,
                    publisher_id: article.publishers.publisher_id.toString()
                },
                article_tag: article.article_tag.map(at => ({
                    ...at,
                    article_id: at.article_id.toString(),
                    tag_id: at.tag_id.toString(),
                    tags: {
                        ...at.tags,
                        tag_id: at.tags.tag_id.toString()
                    }
                })),
                readAt: h.readAt,
            };
        }).filter(Boolean);


        return NextResponse.json({
            articles: sortedArticles,
            pagination: { page, limit, totalCount, totalPages, hasMore }
        });
    } catch (error) {
        console.error('Error fetching reading history:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
