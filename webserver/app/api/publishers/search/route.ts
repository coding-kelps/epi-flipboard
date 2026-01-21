
import { NextRequest, NextResponse } from 'next/server';
import { getPrismaContent } from '@/lib/prisma';
import { trace } from '@opentelemetry/api';

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('q');
    const ids = searchParams.get('ids');

    const prismaContent = getPrismaContent();
    const tracer = trace.getTracer('epi-flipboard-webserver');

    return tracer.startActiveSpan('searchPublishers', async (span) => {
        try {
            if (ids) {
                const idList = ids.split(',').map(id => BigInt(id));
                const publishers = await prismaContent.publishers.findMany({
                    where: {
                        publisher_id: { in: idList }
                    },
                    select: {
                        publisher_id: true,
                        name: true,
                        display_name: true,
                    }
                });

                // Map to client friendly struct
                const mapped = publishers.map(p => ({
                    publisher_id: p.publisher_id.toString(),
                    name: p.display_name || p.name
                }));

                return NextResponse.json(mapped);
            }

            if (!query || query.length < 2) {
                return NextResponse.json([]);
            }

            span.setAttribute('search.query', query);
            const publishers = await prismaContent.publishers.findMany({
                where: {
                    OR: [
                        { name: { contains: query, mode: 'insensitive' } },
                        { display_name: { contains: query, mode: 'insensitive' } }
                    ]
                },
                take: 10,
                select: {
                    publisher_id: true,
                    name: true,
                    display_name: true,
                }
            });

            span.setAttribute('search.results_count', publishers.length);

            const mapped = publishers.map(p => ({
                publisher_id: p.publisher_id.toString(),
                name: p.display_name || p.name
            }));

            return NextResponse.json(mapped);
        } catch (error) {
            if (error instanceof Error) {
                span.recordException(error);
            }
            console.error("Failed to search publishers:", error);
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        } finally {
            span.end();
        }
    });
}
