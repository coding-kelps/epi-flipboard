'use client';

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { FollowedFeedWithMetadata } from "@/lib/feed-activity";

export default function FeedUpdateItem({ feed }: { feed: FollowedFeedWithMetadata }) {
    const { isAuthenticated, openAuthModal } = useAuth();

    const handleClick = (e: React.MouseEvent) => {
        if (!isAuthenticated) {
            e.preventDefault();
            openAuthModal();
        }
    };

    return (
        <Link href={`/feeds/${feed.id}`} onClick={handleClick} className="group block">
            <div className="flex flex-col gap-1">
                <span className="font-serif font-bold text-lg group-hover:text-red-700 transition-colors">
                    {feed.name}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    {feed.newArticlesCount} new articles
                </span>
            </div>
        </Link>
    );
}
