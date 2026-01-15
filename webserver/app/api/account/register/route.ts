import { NextRequest, NextResponse } from 'next/server';
import { getPrismaIdentity } from '@/lib/prisma';
import { hashPassword, signToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { trace, SpanStatusCode } from '@opentelemetry/api';

export async function POST(req: NextRequest) {
    const span = trace.getActiveSpan();
    try {
        const body = await req.json();
        const { email, password, name } = body;
        const prismaIdentity = getPrismaIdentity();

        span?.addEvent('user.registration_attempt', { email });

        if (!email || !password) {
            span?.addEvent('user.registration_failed', { reason: 'missing_fields' });
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        span?.addEvent('user.debug_prisma_keys', { keys: Object.keys(prismaIdentity) });
        span?.addEvent('user.debug_prisma_user_model', { user: (prismaIdentity as any).user });

        const existingUser = await prismaIdentity.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            span?.addEvent('user.registration_failed', { reason: 'email_taken', email });
            return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
        }

        const hashedPassword = await hashPassword(password);

        const user = await prismaIdentity.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                emailVerified: false,
            },
        });

        const token = signToken({ userId: user.id, email: user.email });

        const cookieStore = await cookies();
        cookieStore.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
        });

        span?.addEvent('user.registered', { userId: user.id, email: user.email });

        return NextResponse.json({
            user: { id: user.id, email: user.email, name: user.name },
            token
        }, { status: 201 });

    } catch (error) {
        span?.recordException(error as Error);
        span?.setStatus({ code: SpanStatusCode.ERROR, message: 'Registration failed' });
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
