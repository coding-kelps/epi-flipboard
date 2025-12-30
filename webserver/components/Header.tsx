'use client';

import Link from "next/link";
import { Search, User as UserIcon } from "lucide-react";
import { useState } from "react";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/components/AuthProvider";

export default function Header() {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const { user } = useAuth();

    const currentDate = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });


    return (
        <header className="flex flex-col border-b border-gray-300 bg-white">
            <div className="container mx-auto px-4 py-4 grid grid-cols-1 md:grid-cols-3 items-center relative gap-4 md:gap-0">

                <div className="flex flex-col items-start gap-3 order-2 md:order-1">
                    <button className="p-2 -ml-2 hover:bg-gray-100 rounded-full" aria-label="Search">
                        <Search className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="text-xs font-bold text-gray-700">{currentDate}</div>
                        <div className="hidden md:block text-xs text-gray-500">Today’s News</div>
                    </div>
                </div>

                <div className="order-1 md:order-2 text-center w-full">
                    <Link href="/" className="inline-block group w-full">
                        {/* Fluid text size to prevent cropping: starts at 10vw on mobile, caps at 6xl size approx */}
                        <h1 className="font-gothic text-[11vw] md:text-6xl lg:text-7xl font-black tracking-tight text-gray-900 group-hover:opacity-90 transition-opacity whitespace-nowrap overflow-hidden text-ellipsis md:overflow-visible">
                            Epi FlipBoard
                        </h1>
                    </Link>
                </div>

                <div className="flex items-center gap-4 order-3 justify-center md:justify-end">
                    {user ? (
                        <Link href="/profile" className="flex items-center gap-2 text-sm font-medium text-gray-900 hover:text-gray-700">
                            <UserIcon className="w-5 h-5" />
                            {user.name || 'Profile'}
                        </Link>
                    ) : (
                        <button
                            onClick={() => setIsAuthModalOpen(true)}
                            className="bg-black text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-800 transition-colors"
                        >
                            Login / Sign up
                        </button>
                    )}
                </div>
            </div>
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </header>
    );
}
