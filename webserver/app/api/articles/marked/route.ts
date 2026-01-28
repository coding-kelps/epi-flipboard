
import { NextRequest, NextResponse } from 'next/server';
import { getPrismaActivity } from '@/lib/prisma';


export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const prismaActivity = getPrismaActivity();

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        const userIdInt = parseInt(userId);

        const markedArticledRecords = await prismaActivity.markedArticle.findMany({
            where: {
                userId: userIdInt,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        const markedIds = markedArticledRecords.map((r: any) => r.articleId);

        if (markedIds.length === 0) {
            return NextResponse.json({ markedArticles: [] });
        }

        const { getArticlesByIds } = await import('@/lib/articles');
        const articles = await getArticlesByIds(markedIds);

        // Re-order based on marked date
        const markedMap = new Map();
        for (const r of markedArticledRecords) {
            markedMap.set(r.articleId.toString(), r);
        }

        const result = articles.map(article => {
            const marked = markedMap.get(article.article_id.toString());
            return {
                ...article,
                // Add marked-specific fields if needed
                markedAt: marked ? marked.createdAt : null,
                // Ensure BigInts are strings
                article_id: article.article_id.toString(),
                publisher_id: article.publisher_id.toString(),
                publishers: {
                    ...article.publishers,
                    publisher_id: article.publishers?.publisher_id.toString(),
                },
                article_tag: article.article_tag.map(at => ({
                    ...at,
                    article_id: at.article_id.toString(),
                    tag_id: at.tag_id.toString(),
                    tags: {
                        ...at.tags,
                        tag_id: at.tags.tag_id.toString()
                    }

                }))
            };
        });

        // Sort by markedAt descending
        result.sort((a, b) => {
            const timeA = a.markedAt ? new Date(a.markedAt).getTime() : 0;
            const timeB = b.markedAt ? new Date(b.markedAt).getTime() : 0;
            return timeB - timeA;
        });

        return NextResponse.json({ markedArticles: result });
    } catch (error) {
        console.error('Error fetching marked articles:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
