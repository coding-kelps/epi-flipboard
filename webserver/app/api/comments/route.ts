import { NextRequest, NextResponse } from 'next/server'
import { getPrismaActivity, getPrismaIdentity } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const articleId = searchParams.get('articleId')
    const countOnly = searchParams.get('count') === 'true'

    if (!articleId) {
        return NextResponse.json(
            { error: 'Missing articleId' },
            { status: 400 }
        )
    }

    const prismaActivity = getPrismaActivity()

    try {
        if (countOnly) {
            const count = await prismaActivity.comment.count({
                where: { articleId: BigInt(articleId) },
            })
            return NextResponse.json({ count })
        }

        const prismaIdentity = getPrismaIdentity()

        // 1. Fetch comments for the article
        const comments = await prismaActivity.comment.findMany({
            where: { articleId: BigInt(articleId) },
            orderBy: { createdAt: 'desc' },
        })

        if (comments.length === 0) {
            return NextResponse.json([])
        }

        // 2. Fetch User Details
        const userIds = Array.from(new Set(comments.map((c) => c.userId)))
        const users = await prismaIdentity.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, name: true, email: true },
        })

        const userMap = new Map(users.map((u) => [u.id, u]))

        // 3. Merge and Return
        const commentsWithUser = comments.map((c) => ({
            id: c.id,
            content: c.content,
            createdAt: c.createdAt,
            user: userMap.get(c.userId) || { name: 'Unknown User' },
        }))

        return NextResponse.json(commentsWithUser)
    } catch (error) {
        console.error('Failed to fetch comments:', error)
        return NextResponse.json(
            { error: 'Failed to fetch comments' },
            { status: 500 }
        )
    }
}

export async function POST(req: NextRequest) {
    const session = await getSession()
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { articleId, content } = await req.json()

        if (!articleId || !content) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const prismaActivity = getPrismaActivity()

        const comment = await prismaActivity.comment.create({
            data: {
                articleId: BigInt(articleId), // Ensure BigInt
                content,
                userId: session.user.id,
            },
        })

        const prismaIdentity = getPrismaIdentity()

        // Fetch fresh user data to ensure we have the correct name, as the token might be stale
        const user = await prismaIdentity.user.findUnique({
            where: { id: session.user.id },
        })

        return NextResponse.json({
            id: comment.id,
            content: comment.content,
            createdAt: comment.createdAt,
            user: {
                name: user?.name || session.user.name || session.user.email,
            },
        })
    } catch (error) {
        console.error('Failed to create comment:', error)
        return NextResponse.json(
            { error: 'Failed to create comment' },
            { status: 500 }
        )
    }
}
