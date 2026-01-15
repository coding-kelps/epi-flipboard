
import { getPrismaContent } from "@/lib/prisma";
import NavBar from "./NavBar";

export default async function NavBarContainer() {
    const prisma = getPrismaContent();
    const tags = await prisma.tags.findMany({
        orderBy: {
            created_at: 'desc',
        },
        take: 10,
    });

    const tagNames = tags.map((tag) => tag.name);

    return <NavBar items={tagNames} />;
}
