
import { NextRequest, NextResponse } from 'next/server';
import { getPrismaContent } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('q');
    const idsParam = searchParams.get('ids');

    const prismaContent = getPrismaContent();

    if (idsParam) {
        const ids = idsParam.split(',').map(id => Number(id)).filter(id => !isNaN(id));
        if (ids.length === 0) return NextResponse.json([]);

        const tags = await prismaContent.tags.findMany({
            where: {
                tag_id: { in: ids.map(id => BigInt(id)) }
            }
        });

        // Map BigInt to Number
        const formattedTags = tags.map(tag => ({
            tag_id: Number(tag.tag_id),
            name: tag.name,
        }));
        return NextResponse.json(formattedTags);
    }

    if (!query || query.length < 2) {
        return NextResponse.json([]);
    }

    const tags = await prismaContent.tags.findMany({
        where: {
            name: {
                contains: query,
                mode: 'insensitive',
            },
        },
        take: 10,
        select: {
            tag_id: true,
            name: true,
        }
    });

    // Map BigInt to Number for JSON response. 
    // Assuming tag_id fits in Javascript Number safely (it usually does for auto-increment keys unless massive)
    const formattedTags = tags.map(tag => ({
        tag_id: Number(tag.tag_id),
        name: tag.name,
    }));

    return NextResponse.json(formattedTags);
}
