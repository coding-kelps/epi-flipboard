
import { getPrismaContent } from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma-content/client";
import { trace } from '@opentelemetry/api';

export type Article = Prisma.articlesGetPayload<{
  include: { publishers: true; article_tag: { include: { tags: true } } };
}> & {
  _count?: { comments: number };
  isSaved?: boolean;
};

import { getPrismaActivity } from "@/lib/prisma";

export async function getArticles(userId?: number): Promise<Article[]> {
  const prismaContent = getPrismaContent();
  try {
    const articles = await prismaContent.articles.findMany({
      include: {
        publishers: true,
        article_tag: {
          include: {
            tags: true,
          },
        },
      },
      orderBy: {
        published_at: "desc",
      },
      take: 50,
    });

    return await enrichArticles(articles, userId);
  } catch (error) {
    console.error("Failed to fetch articles:", error);
    return [];
  }
}

async function enrichArticles(articles: Article[], userId?: number): Promise<Article[]> {
  const prismaActivity = getPrismaActivity();
  const articleIds = articles.map(a => a.article_id);

  if (articleIds.length === 0) return articles;

  try {
    const [commentCounts, savedArticles] = await Promise.all([
      prismaActivity.comment.groupBy({
        by: ['articleId'],
        where: { articleId: { in: articleIds } },
        _count: { id: true }
      }),
      userId ? prismaActivity.markedArticle.findMany({
        where: { userId: userId, articleId: { in: articleIds } },
        select: { articleId: true }
      }) : Promise.resolve([])
    ]);

    const commentCountMap = new Map(commentCounts.map(c => [c.articleId.toString(), c._count.id]));
    const savedArticleIds = new Set(savedArticles.map(m => m.articleId.toString()));

    return articles.map(article => ({
      ...article,
      _count: {
        comments: commentCountMap.get(article.article_id.toString()) || 0
      },
      isSaved: savedArticleIds.has(article.article_id.toString())
    }));
  } catch (error) {
    console.error("Failed to enrich articles:", error);
    return articles; // Return original articles if enrichment fails
  }
}

export async function searchArticles(query: string, userId?: number): Promise<Article[]> {
  const prismaContent = getPrismaContent();
  const tracer = trace.getTracer('epi-flipboard-webserver');

  return tracer.startActiveSpan('searchArticles', async (span) => {
    try {
      span.setAttribute('search.query', query);
      const articles = await prismaContent.articles.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            {
              article_tag: {
                some: {
                  tags: {
                    name: { contains: query, mode: 'insensitive' },
                  },
                },
              },
            },
          ],
        },
        include: {
          publishers: true,
          article_tag: {
            include: {
              tags: true,
            },
          },
        },
        orderBy: {
          published_at: "desc",
        },
        take: 50,
      });
      span.setAttribute('search.results_count', articles.length);
      return await enrichArticles(articles, userId);
    } catch (error) {
      if (error instanceof Error) {
        span.recordException(error);
      } else {
        span.recordException(new Error(String(error)));
      }
      console.error("Failed to search articles:", error);
      return [];
    } finally {
      span.end();
    }
  });
}

export async function getArticlesByTags(tagIds: bigint[], publisherIds: bigint[] = [], userId?: number): Promise<Article[]> {
  const prismaContent = getPrismaContent();
  try {
    const articles = await prismaContent.articles.findMany({
      where: {
        AND: [
          tagIds.length > 0 ? {
            article_tag: {
              some: {
                tag_id: {
                  in: tagIds,
                },
              },
            },
          } : {},
          publisherIds.length > 0 ? {
            publisher_id: {
              in: publisherIds
            }
          } : {}
        ]
      },
      include: {
        publishers: true,
        article_tag: {
          include: {
            tags: true
          }
        },
      },
      orderBy: {
        published_at: "desc",
      },
      take: 50,
    });
    return await enrichArticles(articles, userId);
  } catch (error) {
    console.error("Failed to fetch articles by tags:", error);
    return [];
  }
}


export async function getArticlesByIds(ids: bigint[], userId?: number): Promise<Article[]> {
  const prismaContent = getPrismaContent();
  try {
    const articles = await prismaContent.articles.findMany({
      where: {
        article_id: {
          in: ids,
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
      orderBy: {
        published_at: "desc",
      },
    });
    return await enrichArticles(articles, userId);
  } catch (error) {
    return [];
  }
}

export async function countNewArticles(
  tagIds: bigint[],
  publisherIds: bigint[],
  since: Date
): Promise<number> {
  const prismaContent = getPrismaContent();
  try {
    const count = await prismaContent.articles.count({
      where: {
        AND: [
          {
            published_at: {
              gt: since,
            },
          },
          tagIds.length > 0
            ? {
              article_tag: {
                some: {
                  tag_id: {
                    in: tagIds,
                  },
                },
              },
            }
            : {},
          publisherIds.length > 0
            ? {
              publisher_id: {
                in: publisherIds,
              },
            }
            : {},
        ],
      },
    });
    return count;
  } catch (error) {
    console.error("Failed to count new articles:", error);
    return 0;
  }
}
