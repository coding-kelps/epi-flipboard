import { getPrismaContent } from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma-content/client";

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
