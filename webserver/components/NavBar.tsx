'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function NavBar({ items }: { items: string[] }) {
    const pathname = usePathname()

    if (pathname === '/profile') return null

    return (
        <nav className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm border-t border-double border-gray-200">
            <div className="container mx-auto px-4 overflow-x-auto no-scrollbar">
                <ul className="flex items-center justify-center gap-6 py-2.5 min-w-max mx-auto">
                    {items.map((item) => (
                        <li key={item}>
                            <Link
                                href={`/search?q=${encodeURIComponent(item)}`}
                                className="text-[11px] md:text-sm font-medium text-gray-700 hover:bg-gray-100 px-2 py-1 rounded transition-colors whitespace-nowrap capitalize"
                            >
                                {item}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    )
}
