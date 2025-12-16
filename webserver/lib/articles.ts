import { getPrisma } from "./prisma";
import { Prisma } from "../app/generated/prisma/client";

export type Article = Prisma.ArticleGetPayload<{
  include: { publisher: true; tags: true };
}>;

export async function getArticles(): Promise<Article[]> {
  const prisma = getPrisma();
  try {
    const articles = await prisma.article.findMany({
      include: {
        publisher: true,
        tags: true,
      },
      orderBy: {
        publishedAt: "desc",
      },
      take: 25,
    });
    return articles;
  } catch (error) {
    console.error("Failed to fetch articles:", error);
    return [];
  }
}