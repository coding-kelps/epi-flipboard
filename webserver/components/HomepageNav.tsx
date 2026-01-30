"use client";

import NavCard from "@/components/NavCard";
import { Compass, Rss, Bookmark, History } from "lucide-react";

export default function HomepageNav() {
    return (
        <div className="flex flex-col gap-7">
            <NavCard
                title="Explore"
                description="Discover new feeds."
                href="/explore"
                icon={Compass}
                colorClass="bg-gray-100"
                iconClassName="text-gray-700"
            />
            <NavCard
                title="My Feeds"
                description="Manage your personal feeds."
                href="/feeds"
                icon={Rss}
                colorClass="bg-gray-100"
                iconClassName="text-gray-700"
                restricted
            />
            <NavCard
                title="Saved"
                description="Read your bookmarked stories."
                href="/saved"
                icon={Bookmark}
                colorClass="bg-gray-100"
                iconClassName="text-gray-700"
                restricted
            />
            <NavCard
                title="History"
                description="Review your reading history."
                href="/history"
                icon={History}
                colorClass="bg-gray-100"
                iconClassName="text-gray-700"
                restricted
            />
        </div>
    );
}
