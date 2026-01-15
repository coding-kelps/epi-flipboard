
import { NextRequest, NextResponse } from 'next/server';
import { getPrismaIdentity } from '@/lib/prisma';
import { comparePassword, signToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { trace, SpanStatusCode } from '@opentelemetry/api';

export async function POST(req: NextRequest) {
    const span = trace.getActiveSpan();
    try {
        const body = await req.json();
        const { email, password } = body;
        const prismaIdentity = getPrismaIdentity();

        span?.addEvent('user.login_attempt', { email });

        if (!email || !password) {
            span?.addEvent('user.login_failed', { reason: 'missing_fields' });
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        const user = await prismaIdentity.user.findUnique({
            where: { email },
        });

        if (!user) {
            span?.addEvent('user.login_failed', { reason: 'user_not_found', email });
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const isValid = await comparePassword(password, user.password);

        if (!isValid) {
            span?.addEvent('user.login_failed', { reason: 'invalid_password', email });
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const token = signToken({ userId: user.id, email: user.email });

        const cookieStore = await cookies();
        cookieStore.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
        });

        span?.addEvent('user.logged_in', { userId: user.id, email: user.email });

        return NextResponse.json({
            user: { id: user.id, email: user.email, name: user.name },
            token
        });

    } catch (error) {
        span?.recordException(error as Error);
        span?.setStatus({ code: SpanStatusCode.ERROR, message: 'Login failed' });
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
