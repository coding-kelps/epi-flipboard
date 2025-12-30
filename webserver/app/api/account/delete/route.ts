
import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { trace, SpanStatusCode } from '@opentelemetry/api';

export async function DELETE(req: NextRequest) {
    const span = trace.getActiveSpan();
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
        span?.addEvent('user.delete_account_failed', { reason: 'not_authenticated' });
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
        span?.addEvent('user.delete_account_failed', { reason: 'invalid_token' });
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await req.json();
    const { confirmationEmail } = body;

    span?.addEvent('user.delete_account_attempt', { userId: payload.userId, confirmationEmail });

    if (!confirmationEmail) {
        return NextResponse.json({ error: 'Confirmation email is required' }, { status: 400 });
    }

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
        where: { id: payload.userId },
    });

    if (!user) {
        // Should logically not happen if token is valid, but good to check
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.email !== confirmationEmail) {
        span?.addEvent('user.delete_account_failed', { reason: 'email_mismatch', userId: payload.userId });
        return NextResponse.json({ error: 'Email confirmation does not match' }, { status: 403 });
    }

    try {
        await prisma.user.delete({
            where: { id: user.id },
        });

        cookieStore.delete('auth_token');
        span?.addEvent('user.deleted', { userId: payload.userId });

        return NextResponse.json({ success: true, message: 'Account deleted' });
    } catch (error) {
        span?.recordException(error as Error);
        span?.setStatus({ code: SpanStatusCode.ERROR, message: 'Deletion failed' });
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
