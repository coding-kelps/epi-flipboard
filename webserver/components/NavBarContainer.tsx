import { getPrismaContent } from '@/lib/prisma'
import NavBar from './NavBar'

export default async function NavBarContainer() {
    try {
        const prisma = getPrismaContent()
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000) // eslint-disable-line react-hooks/purity
        const topTags = await prisma.article_tag.groupBy({
            by: ['tag_id'],
            where: {
                articles: {
                    published_at: {
                        gte: oneDayAgo,
                    },
                },
            },
            _count: {
                article_id: true,
            },
            orderBy: {
                _count: {
                    article_id: 'desc',
                },
            },
            take: 10,
        })

        const tagIds = topTags.map((t) => t.tag_id)

        const tags = await prisma.tags.findMany({
            where: {
                tag_id: { in: tagIds },
            },
            select: {
                tag_id: true,
                name: true,
            },
        })

        const tagNames = topTags.map(
            (t) => tags.find((tag) => tag.tag_id === t.tag_id)!.name
        )

        return <NavBar items={tagNames} />
    } catch {
        return null
    }
}
