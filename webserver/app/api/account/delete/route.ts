import { NextRequest, NextResponse } from 'next/server'
import { getPrismaIdentity, getPrismaActivity } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import { trace, SpanStatusCode } from '@opentelemetry/api'

export async function DELETE(req: NextRequest) {
    const span = trace.getActiveSpan()
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value

    if (!token) {
        span?.addEvent('user.delete_account_failed', {
            reason: 'not_authenticated',
        })
        return NextResponse.json(
            { error: 'Not authenticated' },
            { status: 401 }
        )
    }

    const payload = verifyToken(token)
    if (!payload || typeof payload === 'string' || !payload.userId) {
        span?.addEvent('user.delete_account_failed', {
            reason: 'invalid_token',
        })
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await req.json()
    const { confirmationEmail } = body

    span?.addEvent('user.delete_account_attempt', {
        userId: payload.userId,
        confirmationEmail,
    })

    if (!confirmationEmail) {
        return NextResponse.json(
            { error: 'Confirmation email is required' },
            { status: 400 }
        )
    }

    const prismaIdentity = getPrismaIdentity()
    const user = await prismaIdentity.user.findUnique({
        where: { id: payload.userId },
    })

    if (!user) {
        // Should logically not happen if token is valid, but good to check
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.email !== confirmationEmail) {
        span?.addEvent('user.delete_account_failed', {
            reason: 'email_mismatch',
            userId: payload.userId,
        })
        return NextResponse.json(
            { error: 'Email confirmation does not match' },
            { status: 403 }
        )
    }

    try {
        const prismaActivity = getPrismaActivity()

        // 1. Get all feeds created by the user to find followers
        const userFeeds = await prismaActivity.feed.findMany({
            where: { userId: payload.userId },
            select: { id: true },
        })
        const userFeedIds = userFeeds.map((f) => f.id)

        // 2. Remove followers of the user's feeds
        if (userFeedIds.length > 0) {
            await prismaActivity.followedFeed.deleteMany({
                where: { feedId: { in: userFeedIds } },
            })
        }

        // 3. Delete the user's feeds
        await prismaActivity.feed.deleteMany({
            where: { userId: payload.userId },
        })

        // 4. Delete the user's following status (feeds they follow)
        await prismaActivity.followedFeed.deleteMany({
            where: { userId: payload.userId },
        })

        // 5. Delete the user's comments
        await prismaActivity.comment.deleteMany({
            where: { userId: payload.userId },
        })

        // 6. Delete the user's reading history
        await prismaActivity.readingHistory.deleteMany({
            where: { userId: payload.userId },
        })

        // 7. Delete the user's marked (saved) articles
        await prismaActivity.markedArticle.deleteMany({
            where: { userId: payload.userId },
        })

        // 8. Finally, delete the user account
        await prismaIdentity.user.delete({
            where: { id: user.id },
        })

        cookieStore.delete('auth_token')
        span?.addEvent('user.deleted', { userId: payload.userId })

        return NextResponse.json({ success: true, message: 'Account deleted' })
    } catch (error) {
        console.error('Error deleting account:', error)
        span?.recordException(error as Error)
        span?.setStatus({
            code: SpanStatusCode.ERROR,
            message: 'Deletion failed',
        })
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
