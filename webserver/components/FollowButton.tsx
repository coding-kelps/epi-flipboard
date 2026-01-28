'use client';

import { useState, useTransition } from 'react';
import { toggleFollowFeed } from '@/app/actions';

interface FollowButtonProps {
    feedId: number;
    initialIsFollowing: boolean;
}

export default function FollowButton({ feedId, initialIsFollowing }: FollowButtonProps) {
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [isPending, startTransition] = useTransition();

    const handleToggle = async () => {
        // Optimistic update
        setIsFollowing(!isFollowing);

        startTransition(async () => {
            try {
                await toggleFollowFeed(feedId);
            } catch (error) {
                // Revert on error
                setIsFollowing(initialIsFollowing);
                console.error('Failed to toggle follow status', error);
            }
        });
    };

    return (
        <button
            onClick={handleToggle}
            disabled={isPending}
            className={`px-4 py-2 rounded-full font-bold text-sm transition-colors ${isFollowing
                    ? 'bg-gray-200 text-black hover:bg-gray-300'
                    : 'bg-black text-white hover:bg-gray-800'
                }`}
        >
            {isFollowing ? 'Following' : 'Follow'}
        </button>
    );
}
