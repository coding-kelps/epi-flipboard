import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getPrismaActivity } from '@/lib/prisma'

export async function POST(req: NextRequest) {
    try {
        const activityPrisma = getPrismaActivity()
        const session = await getSession()
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { articleId } = await req.json()

        if (!articleId) {
            return NextResponse.json(
                { error: 'Article ID is required' },
                { status: 400 }
            )
        }

        // Upsert to update readAt if already exists, or insert new
        // But requirement says "history list", implying order.
        // If I read again, does it jump to top? Usually yes.
        // However, schema doesn't have unique constraint on [userId, articleId] for ReadingHistory?
        // Let's check schema again.

        // I defined:
        // model ReadingHistory {
        //   id        Int      @id @default(autoincrement())
        //   userId    Int      @map("user_id")
        //   articleId BigInt   @map("article_id")
        //   readAt    DateTime @default(now()) @map("read_at")
        //   ...
        // }

        // If I want to avoid duplicates and just update timestamp, I should find first.
        // Or I can just insert new record for every read (history log).
        // "User should be able to retrieve their previously read articles from an history list."
        // Usually a history list has unique articles, most recently read at top.
        // If I read same article twice, it should probably move to top.

        // Let's check if we should enforce uniqueness.
        // If I strictly follow a "log", I insert.
        // But for a "list of read articles", usually we don't want duplicates in the UI.
        // Current schema I added NO unique constraint on user+article.

        // I will check if entry exists.
        const existing = await activityPrisma.readingHistory.findFirst({
            where: {
                userId: session.user.id,
                articleId: BigInt(articleId),
            },
        })

        if (existing) {
            // Update readAt
            await activityPrisma.readingHistory.update({
                where: { id: existing.id },
                data: { readAt: new Date() },
            })
        } else {
            await activityPrisma.readingHistory.create({
                data: {
                    userId: session.user.id,
                    articleId: BigInt(articleId),
                    readAt: new Date(),
                },
            })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error recording reading history:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
