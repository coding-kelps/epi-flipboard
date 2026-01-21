
import { getPrismaActivity } from "../lib/prisma";

async function main() {
    const prisma = getPrismaActivity();

    console.log("Verifying Feed Schema...");

    // 1. Create a feed with publisherIds
    const uniqueName = `Test Feed ${Date.now()}`;
    try {
        const feed = await prisma.feed.create({
            data: {
                name: uniqueName,
                description: "Test feed for publisher filtering",
                tagIds: [BigInt(1)], // Assuming tag 1 exists
                publisherIds: [BigInt(1)], // Assuming publisher 1 exists
                userId: 1, // Assuming user 1 exists
            },
        });

        console.log("Successfully created feed:", feed);

        if (!feed.publisherIds || feed.publisherIds.length === 0) {
            console.error("FAIL: publisherIds not saved or returned empty.");
        } else {
            console.log("PASS: publisherIds saved successfully.");
        }

        // Cleanup
        await prisma.feed.delete({
            where: { id: feed.id }
        });
        console.log("Cleanup successful.");

    } catch (error) {
        console.error("FAIL: Error creating feed:", error);
    }
}

main();
