import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma'

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const prisma = getPrisma();
  const verbose = request.url.includes('verbose');

  let dbStatus = 'unknown';

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'ok';
  } catch (err) {
    dbStatus = 'fail';
  }

  const isReady = dbStatus === 'ok';

  const response = verbose
    ? {
        status: isReady ? 'ready' : 'not ready',
        checks: {
          database: dbStatus,
        },
      }
    : { status: isReady ? 'ready' : 'not ready' };

  return NextResponse.json(response, { status: isReady ? 200 : 503 });
}
