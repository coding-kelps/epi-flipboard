import { NextResponse } from 'next/server';
import { getPrismaIdentity, getPrismaContent } from '@/lib/prisma'

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const prismaIdentity = getPrismaIdentity();
  const prismaContent = getPrismaContent();
  const verbose = request.url.includes('verbose');

  let identityDbStatus = 'unknown';

  try {
    await prismaIdentity.$queryRaw`SELECT 1`;
    identityDbStatus = 'ok';
  } catch (err) {
    identityDbStatus = 'fail';
  }

  let contentDbStatus = 'unknown';

  try {
    await prismaContent.$queryRaw`SELECT 1`;
    contentDbStatus = 'ok';
  } catch (err) {
    contentDbStatus = 'fail';
  }

  const isReady = identityDbStatus === 'ok' && contentDbStatus === 'ok';

  const response = verbose
    ? {
      status: isReady ? 'ready' : 'not ready',
      checks: {
        identityDb: identityDbStatus,
        contentDb: contentDbStatus,
      },
    }
    : { status: isReady ? 'ready' : 'not ready' };

  return NextResponse.json(response, { status: isReady ? 200 : 503 });
}
