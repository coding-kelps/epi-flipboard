import { NextRequest, NextResponse } from 'next/server'
import { getPrismaActivity } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ feedId: string }> }
) {
    const { feedId } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value

    if (!token) {
        return NextResponse.json(
            { error: 'Not authenticated' },
            { status: 401 }
        )
    }

    const payload = verifyToken(token)
    if (!payload || typeof payload === 'string' || !payload.userId) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const userId = Number(payload.userId)

    try {
        const body = await req.json()
        const { name, description, tagIds } = body

        if (!name) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const prismaActivity = getPrismaActivity()

        // 1. Verify ownership
        const existingFeed = await prismaActivity.feed.findUnique({
            where: { id: Number(feedId) },
        })

        if (!existingFeed) {
            return NextResponse.json(
                { error: 'Feed not found' },
                { status: 404 }
            )
        }

        if (existingFeed.userId !== userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        // 2. Update
        const updatedFeed = await prismaActivity.feed.update({
            where: { id: Number(feedId) },
            data: {
                name,
                description,
                tagIds: tagIds.map((id: number) => BigInt(id)),
                publisherIds: body.publisherIds
                    ? body.publisherIds.map((id: number) => BigInt(id))
                    : [],
            },
        })

        // Serialize
        return NextResponse.json({
            ...updatedFeed,
            tagIds: updatedFeed.tagIds.map((id) => Number(id)),
            publisherIds: updatedFeed.publisherIds.map((id) => Number(id)),
            userId: Number(updatedFeed.userId),
        })
    } catch (error) {
        console.error('Failed to update feed:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ feedId: string }> }
) {
    const { feedId } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value

    if (!token) {
        return NextResponse.json(
            { error: 'Not authenticated' },
            { status: 401 }
        )
    }

    const payload = verifyToken(token)
    if (!payload || typeof payload === 'string' || !payload.userId) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const userId = Number(payload.userId)

    try {
        const prismaActivity = getPrismaActivity()

        // 1. Verify ownership
        const existingFeed = await prismaActivity.feed.findUnique({
            where: { id: Number(feedId) },
        })

        if (!existingFeed) {
            return NextResponse.json(
                { error: 'Feed not found' },
                { status: 404 }
            )
        }

        if (existingFeed.userId !== userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        // 2. Delete
        await prismaActivity.feed.delete({
            where: { id: Number(feedId) },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Failed to delete feed:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
