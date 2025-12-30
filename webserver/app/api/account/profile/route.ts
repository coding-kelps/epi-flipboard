
import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { trace } from '@opentelemetry/api';

export async function GET(req: NextRequest) {
    const span = trace.getActiveSpan();
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    span?.addEvent('user.profile_view', { userId: payload.userId });

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
        }
    });

    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
}

export async function PUT(req: NextRequest) {
    const span = trace.getActiveSpan();
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await req.json();
    const { name } = body;

    span?.addEvent('user.profile_update', { userId: payload.userId, name });

    const prisma = getPrisma();
    const user = await prisma.user.update({
        where: { id: payload.userId },
        data: { name },
        select: {
            id: true,
            email: true,
            name: true,
        }
    });

    return NextResponse.json({ user });
}
