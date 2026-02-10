import { NextRequest, NextResponse } from 'next/server'
import { getPrismaActivity } from '@/lib/prisma'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { userId, articleId, action } = body
        const prismaActivity = getPrismaActivity()

        if (!userId || !articleId || !action) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const userIdInt = parseInt(userId)
        const articleIdBigInt = BigInt(articleId)

        if (action === 'mark') {
            const marked = await prismaActivity.markedArticle.create({
                data: {
                    userId: userIdInt,
                    articleId: articleIdBigInt,
                },
            })
            // Convert BigInt to string for JSON serialization
            return NextResponse.json({
                success: true,
                data: {
                    ...marked,
                    articleId: marked.articleId.toString(),
                },
            })
        } else if (action === 'unmark') {
            await prismaActivity.markedArticle.deleteMany({
                where: {
                    userId: userIdInt,
                    articleId: articleIdBigInt,
                },
            })
            return NextResponse.json({ success: true })
        } else {
            return NextResponse.json(
                { error: 'Invalid action' },
                { status: 400 }
            )
        }
    } catch (error) {
        console.error('Error marking article:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
