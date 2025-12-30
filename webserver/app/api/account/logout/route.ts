
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { trace } from '@opentelemetry/api';

export async function POST() {
    const span = trace.getActiveSpan();
    span?.addEvent('user.logout');

    const cookieStore = await cookies();
    cookieStore.delete('auth_token');
    return NextResponse.json({ success: true });
}
