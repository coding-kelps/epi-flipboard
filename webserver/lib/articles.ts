
import { getPrismaContent } from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma-content/client";
import { trace } from '@opentelemetry/api';

export type Article = Prisma.articlesGetPayload<{
  include: { publishers: true; article_tag: true };
}>;

export async function getArticles(): Promise<Article[]> {
  const prismaContent = getPrismaContent();
  try {
    const articles = await prismaContent.articles.findMany({
      include: {
        publishers: true,
        article_tag: true,
      },
      orderBy: {
        published_at: "desc",
      },
      take: 25,
    });
    return articles;
  } catch (error) {
    console.error("Failed to fetch articles:", error);
    return [];
  }
}

export async function searchArticles(query: string): Promise<Article[]> {
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
          article_tag: true,
        },
        orderBy: {
          published_at: "desc",
        },
        take: 25,
      });
      span.setAttribute('search.results_count', articles.length);
      return articles;
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
