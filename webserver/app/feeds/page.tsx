
import { getPrismaActivity } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
// Actually, since the modal is client side, we can just wrap the button and modal in a Client Component.
import FeedsClientWrapper from "@/components/FeedsClientWrapper";
import AuthGuard from "@/components/AuthGuard";
import { Newspaper } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

async function getUserFeeds() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload || typeof payload === 'string' || !payload.userId) return null;

    const prismaActivity = getPrismaActivity();
    const feeds = await prismaActivity.feed.findMany({
        where: {
            userId: Number(payload.userId),
        },
        orderBy: {
            createdAt: 'desc',
        }
    });

    return feeds;
}

export default async function FeedsPage() {
    const feeds = await getUserFeeds();

    // If no feeds (likely unauthenticated), we pass empty array.
    // AuthGuard will handle the popup.
    const safeFeeds = feeds || [];

    // Serialize dates and BigInts for client use
    const serializedFeeds = safeFeeds.map(feed => ({
        ...feed,
        tagIds: feed.tagIds.map(id => Number(id)),
        publisherIds: feed.publisherIds.map(id => Number(id)),
        userId: Number(feed.userId),
        createdAt: feed.createdAt.toISOString(),
    }));

    return (
        <AuthGuard>
            <div className="container mx-auto px-4 py-8">
                <FeedsClientWrapper initialFeeds={serializedFeeds} />
            </div>
        </AuthGuard>
    );
}
