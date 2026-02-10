import { NextRequest, NextResponse } from 'next/server'
import { getPrismaActivity } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
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

    const userId = Number(payload.userId) // userId is now Int on schema side

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
        const feed = await prismaActivity.feed.create({
            data: {
                name,
                description,
                tagIds: tagIds.map((id: number) => BigInt(id)), // Prisma expects BigInt[] for tagIds
                publisherIds: body.publisherIds
                    ? body.publisherIds.map((id: number) => BigInt(id))
                    : [],
                userId: userId,
            },
        })

        // Convert BigInts to Strings/Numbers for response
        const serializedFeed = {
            ...feed,
            tagIds: feed.tagIds.map((id) => Number(id)),
            publisherIds: feed.publisherIds.map((id) => Number(id)),
            userId: Number(feed.userId),
        }

        return NextResponse.json(serializedFeed)
    } catch (error) {
        console.error('Failed to create feed:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
