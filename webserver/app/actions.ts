'use server'

import { getSession } from "@/lib/auth";
import { getPrismaActivity } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleFollowFeed(feedId: number) {
    const session = await getSession();
    if (!session || !session.user) {
        throw new Error("Unauthorized");
    }

    const userId = Number(session.user.id);
    const prisma = getPrismaActivity();

    const existingFollow = await prisma.followedFeed.findUnique({
        where: {
            userId_feedId: {
                userId,
                feedId
            }
        }
    });

    if (existingFollow) {
        await prisma.followedFeed.delete({
            where: {
                id: existingFollow.id
            }
        });
    } else {
        await prisma.followedFeed.create({
            data: {
                userId,
                feedId
            }
        });
    }

    revalidatePath(`/feeds/${feedId}`);
    return !existingFollow; // Returns true if following, false if unfollowed
}


export async function searchFeeds(query: string, limit: number = 20) {
    const prisma = getPrismaActivity();

    if (!query || query.trim() === '') {
        // If empty query, return latest feeds? Or popular?
        // Let's return latest feeds for exploration if query is empty
        const feeds = await prisma.feed.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            take: limit
        });
        return feeds.map(feed => ({
            ...feed,
            tagIds: feed.tagIds.map(id => Number(id)),
            publisherIds: feed.publisherIds.map(id => Number(id)),
            createdAt: feed.createdAt.toISOString()
        }));
    }

    const feeds = await prisma.feed.findMany({
        where: {
            OR: [
                {
                    name: {
                        contains: query,
                        mode: 'insensitive'
                    }
                },
                {
                    description: {
                        contains: query,
                        mode: 'insensitive'
                    }
                }
            ]
        },
        take: limit
    });

    return feeds.map(feed => ({
        ...feed,
        tagIds: feed.tagIds.map(id => Number(id)),
        publisherIds: feed.publisherIds.map(id => Number(id)),
        createdAt: feed.createdAt.toISOString()
    }));
}

export async function getIsFollowingFeed(feedId: number) {
    const session = await getSession();
    if (!session || !session.user) {
        return false;
    }

    const userId = Number(session.user.id);
    const prisma = getPrismaActivity();

    const follow = await prisma.followedFeed.findUnique({
        where: {
            userId_feedId: {
                userId,
                feedId
            }
        }
    });

    return !!follow;
}
