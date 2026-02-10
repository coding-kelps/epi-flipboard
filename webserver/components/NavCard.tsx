'use client'

import { useAuth } from '@/components/AuthProvider'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface NavCardProps {
    title: string
    description: string
    href: string
    icon: LucideIcon
    colorClass?: string // bg color for the icon container
    iconClassName?: string
    restricted?: boolean
}

export default function NavCard({
    title,
    description,
    href,
    icon: Icon,
    colorClass = 'bg-gray-100',
    iconClassName,
    restricted = false,
}: NavCardProps) {
    const { isAuthenticated, openAuthModal } = useAuth()
    // const router = useRouter(); // unused

    const handleClick = (e: React.MouseEvent) => {
        if (restricted && !isAuthenticated) {
            e.preventDefault()
            openAuthModal()
        }
    }

    return (
        <Link href={href} onClick={handleClick} className="group block">
            <article className="flex flex-col gap-2 py-4 border-b border-gray-200 last:border-0 relative overflow-hidden">
                <div
                    className={cn(
                        'relative w-full aspect-video mb-1 overflow-hidden flex items-center justify-center rounded-sm',
                        colorClass
                    )}
                >
                    <Icon
                        className={cn(
                            'w-12 h-12 transition-transform duration-500 group-hover:scale-110',
                            iconClassName || 'text-gray-700'
                        )}
                    />
                </div>
                <h3 className="text-lg font-serif font-bold leading-snug text-gray-900 group-hover:text-gray-700">
                    {title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed font-serif">
                    {description}
                </p>
                <div className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                    <span className="uppercase tracking-wider font-medium text-gray-500">
                        Go to page
                    </span>
                </div>
            </article>
        </Link>
    )
}
