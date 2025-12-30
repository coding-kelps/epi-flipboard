'use client';

import Link from "next/link";
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
    "U.S.",
    "World",
    "Business",
    "Tech",
    "Science",
    "Health",
    "Sports",
    "Arts",
    "Books",
    "Style",
    "Food",
    "Travel",
    "Magazine",
    "T Magazine",
    "Real Estate",
    "Video",
];

export default function NavBar() {
    const pathname = usePathname();

    if (pathname === '/profile') return null;

    return (
        <nav className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm border-t border-double border-gray-200">
            <div className="container mx-auto px-4 overflow-x-auto no-scrollbar">
                <ul className="flex items-center justify-center gap-6 py-2.5 min-w-max mx-auto">
                    {NAV_ITEMS.map((item) => (
                        <li key={item}>
                            <Link
                                href={`/section/${item.toLowerCase()}`}
                                className="text-[11px] md:text-sm font-medium text-gray-700 hover:bg-gray-100 px-2 py-1 rounded transition-colors whitespace-nowrap"
                            >
                                {item}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
}
